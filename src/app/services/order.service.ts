import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminBagOrder, BagOrder, OrderStatus } from '../models/order.model';
import { calculateBagPrice } from '../shared/price-calculator';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly dbUrl = environment.firebaseDatabaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient, private authService: AuthService) {}

  createOrder(order: Omit<BagOrder, 'id' | 'userId' | 'userEmail' | 'status' | 'createdAt' | 'price'>): Observable<BagOrder> {
    const token = this.authService.getToken();
    const userId = this.authService.getUserId();
    const now = new Date().toISOString();
    const payload: BagOrder = {
      ...order,
      userId,
      userEmail: this.authService.getUserEmail(),
      status: 'sent',
      price: calculateBagPrice(order),
      createdAt: now,
      updatedAt: now
    };

    return this.http
      .post<{ name: string }>(`${this.dbUrl}/orders/${userId}.json?auth=${token}`, payload)
      .pipe(map(response => ({ ...payload, id: response.name })));
  }

  getMyOrders(): Observable<BagOrder[]> {
    const token = this.authService.getToken();
    const userId = this.authService.getUserId();
    return this.http
      .get<Record<string, BagOrder> | null>(`${this.dbUrl}/orders/${userId}.json?auth=${token}`)
      .pipe(map(data => this.objectToOrders(data)));
  }

  getOrder(orderId: string): Observable<BagOrder | null> {
    const token = this.authService.getToken();
    const userId = this.authService.getUserId();
    return this.http
      .get<BagOrder | null>(`${this.dbUrl}/orders/${userId}/${orderId}.json?auth=${token}`)
      .pipe(map(order => (order ? { ...order, id: orderId } : null)));
  }

  updateOrder(orderId: string, changes: Partial<BagOrder>): Observable<BagOrder> {
    const token = this.authService.getToken();
    const userId = this.authService.getUserId();
    const payload: Partial<BagOrder> = {
      ...changes,
      updatedAt: new Date().toISOString()
    };

    if (this.hasPricingFields(changes)) {
      payload.price = calculateBagPrice({
        modelId: changes.modelId ?? '',
        materialId: changes.materialId ?? '',
        sizeId: changes.sizeId ?? '',
        handleId: changes.handleId ?? '',
        addons: changes.addons ?? [],
        quantity: changes.quantity ?? 1
      });
    }

    return this.http.patch<BagOrder>(`${this.dbUrl}/orders/${userId}/${orderId}.json?auth=${token}`, payload);
  }

  deleteOrder(orderId: string): Observable<void> {
    const token = this.authService.getToken();
    const userId = this.authService.getUserId();
    return this.http.delete<void>(`${this.dbUrl}/orders/${userId}/${orderId}.json?auth=${token}`);
  }

  deleteOrderForAdmin(ownerUid: string, orderId: string): Observable<void> {
  const token = this.authService.getToken();
  return this.http.delete<void>(`${this.dbUrl}/orders/${ownerUid}/${orderId}.json?auth=${token}`);
}

  cancelOrder(orderId: string): Observable<BagOrder> {
    return this.updateOrder(orderId, { status: 'cancelled' });
  }

  getAllOrdersForAdmin(): Observable<AdminBagOrder[]> {
    const token = this.authService.getToken();
    return this.http
      .get<Record<string, Record<string, BagOrder>> | null>(`${this.dbUrl}/orders.json?auth=${token}`)
      .pipe(map(data => this.flattenAdminOrders(data)));
  }

  updateOrderStatusForAdmin(ownerUid: string, orderId: string, status: OrderStatus): Observable<BagOrder> {
    const token = this.authService.getToken();
    return this.http.patch<BagOrder>(`${this.dbUrl}/orders/${ownerUid}/${orderId}.json?auth=${token}`, {
      status,
      updatedAt: new Date().toISOString()
    });
  }

  private objectToOrders(data: Record<string, BagOrder> | null): BagOrder[] {
    if (!data) {
      return [];
    }

    return Object.entries(data)
      .map(([id, order]) => ({ ...order, id }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private flattenAdminOrders(data: Record<string, Record<string, BagOrder>> | null): AdminBagOrder[] {
    if (!data) {
      return [];
    }

    const result: AdminBagOrder[] = [];
    Object.entries(data).forEach(([ownerUid, orders]) => {
      Object.entries(orders || {}).forEach(([orderId, order]) => {
        result.push({ ...order, ownerUid, orderId, id: orderId });
      });
    });

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private hasPricingFields(changes: Partial<BagOrder>): boolean {
    return !!(changes.modelId && changes.materialId && changes.sizeId && changes.handleId);
  }
}
