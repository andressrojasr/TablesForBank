import { Component, inject } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';
import { Bank } from '../models/bank.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  navCtrl = inject(NavController);
  supabase = inject(SupabaseService);
  toastCtrl = inject(ToastController);

  name: string = 'name of bank';
  logo: string = 'logo of bank';



  private bankChannel: any;

  constructor() {}

  ngOnInit() {
    this.getData();

    this.bankChannel = this.supabase.subscribeToBankChanges((payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        this.applyBankInfo(payload.new);
      }
    });



  }

  onLogin() {
    this.navCtrl.navigateForward('/login');
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

  ngOnDestroy(): void {
      if (this.bankChannel) {
        this.bankChannel.unsubscribe();
      }
    }

    private applyBankInfo(bank: Bank) {
      this.name = bank.name;
      this.logo = bank.logo;
    }
}
