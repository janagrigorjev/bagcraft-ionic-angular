import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, RefresherCustomEvent } from '@ionic/angular';
import { BagOrder } from '../../models/order.model';
import { STATUS_LABELS } from '../../models/order-options.model';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

@Component({
  standalone: true,
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule]
})
export class OrdersPage implements OnInit {
  orders: BagOrder[] = [];
  loading = false;
  error = '';
  statusLabels = STATUS_LABELS;

  constructor(
  public authService: AuthService,
  private orderService: OrderService,
  private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ionViewWillEnter(): void {
    this.loadOrders();
  }

  openOrder(id?: string): void {
  if (id) {
    this.router.navigateByUrl(`/orders/${id}`);
  }
  }

  loadOrders(event?: RefresherCustomEvent): void {
    this.loading = !event;
    this.error = '';

    this.orderService.getMyOrders().subscribe({
      next: orders => {
        this.orders = orders;
        this.loading = false;
        event?.target.complete();
      },
      error: () => {
        this.error = 'Porudžbine trenutno ne mogu da se učitaju.';
        this.loading = false;
        event?.target.complete();
      }
    });
  }

  trackByOrderId(_: number, order: BagOrder): string | undefined {
    return order.id;
  }
}
