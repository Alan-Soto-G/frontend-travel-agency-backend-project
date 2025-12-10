import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import lottie, { AnimationItem } from 'lottie-web';
import { TtsAzureService } from '../../services/chat-bot/tts-azure.service';

interface Message {
  text: string;
  sender: 'bot' | 'user';
  time: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('lottieContainer') lottieContainer!: ElementRef;

  isOpen = false;
  isMinimized = false;
  animationItem: AnimationItem | null = null;
  topic: 'general' | 'policies' = 'general';
  userMessage = '';
  messages: Message[] = [];
  userName: string = 'Usuario';

  constructor(private http: HttpClient, private cookieService: CookieService, private tts: TtsAzureService) {}

  ngOnInit(): void {
    this.loadUserName();
    this.messages = [
      { text: `Hola ${this.userName}! ¿En qué puedo ayudarte hoy?`, sender: 'bot', time: new Date() }
    ];
  }

  loadUserName(): void {
    const userStr = localStorage.getItem('user');
    const token = this.cookieService.get('token'); 

    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        this.userName = user.firstName || user.name || user.displayName || 'Usuario';
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        this.userName = 'Usuario';
      }
    } else {
      this.userName = 'Usuario';
    }
  }

  ngAfterViewInit(): void {
    // Lottie initialization is handled in toggleChat or initAnimation
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.isMinimized = false;
      setTimeout(() => {
        if (!this.animationItem && this.lottieContainer) {
          this.initAnimation();
        }
      }, 100);
    } else {
      this.stopAll();
    }
  }

  minimizeChat(): void {
    this.isOpen = false;
  }

  closeChat(): void {
    this.isOpen = false;
    this.messages = [{ text: 'Hola! ¿En qué puedo ayudarte hoy?', sender: 'bot', time: new Date() }];
    this.stopAll();
  }

  clearHistory(): void {
    this.messages = [];
  }

  initAnimation(): void {
    if (this.lottieContainer) {
      this.animationItem = lottie.loadAnimation({
        container: this.lottieContainer.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: 'assets/chat-bot/Avatar-animation.json'
      });
    }
  }

  toggleAnimation(): void {
    this.stopAll();
  }

  private stopAll(): void {
    if (this.animationItem) {
      this.animationItem.stop();
      this.tts.stop();
    }
  }

  setTopic(topic: 'general' | 'policies'): void {
    this.topic = topic;
  }

  sendMessage(): void {
    if (!this.userMessage.trim()) {
      return;
    }

    // Detener cualquier audio/animación anterior
    this.stopAll();

    const text = this.userMessage;
    this.messages.push({ text, sender: 'user', time: new Date() });
    this.userMessage = '';

    const token = this.cookieService.get('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const body = { prompt: text, option: this.topic };

    this.http.post<any>(`${environment.webhookUrl}/chat-bot`, body, { headers }).subscribe({
      next: (res) => {
        let botText = '';

        if (typeof res === 'string') {
          botText = res;
        } else if (res && res.output) {
          botText = res.output;
        } else if (res && res.message) {
          botText = res.message;
        } else if (res && res.text) {
          botText = res.text;
        } else {
          botText = JSON.stringify(res);
        }

        this.messages.push({ text: botText, sender: 'bot', time: new Date() });
        
        // Reproducir animación mientras habla
        if (this.animationItem) {
          this.animationItem.play();
        }
        
        // Usar TTS Azure
        this.tts.speak(botText).then(() => {
          // Detener animación cuando termine de hablar
          if (this.animationItem) {
            this.animationItem.stop();
          }
        }).catch(err => {
          console.error('Error en TTS:', err);
          if (this.animationItem) {
            this.animationItem.stop();
          }
        });
      },
      error: (err) => {
        console.error(err);
        const errorMsg = 'Lo siento, hubo un error al procesar tu solicitud.';
        this.messages.push({ text: errorMsg, sender: 'bot', time: new Date() });
        
        // Reproducir animación mientras habla el error
        if (this.animationItem) {
          this.animationItem.play();
        }
        
        // Usar TTS Azure para errores también
        this.tts.speak(errorMsg).then(() => {
          if (this.animationItem) {
            this.animationItem.stop();
          }
        }).catch(err => {
          console.error('Error en TTS error:', err);
          if (this.animationItem) {
            this.animationItem.stop();
          }
        });
      }
    });
  }

  contactAdvisor(): void {
    console.log('Contacting advisor...');
  }

  ngOnDestroy(): void {
    if (this.animationItem) {
      this.animationItem.destroy();
    }
  }
}