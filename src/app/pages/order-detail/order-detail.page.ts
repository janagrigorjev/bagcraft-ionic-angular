import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertController, IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { BagOrder } from '../../models/order.model';
import { ADDONS, BAG_MODELS, HANDLES, MATERIALS, SIZES, STATUS_LABELS } from '../../models/order-options.model';
import { OrderService } from '../../services/order.service';

@Component({
  standalone: true,
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule]
})
export class OrderDetailPage implements OnInit {
  order: BagOrder | null = null;
  loading = false;
  statusLabels = STATUS_LABELS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.loadOrder();
  }

  ionViewWillEnter(): void {
    this.loadOrder();
  }

  canEdit(): boolean {
    return this.order?.status === 'sent';
  }

  labelOf(type: 'model' | 'material' | 'size' | 'handle' | 'addon', id: string): string {
    const source =
      type === 'model' ? BAG_MODELS :
      type === 'material' ? MATERIALS :
      type === 'size' ? SIZES :
      type === 'handle' ? HANDLES : ADDONS;
    return source.find(item => item.id === id)?.label ?? id;
  }

  addonLabels(): string {
    if (!this.order?.addons?.length) {
      return 'Bez dodatnih ukrasa';
    }
    return this.order.addons.map(addon => this.labelOf('addon', addon)).join(', ');
  }

  async cancelOrder(): Promise<void> {
    if (!this.order?.id) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Otkazivanje porudžbine',
      message: 'Da li želiš da otkažeš ovu porudžbinu?',
      buttons: [
        { text: 'Ne', role: 'cancel' },
        { text: 'Da', role: 'confirm' }
      ]
    });
    await alert.present();
    const result = await alert.onDidDismiss();
    if (result.role !== 'confirm') {
      return;
    }

    const loading = await this.loadingController.create({ message: 'Otkazivanje...' });
    await loading.present();
    this.orderService.cancelOrder(this.order.id).subscribe({
      next: async () => {
        await loading.dismiss();
        const toast = await this.toastController.create({ message: 'Porudžbina je otkazana.', duration: 1500, color: 'warning' });
        await toast.present();
        this.loadOrder();
      },
      error: async () => {
        await loading.dismiss();
      }
    });
  }

  async deleteOrder(): Promise<void> {
    if (!this.order?.id) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Brisanje',
      message: 'Ova akcija trajno briše porudžbinu iz baze. Nastaviti?',
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

    const loading = await this.loadingController.create({ message: 'Brisanje...' });
    await loading.present();
    this.orderService.deleteOrder(this.order.id).subscribe({
      next: async () => {
        await loading.dismiss();
        this.router.navigateByUrl('/orders');
      },
      error: async () => {
        await loading.dismiss();
      }
    });
  }

  private loadOrder(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/orders');
      return;
    }

    this.loading = true;
    this.orderService.getOrder(id).subscribe({
      next: order => {
        this.order = order;
        this.loading = false;
        if (!order) {
          this.router.navigateByUrl('/orders');
        }
      },
      error: () => {
        this.loading = false;
        this.router.navigateByUrl('/orders');
      }
    });
  }
}
