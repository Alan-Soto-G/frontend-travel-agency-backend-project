// cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Trip } from 'src/app/models/business-models/trip.model';

export interface CartItem {
  id?: number;  // ID de TripClient (opcional)
  trip: Trip;
  quantity: number;
  travelers: number;
  // ✅ NUEVOS CAMPOS para manejo de estado de pagos
  paymentStatus?: 'pending' | 'processing' | 'partial' | 'completed' | 'cancelled' | 'refunded';
  paidInstallments?: number;  // Número de cuotas ya pagadas
  totalInstallments?: number; // Total de cuotas del plan
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  
  cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private loadCart(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }

  addToCart(trip: Trip, travelers: number = 1): boolean {
    const existingItem = this.cartItems.find(item => item.trip.id === trip.id);
    
    if (existingItem) {
      if ((existingItem.quantity + 1) * existingItem.travelers > trip.availableSeats) {
        return false;
      }
      existingItem.quantity++;
    } else {
      if (travelers > trip.availableSeats) {
        return false;
      }
      this.cartItems.push({ 
        trip, 
        quantity: 1, 
        travelers,
        paymentStatus: 'pending', // ✅ Estado inicial
        paidInstallments: 0,
        totalInstallments: 1
      });
    }
    
    this.saveCart();
    return true;
  }

  removeFromCart(tripId: number): void {
    this.cartItems = this.cartItems.filter(item => item.trip.id !== tripId);
    this.saveCart();
  }

  updateQuantity(tripId: number, quantity: number): void {
    const item = this.cartItems.find(item => item.trip.id === tripId);
    if (item && quantity > 0) {
      if (quantity * item.travelers <= item.trip.availableSeats) {
        item.quantity = quantity;
        this.saveCart();
      }
    }
  }

  updateTravelers(tripId: number, travelers: number): void {
    const item = this.cartItems.find(item => item.trip.id === tripId);
    if (item && travelers > 0) {
      if (item.quantity * travelers <= item.trip.availableSeats) {
        item.travelers = travelers;
        this.saveCart();
      }
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
  }

  getCartItems(): CartItem[] {
    return this.cartItems;
  }

  getCartCount(): number {
    return this.cartItems.length;
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => 
      sum + (item.trip.price * item.quantity * item.travelers), 0
    );
  }

  isInCart(tripId: number): boolean {
    return this.cartItems.some(item => item.trip.id === tripId);
  }
}