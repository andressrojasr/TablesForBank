import { Component, inject } from '@angular/core';
import { SupabaseService } from './services/supabase.service';
import { ToastController } from '@ionic/angular';
import { Title } from '@angular/platform-browser';
import { Bank } from './models/bank.model';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  supabase = inject(SupabaseService)
  toastCtrl = inject(ToastController);
  title = inject(Title)
  name = 'App Bank'
  logo = 'logo of bank';

  private bankChannel: any;

  async ngOnInit() {
    await this.getData();
    this.title.setTitle(this.name);
    this.setFavicon(this.logo);

    this.bankChannel = this.supabase.subscribeToBankChanges((payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        this.applyBankInfo(payload.new);
      }
    });

  }

  ngOnDestroy(): void {
    if (this.bankChannel) {
      this.bankChannel.unsubscribe();
    }
  }

  private applyBankInfo(bank: Bank) {
    this.name = bank.name;
    this.logo = bank.logo;
    this.title.setTitle(this.name);
    this.setFavicon(this.logo);
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

  private setFavicon(logoUrl: string) {
    let link: HTMLLinkElement = document.querySelector("link[rel*='icon']")!;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'icon');
      document.head.appendChild(link);
    }
    link.href = logoUrl;
  }
}
