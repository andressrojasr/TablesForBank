import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { AlertController, IonRouterOutlet, ModalController, ToastController } from '@ionic/angular';
import { FormInversionComponent } from '../components/form-inversion/form-inversion.component';

@Component({
  selector: 'app-admin-inversiones',
  templateUrl: './admin-inversiones.page.html',
  styleUrls: ['./admin-inversiones.page.scss'],
  standalone: false
})
export class AdminInversionesPage implements OnInit {
  inversiones: any[] = [];
  loading = true;

  constructor(
    private supabase: SupabaseService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private routerOutlet: IonRouterOutlet
  ) {}

  async ngOnInit() {
    await this.cargarInversiones();
  }

  async cargarInversiones(event?: any) {
    this.loading = true;
    const { data, error } = await this.supabase.getInvestments();
    
    if (error) {
      this.mostrarError('Error al cargar inversiones', error.message);
      this.loading = false;
      if (event) event.target.complete();
      return;
    }
    
    this.inversiones = data || [];
    this.loading = false;
    if (event) event.target.complete();
  }

  async abrirFormulario(inversion?: any) {
    const modal = await this.modalCtrl.create({
      component: FormInversionComponent,
      componentProps: { inversion },
      presentingElement: this.routerOutlet.nativeEl
    });
    
    await modal.present();
    const { data } = await modal.onDidDismiss();
    
    if (data) {
      this.cargarInversiones();
    }
  }

  async eliminarInversion(inversion: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar la inversión <strong>${inversion.investment_type}</strong>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            const { error } = await this.supabase.deleteInvestment(inversion.id);
            if (error) {
              this.mostrarError('Error al eliminar', error.message);
            } else {
              this.mostrarMensaje('Inversión eliminada correctamente');
              this.cargarInversiones();
            }
          }
        }
      ]
    });
    
    await alert.present();
  }

  private async mostrarMensaje(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  private async mostrarError(titulo: string, mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}