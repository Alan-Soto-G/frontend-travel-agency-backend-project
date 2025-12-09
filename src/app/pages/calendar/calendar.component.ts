import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/authentication/auth.service';

interface GoogleEvent {
  id?: string;
  summary?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
}

interface CalendarDay {
  day: number | string;
  date?: string;
  disabled: boolean;
  isToday?: boolean;
  events?: GoogleEvent[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  isConnected = false;
  selectedDate: string = '';
  selectedTime: string = '';
  summary: string = '';
  availableSlots: string[] = [];
  events: GoogleEvent[] = [];
  selectedDayEvents: GoogleEvent[] = [];
  
  // Calendar View Properties
  currentMonth: Date = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  businessHoursStart = 9;
  businessHoursEnd = 17;

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.checkGoogleConnection();
    this.generateCalendar();
  }

  checkGoogleConnection() {
    const token = this.cookieService.get('calendar_token');
    if (token) {
      this.isConnected = true;
      this.fetchMonthEvents();
    }
  }

  async connectGoogleCalendar() {
    const success = await this.authService.linkGoogleCalendar();
    if (success) {
      this.isConnected = true;
      this.fetchMonthEvents();
    }
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
      this.calendarDays.push({ day: '', disabled: true, events: [] });
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
        isToday: this.isToday(date),
        events: []
      });
    }
  }

  changeMonth(offset: number) {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + offset));
    this.generateCalendar();
    if (this.isConnected) {
      this.fetchMonthEvents();
    }
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

  // ==========================================
  // GOOGLE CALENDAR LOGIC
  // ==========================================

  fetchMonthEvents() {
    const token = this.cookieService.get('calendar_token');
    if (!token) return;

    const startOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const endOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0, 23, 59, 59);

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfMonth.toISOString()}&timeMax=${endOfMonth.toISOString()}&singleEvents=true`;

    this.http.get<any>(url, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` })
    }).subscribe({
      next: (response) => {
        this.events = response.items || [];
        this.markDaysWithEvents();
        if (this.selectedDate) {
          this.updateSelectedDayEvents();
          this.generateSlots();
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.isConnected = false;
          this.cookieService.delete('calendar_token');
        }
      }
    });
  }

  markDaysWithEvents() {
    this.calendarDays.forEach(day => {
      if (!day.disabled) {
        // Filtrar eventos que caen en este día
        day.events = this.events.filter(event => {
          const eventDate = event.start.dateTime ? event.start.dateTime.split('T')[0] : event.start.date;
          return eventDate === day.date;
        });
        // Ordenar por hora
        day.events.sort((a, b) => {
          const t1 = a.start.dateTime || a.start.date || '';
          const t2 = b.start.dateTime || b.start.date || '';
          return t1.localeCompare(t2);
        });
      } else {
        day.events = [];
      }
    });
  }

  selectDate(day: any) {
    if (day.disabled) return;
    this.selectedDate = day.date;
    this.updateSelectedDayEvents();
    this.generateSlots();
  }

  updateSelectedDayEvents() {
    if (!this.selectedDate) {
      this.selectedDayEvents = [];
      return;
    }
    this.selectedDayEvents = this.events.filter(event => {
      const eventStart = event.start.dateTime || event.start.date;
      return eventStart.startsWith(this.selectedDate);
    }).sort((a, b) => {
      const t1 = a.start.dateTime || a.start.date;
      const t2 = b.start.dateTime || b.start.date;
      return t1.localeCompare(t2);
    });
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

        if (!this.isTimeBlocked(timeString)) {
          this.availableSlots.push(timeString);
        }
      }
    }
  }

  isTimeBlocked(timeSlot: string): boolean {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotStart = new Date(this.selectedDate);
    slotStart.setHours(hours, minutes, 0, 0);
    
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotStart.getMinutes() + 20);

    return this.events.some(event => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventEnd = new Date(event.end.dateTime || event.end.date);
      return (slotStart < eventEnd && slotEnd > eventStart);
    });
  }

  selectSlot(time: string) {
    this.selectedTime = time;
  }

  scheduleAppointment() {
    if (!this.selectedDate || !this.selectedTime || !this.summary) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    // Aquí iría la lógica para crear el evento en Google Calendar si tuviéramos el scope de escritura
    // O enviarlo al backend
    
    alert(`Cita agendada para el ${this.selectedDate} a las ${this.selectedTime}`);
    this.selectedTime = '';
    this.summary = '';
  }
}
