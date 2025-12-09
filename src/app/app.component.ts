// Angular import
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// project import
import { SpinnerComponent } from './components/shared/components/spinner/spinner.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, SpinnerComponent, ChatbotComponent]
})
export class AppComponent {
  title = 'Berry Angular Free Version';
}
