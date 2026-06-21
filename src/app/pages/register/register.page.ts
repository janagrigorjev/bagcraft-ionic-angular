import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AlertController, IonicModule, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterModule]
})
export class RegisterPage {
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  goToLogin(): void {
  this.router.navigateByUrl('/login');
  }

  passwordsMatch(): boolean {
    return this.form.controls.password.value === this.form.controls.confirmPassword.value;
  }

  async submit(): Promise<void> {
    if (this.form.invalid || !this.passwordsMatch()) {
      this.form.markAllAsTouched();
      return;
    }

    const loading = await this.loadingController.create({ message: 'Kreiranje naloga...' });
    await loading.present();

    const { email, password } = this.form.getRawValue();
    this.authService.register(email, password).subscribe({
      next: async () => {
        await loading.dismiss();
        this.router.navigateByUrl('/orders', { replaceUrl: true });
      },
      error: async (error: Error) => {
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Greška',
          message: error.message,
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}
