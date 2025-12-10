import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/authentication/auth.service';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

interface CalendarDay {
  day: number | string;
  date?: string;
  disabled: boolean;
  isToday?: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  selectedDate: string = '';
  selectedTime: string = '';
  summary: string = '';
  availableSlots: string[] = [];
  
  // Calendar View Properties
  currentMonth: Date = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  businessHoursStart = 9;
  businessHoursEnd = 17;

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private cookieService: CookieService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.generateCalendar();
  }

  // ==========================================
  // CALENDAR VIEW LOGIC
  // ==========================================

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday
    
    this.calendarDays = [];
    
    // Previous month filler
    for (let i = 0; i < startingDay; i++) {
      this.calendarDays.push({ day: '', disabled: true });
    }
    
    // Current month days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = this.formatDate(date);
      
      // Disable past dates
      const isPast = date < today;

      this.calendarDays.push({
        day: i,
        date: dateStr,
        disabled: isPast,
        isToday: this.isToday(date)
      });
    }
  }

  changeMonth(offset: number) {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + offset));
    this.generateCalendar();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  selectDate(day: any) {
    if (day.disabled) return;
    this.selectedDate = day.date;
    this.generateSlots();
  }

  // ==========================================
  // SLOTS & SCHEDULING
  // ==========================================

  generateSlots() {
    if (!this.selectedDate) return;

    const now = new Date();
    const isToday = this.selectedDate === this.formatDate(now);

    this.availableSlots = [];
    for (let hour = this.businessHoursStart; hour < this.businessHoursEnd; hour++) {
      for (let min = 0; min < 60; min += 20) {
        const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        
        // Check if slot is in the past (if today)
        if (isToday) {
          const [slotHour, slotMin] = timeString.split(':').map(Number);
          const slotTime = new Date(now);
          slotTime.setHours(slotHour, slotMin, 0, 0);
          if (slotTime < now) {
            continue;
          }
        }

        this.availableSlots.push(timeString);
      }
    }
  }

  selectSlot(time: string) {
    this.selectedTime = time;
  }

  scheduleAppointment() {
    if (!this.selectedDate || !this.selectedTime) {
      this.toastr.warning('Por favor selecciona fecha y hora');
      return;
    }

    // Get User Info
    const userStr = localStorage.getItem('user');
    let name = 'Usuario';
    let email = 'no-email@example.com';

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        name = user.firstName || user.name || user.displayName || 'Usuario';
        email = user.email || 'no-email@example.com';
      } catch (e) {
        console.error('Error parsing user', e);
      }
    }

    // Construct Start and End Dates
    const [hours, minutes] = this.selectedTime.split(':').map(Number);
    const startDate = new Date(this.selectedDate);
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + 20); // 20 min duration

    const body = {
      name: name,
      email: email,
      start: this.formatDateWithOffset(startDate),
      end: this.formatDateWithOffset(endDate)
    };

    const token = this.cookieService.get('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(`${environment.webhookUrl}/program-date`, body, { headers }).subscribe({
      next: (res) => {
        this.toastr.success('Cita agendada correctamente');
        this.selectedTime = '';
        this.summary = '';
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error al agendar la cita');
      }
    });
  }

  formatDateWithOffset(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const pad3 = (n: number) => n.toString().padStart(3, '0');
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const ms = pad3(date.getMilliseconds());
    
    const timezoneOffset = -date.getTimezoneOffset();
    const sign = timezoneOffset >= 0 ? '+' : '-';
    const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60));
    const offsetMinutes = pad(Math.abs(timezoneOffset) % 60);
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}${sign}${offsetHours}:${offsetMinutes}`;
  }
}
