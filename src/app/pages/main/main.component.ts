import { Component, OnInit } from '@angular/core';
import { RecommendedPackagesComponent } from '../../components/recommended-packages/recommended-packages.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MunicipalityService } from '../../services/models/business-models/municipality.service';
import { Municipality } from '../../models/business-models/municipality';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RecommendedPackagesComponent, FormsModule, CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  // Contadores mínimos
  rooms = 1;
  adults = 1;
  
  // Search params
  destination: string = '';
  origin: string = '';
  startDate: string = '';
  endDate: string = '';

  // Municipalities
  municipalities: Municipality[] = [];

  // Límites (hardcoded, mínimo TS)
  readonly MAX = 10;

  constructor(
    private router: Router,
    private municipalityService: MunicipalityService
  ) {}

  ngOnInit(): void {
    this.loadMunicipalities();
  }

  loadMunicipalities() {
    this.municipalityService.getMunicipalities().subscribe({
      next: (data: any) => {
        // Adjust based on API response structure (e.g. data.data or just data)
        if (Array.isArray(data)) {
          this.municipalities = data;
        } else if (data.data && Array.isArray(data.data)) {
          this.municipalities = data.data;
        }
      },
      error: (err) => console.error('Error loading municipalities', err)
    });
  }

  increment(field: 'rooms' | 'adults') {
    if (field === 'rooms' && this.rooms < this.MAX) this.rooms++;
    if (field === 'adults' && this.adults < this.MAX) this.adults++;
  }

  decrement(field: 'rooms' | 'adults') {
    if (field === 'rooms' && this.rooms > 1) this.rooms--;
    if (field === 'adults' && this.adults > 1) this.adults--;
  }

  search() {
    const queryParams: any = {};
    if (this.destination) queryParams.destination = this.destination;
    if (this.startDate) queryParams.startDate = this.startDate;
    if (this.endDate) queryParams.endDate = this.endDate;
    if (this.adults) queryParams.availableSeats = this.adults;

    this.router.navigate(['/search-results'], { queryParams });
  }
}
