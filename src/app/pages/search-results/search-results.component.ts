import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TripService } from '../../services/models/business-models/trip.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  trips: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private tripService: TripService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.loading = true;
      this.tripService.getTrips(params).subscribe({
        next: (res: any) => {
          if (Array.isArray(res)) {
            this.trips = res;
          } else if (res.data && Array.isArray(res.data)) {
            this.trips = res.data;
          } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
            this.trips = res.data.data;
          } else {
            this.trips = [];
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching trips', err);
          this.loading = false;
        }
      });
    });
  }
}