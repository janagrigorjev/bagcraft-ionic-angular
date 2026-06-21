import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AlertController, IonicModule, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterModule]
})
export class LoginPage {
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

 goToRegister(): void {
  this.router.navigateByUrl('/register');
}

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const loading = await this.loadingController.create({ message: 'Prijavljivanje...' });
    await loading.present();

    const { email, password } = this.form.getRawValue();
    this.authService.login(email, password).subscribe({
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
