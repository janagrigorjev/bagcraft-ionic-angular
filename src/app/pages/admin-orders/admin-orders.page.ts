import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { AdminBagOrder, OrderStatus } from '../../models/order.model';
import { ADDONS, BAG_MODELS, HANDLES, MATERIALS, SIZES, STATUS_LABELS } from '../../models/order-options.model';
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

  constructor(
  private orderService: OrderService,
  private toastController: ToastController,
  private alertController: AlertController
) {}

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

  labelOf(type: 'model' | 'material' | 'size' | 'handle' | 'addon', id: string): string {
  const source =
    type === 'model' ? BAG_MODELS :
    type === 'material' ? MATERIALS :
    type === 'size' ? SIZES :
    type === 'handle' ? HANDLES : ADDONS;

  return source.find(item => item.id === id)?.label ?? id;
}

addonLabels(order: AdminBagOrder): string {
  if (!order.addons || order.addons.length === 0) {
    return 'Bez dodatnih ukrasa';
  }

  return order.addons.map(addon => this.labelOf('addon', addon)).join(', ');
}

async deleteOrder(order: AdminBagOrder): Promise<void> {
  const alert = await this.alertController.create({
    header: 'Brisanje porudžbine',
    message: 'Da li želiš trajno da obrišeš ovu porudžbinu iz baze?',
    buttons: [
      { text: 'Ne', role: 'cancel' },
      { text: 'Obriši', role: 'destructive' }
    ]
  });

  await alert.present();

  const result = await alert.onDidDismiss();

  if (result.role !== 'destructive') {
    return;
  }

  this.orderService.deleteOrderForAdmin(order.ownerUid, order.orderId).subscribe({
    next: async () => {
      this.orders = this.orders.filter(
        item => !(item.ownerUid === order.ownerUid && item.orderId === order.orderId)
      );

      const toast = await this.toastController.create({
        message: 'Porudžbina je obrisana.',
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
