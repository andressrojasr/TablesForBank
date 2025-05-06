import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { NavController, ToastController } from '@ionic/angular';
import { Bank } from '../models/bank.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;
  name: string = 'name of bank';
  logo: string = 'logo of bank';

  fb = inject(FormBuilder);
  supabase = inject(SupabaseService);
  navCtrl = inject(NavController);
  toastCtrl = inject(ToastController);

  private bankChannel: any;

  ngOnInit(){
    this.getData();
    this.bankChannel = this.supabase.subscribeToBankChanges((payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        this.applyBankInfo(payload.new);
      }
    });
  }

  private applyBankInfo(bank: Bank) {
        this.name = bank.name;
        this.logo = bank.logo;
  }

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnDestroy(): void {
    if (this.bankChannel) {
      this.bankChannel.unsubscribe();
    }
  }

  async onLogin() {
    const { email, password } = this.loginForm.value;
    const { data, error } = await this.supabase.login(email, password);
    if (error) {
      const toast = await this.toastCtrl.create({
        message: error.message,
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } else {
      this.navCtrl.navigateRoot('/admin');
    }
  }

  onForgot() {
    this.navCtrl.navigateForward('/forgot-password');
  }

  onRegister() {
    this.navCtrl.navigateForward('/register');
  }

  private async getData() {
    try {
      const { data, error } = await this.supabase.getInformationBank();
      if (error) throw error;
      if (data?.length) {
        this.name = data[0].name;
        this.logo = data[0].logo;
      }
    } catch (err) {
      const toast = await this.toastCtrl.create({
        message: 'Error al cargar datos del banco: '+ err.message,
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

}
