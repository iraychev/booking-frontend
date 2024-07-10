import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { ButtonComponent } from '../../shared/button/button.component';
import { Listing } from '../../models/listing.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-listings',
  templateUrl: './listings.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, FormsModule],
  styleUrls: ['./listings.component.css'],
})
export class ListingsComponent implements OnInit, OnDestroy {
  listings: Listing[] = [];
  filteredListings: Listing[] = [];
  paginatedListings: Listing[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  listingsPerPage: number = 4;
  totalPages: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.getListings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkIfUserCantCreateListings(): boolean {
    const user: User | null = this.authService.getCurrentUser();
    if (!user) {
      return true;
    }
    return !(user.roles.includes('PROPERTY_OWNER') || user.roles.includes('ADMIN'));
  }
  
  getListings(): void {
    this.apiService.getAllListings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.listings = data;
          this.filteredListings = [...this.listings];
          this.updatePagination();
        },
        error: (err) => {
          this.errorService.handleError('Failed to fetch listings', err);
        }
      });
  }

  performSearch(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredListings = [...this.listings];
    } else {
      const lowerCaseSearchTerm = this.searchTerm.trim().toLowerCase();
      this.filteredListings = this.listings.filter(
        (listing) =>
          listing.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          listing.propertyAddress.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    this.updatePagination();
  }

  viewDetails(listingId: string): void {
    if (!this.authService.isAuthenticated()) {
      this.errorService.handleError('Authentication required', 'You need to be logged in to view listings');
    } else {
      this.router.navigate(['/listing'], { state: { listingId } });
    }
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredListings.length / this.listingsPerPage);
    this.currentPage = 1;
    this.paginateListings();
  }

  private paginateListings(): void {
    const startIndex = (this.currentPage - 1) * this.listingsPerPage;
    const endIndex = startIndex + this.listingsPerPage;
    this.paginatedListings = this.filteredListings.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateListings();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateListings();
    }
  }
}