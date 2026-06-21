import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { AdminBagOrder, OrderStatus } from '../../models/order.model';
import { STATUS_LABELS } from '../../models/order-options.model';
import { OrderService } from '../../services/order.service';

@Component({
  standalone: true,
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.page.html',
  styleUrls: ['./admin-orders.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class AdminOrdersPage implements OnInit {
  orders: AdminBagOrder[] = [];
  filteredStatus: 'all' | OrderStatus = 'all';
  loading = false;
  statusLabels = STATUS_LABELS;
  statuses: OrderStatus[] = ['sent', 'accepted', 'inProgress', 'ready', 'finished', 'cancelled'];

  constructor(private orderService: OrderService, private toastController: ToastController) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  get visibleOrders(): AdminBagOrder[] {
    if (this.filteredStatus === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.filteredStatus);
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrdersForAdmin().subscribe({
      next: orders => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  async changeStatus(order: AdminBagOrder, status: OrderStatus): Promise<void> {
    this.orderService.updateOrderStatusForAdmin(order.ownerUid, order.orderId, status).subscribe({
      next: async () => {
        order.status = status;
        const toast = await this.toastController.create({
          message: 'Status porudžbine je promenjen.',
          duration: 1400,
          color: 'success'
        });
        await toast.present();
      }
    });
  }

  trackByOrderId(_: number, order: AdminBagOrder): string {
    return `${order.ownerUid}-${order.orderId}`;
  }
}
