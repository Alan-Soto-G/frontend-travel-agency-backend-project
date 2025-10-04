import { Component, ElementRef, EventEmitter, Output, Renderer2, ViewChild, AfterViewInit } from '@angular/core';

declare const grecaptcha: any;

@Component({
  selector: 'app-recapcha',
  templateUrl: './recapcha.component.html',
  styleUrls: ['./recapcha.component.scss']
})
export class RecapchaComponent implements AfterViewInit {

  @Output() resolved = new EventEmitter<string>();
  @ViewChild('captchaContainer', { static: true }) captchaContainer!: ElementRef;

  private widgetId: any;

  constructor(private renderer: Renderer2) {}

ngAfterViewInit(): void {
  if (!document.getElementById('recaptcha-script')) {
    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = 'https://www.google.com/recaptcha/api.js?onload=renderRecaptchaCallback&render=explicit';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Creamos una función global que se llamará cuando el script se cargue
    (window as any).renderRecaptchaCallback = () => {
      this.renderRecaptcha();
    };
  } else {
    // Si ya estaba cargado, renderizamos directamente
    this.renderRecaptcha();
  }
}


renderRecaptcha() {
  if ((window as any).grecaptcha) {
    this.widgetId = (window as any).grecaptcha.render(this.captchaContainer.nativeElement, {
      sitekey: '6Ld3wN0rAAAAAEBG-ricj246W13vTsOwUusyElPn', // tu Site Key
      callback: (response: string) => this.resolved.emit(response)
    });
  } else {
    console.error('grecaptcha no está disponible aún');
  }
}


  reset() {
    if (grecaptcha && this.widgetId !== undefined) {
      grecaptcha.reset(this.widgetId);
    }
  }

  //6Ld3wN0rAAAAALBifsDJZndWJCHRXnMvD8IBg0h_
}
