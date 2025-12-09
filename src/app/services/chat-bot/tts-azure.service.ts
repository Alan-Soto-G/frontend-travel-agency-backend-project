import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class TtsAzureService {

  private audioUrl = `${environment.msSecurity}/api/public/azure/tts-audio`;
  private currentAudio: HTMLAudioElement | null = null;

  constructor(private http: HttpClient) {}

  async speak(text: string, voice: string = "es-CO-SalomeNeural"): Promise<void> {
    try {
      // Detener audio anterior si existe
      this.stop();

      const audioBlob = await this.http.post(
        this.audioUrl,
        { text, voice },
        { responseType: 'blob' }
      ).toPromise();

      if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        this.currentAudio = new Audio(url);
        
        return new Promise((resolve, reject) => {
          if (this.currentAudio) {
            this.currentAudio.onended = () => {
              URL.revokeObjectURL(url);
              this.currentAudio = null;
              resolve();
            };
            this.currentAudio.onerror = reject;
            this.currentAudio.play();
          }
        });
      }
    } catch (err) {
      console.error("Error Azure TTS:", err);
      throw err;
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      URL.revokeObjectURL(this.currentAudio.src);
      this.currentAudio = null;
    }
  }
}
