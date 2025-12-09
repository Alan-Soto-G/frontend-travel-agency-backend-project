import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Package {
  id: number;
  image: string;
  title: string;
  location: string;
  days: number;
  nights: number;
  rating: number;
  originalPrice: number;
  discount: number;
  price: number;
  tags?: string[];
}

@Component({
  selector: 'app-recommended-packages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommended-packages.component.html',
  styleUrls: ['./recommended-packages.component.scss']
})
export class RecommendedPackagesComponent {
  @Input() packages: Package[] = [
    {
      id: 1,
      image: 'assets/images/cartagena.jpg', // Placeholder
      title: 'Paquetes a Cartagena de Indias',
      location: 'Partiendo desde Bogotá',
      days: 5,
      nights: 4,
      rating: 4.8,
      originalPrice: 1200000,
      discount: 300342,
      price: 899658
    },
    {
      id: 2,
      image: 'assets/images/santa-marta.jpg', // Placeholder
      title: 'Paquetes a Santa Marta',
      location: 'Partiendo desde Bogotá',
      days: 5,
      nights: 4,
      rating: 4.9,
      originalPrice: 1400000,
      discount: 400019,
      price: 999981
    },
    {
      id: 3,
      image: 'assets/images/san-andres.jpg', // Placeholder
      title: 'Paquetes a San Andrés',
      location: 'Partiendo desde Bogotá',
      days: 5,
      nights: 4,
      rating: 5.0,
      originalPrice: 1700000,
      discount: 250414,
      price: 1449586
    },
    {
      id: 4,
      image: 'assets/images/punta-cana.jpg', // Placeholder
      title: 'Paquetes a Punta Cana',
      location: 'Partiendo desde Bogotá',
      days: 5,
      nights: 4,
      rating: 4.8,
      originalPrice: 3200000,
      discount: 750157,
      price: 2449843
    }
  ];

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}
