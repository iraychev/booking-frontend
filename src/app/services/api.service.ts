import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { Listing } from '../models/listing.model';
import { Booking } from '../models/booking.model';
import { environment } from '../../environments/environment';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private listingsCacheKey = 'listings';
  url: string = environment.apiUrl;
  constructor(private http: HttpClient, private cacheService: CacheService) {}

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.url}/users/username/${username}`);
  }

  register(user: User): Observable<any> {
    return this.http.post(`${this.url}/users`, user);
  }

  updateUserById(user: User): Observable<any> {
    return this.http.put(`${this.url}/users/${user.id}`, user);
  }

  getAllListings(): Observable<Listing[]> {
    const cachedListings = this.cacheService.get(this.listingsCacheKey);
    if (cachedListings) {
      return of(cachedListings);
    }
    return this.http.get<Listing[]>(`${this.url}/listings`).pipe(
      tap((data) => {
        this.cacheService.set(this.listingsCacheKey, data, 300000);
      })
    );
  }

  getListingById(id: string): Observable<any> {
    return this.http.get(`${this.url}/listings/${id}`);
  }

  createListing(listing: Listing) {
    return this.http.post(`${this.url}/listings`, listing);
  }

  updateListingById(listing: Listing): Observable<any> {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');

    const listingToUpdate = {
      title: listing.title,
      description: listing.description,
      images: listing.images,
      propertyAddress: listing.propertyAddress,
      price: listing.price,
      amenities: listing.amenities,
    };
    return this.http.put(
      `${this.url}/listings/${listing.id}`,
      listingToUpdate,
      { headers }
    );
  }

  deleteListingById(listingId: string): Observable<any> {
    return this.http.delete(`${this.url}/listings/${listingId}`);
  }

  getBookingById(id: string): Observable<any> {
    return this.http.get(`${this.url}/bookings/${id}`);
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.url}/bookings`);
  }

  getBookingsForListing(listingId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(
      `${this.url}/bookings/listing/${listingId}`
    );
  }

  createBooking(booking: Booking) {
    booking.startDate = new Date(
      booking.startDate.getTime() + 3 * 60 * 60 * 1000
    );
    return this.http.post<Booking>(`${this.url}/bookings`, booking);
  }
  deleteBookingById(bookingId: string): Observable<any> {
    return this.http.delete(`${this.url}/bookings/${bookingId}`);
  }
}
