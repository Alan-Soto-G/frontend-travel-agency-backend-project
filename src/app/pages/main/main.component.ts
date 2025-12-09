import { Component } from '@angular/core';
import { RecommendedPackagesComponent } from '../../components/recommended-packages/recommended-packages.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RecommendedPackagesComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  // Contadores mínimos
  rooms = 1;
  adults = 1;
  children = 0;

  // Límites (hardcoded, mínimo TS)
  readonly MAX = 10;

  increment(field: 'rooms' | 'adults' | 'children') {
    if (field === 'rooms' && this.rooms < this.MAX) this.rooms++;
    if (field === 'adults' && this.adults < this.MAX) this.adults++;
    if (field === 'children' && this.children < this.MAX) this.children++;
  }

  decrement(field: 'rooms' | 'adults' | 'children') {
    if (field === 'rooms' && this.rooms > 1) this.rooms--;
    if (field === 'adults' && this.adults > 1) this.adults--;
    if (field === 'children' && this.children > 0) this.children--;
  }
}
