import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertController, IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { BagOrder } from '../../models/order.model';
import { ADDONS, BAG_MODELS, COLORS, HANDLES, MATERIALS, SIZES } from '../../models/order-options.model';
import { OrderService } from '../../services/order.service';
import { calculateBagPrice } from '../../shared/price-calculator';

@Component({
  standalone: true,
  selector: 'app-order-form',
  templateUrl: './order-form.page.html',
  styleUrls: ['./order-form.page.scss'],
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterModule]
})
export class OrderFormPage implements OnInit {
  models = BAG_MODELS;
  materials = MATERIALS;
  sizes = SIZES;
  handles = HANDLES;
  addons = ADDONS;
  colors = COLORS;

  orderId: string | null = null;
  editing = false;
  loading = false;
  saving = false;

  form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
    modelId: ['classic', Validators.required],
    materialId: ['glassBeads', Validators.required],
    color: ['Srebrna', Validators.required],
    sizeId: ['medium', Validators.required],
    handleId: ['chain', Validators.required],
    addons: [[] as string[]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    note: ['']
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');
    this.editing = !!this.orderId;

    if (this.orderId) {
      this.loadOrder(this.orderId);
    }
  }

  get currentPrice(): number {
    const value = this.form.getRawValue();
    return calculateBagPrice(value);
  }

  isAddonSelected(addonId: string): boolean {
    return this.form.controls.addons.value.includes(addonId);
  }

  toggleAddon(addonId: string, selected: boolean): void {
    const currentAddons = this.form.controls.addons.value;
    const addons = selected
      ? Array.from(new Set([...currentAddons, addonId]))
      : currentAddons.filter(id => id !== addonId);

    this.form.controls.addons.setValue(addons);
    this.form.controls.addons.markAsDirty();
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const loading = await this.loadingController.create({ message: this.editing ? 'Čuvanje izmene...' : 'Slanje porudžbine...' });
    await loading.present();

    const formValue = this.form.getRawValue();
    const request$ = this.editing && this.orderId
      ? this.orderService.updateOrder(this.orderId, formValue as Partial<BagOrder>)
      : this.orderService.createOrder(formValue);

    request$.subscribe({
      next: async (order: BagOrder) => {
        await loading.dismiss();
        this.saving = false;
        const toast = await this.toastController.create({
          message: this.editing ? 'Porudžbina je izmenjena.' : 'Porudžbina je kreirana.',
          duration: 1600,
          color: 'success'
        });
        await toast.present();
        const id = this.orderId ?? order.id;
        this.router.navigateByUrl(id ? `/orders/${id}` : '/orders');
      },
      error: async () => {
        await loading.dismiss();
        this.saving = false;
        const alert = await this.alertController.create({
          header: 'Greška',
          message: 'Podaci nisu sačuvani. Proveri Firebase podešavanja i internet konekciju.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  private loadOrder(orderId: string): void {
    this.loading = true;
    this.orderService.getOrder(orderId).subscribe({
      next: order => {
        this.loading = false;
        if (!order) {
          this.router.navigateByUrl('/orders');
          return;
        }
        this.patchForm(order);
      },
      error: () => {
        this.loading = false;
        this.router.navigateByUrl('/orders');
      }
    });
  }

  private patchForm(order: BagOrder): void {
    this.form.patchValue({
      customerName: order.customerName,
      phone: order.phone,
      modelId: order.modelId,
      materialId: order.materialId,
      color: order.color,
      sizeId: order.sizeId,
      handleId: order.handleId,
      addons: order.addons || [],
      quantity: order.quantity,
      note: order.note || ''
    });
  }




  
}
