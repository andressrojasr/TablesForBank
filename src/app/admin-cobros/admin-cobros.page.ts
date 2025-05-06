import { Component, OnInit } from '@angular/core';
import { AgregarModalComponent } from '../components/agregar-modal/agregar-modal.component';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { EditarModalComponent } from '../components/editar-modal/editar-modal.component';
import { SupabaseService } from '../services/supabase.service';
import { PostgrestError } from '@supabase/supabase-js';
import { Charge } from '../models/charge';

@Component({
  selector: 'app-admin-cobros',
  templateUrl: './admin-cobros.page.html',
  styleUrls: ['./admin-cobros.page.scss'],
  standalone: false

})
export class AdminCobrosPage implements OnInit {
  cobrosIndirectos: Charge[] = [];
  selectedCobro: Charge | null = null;
  editingCobroId: number | null = null;
  editForm: Partial<Charge> = {};

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private cobrosService: SupabaseService,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.cargarCobrosDesdeServicio();
  }

  async cargarCobrosDesdeServicio() {
    const { data, error }: { data?: Charge[]; error?: PostgrestError } = await this.cobrosService.getInformationCharges();

    if (error) {
      console.error('Error al obtener cobros:', error.message);
    } else {
      this.cobrosIndirectos = data || [];
    }
  }

  verDetalle(cobro: Charge) {
    this.selectedCobro = this.selectedCobro?.id === cobro.id ? null : cobro;
  }

  async editar(cobro: any) {
    const formConfig = [
      { label: 'Nombre', field: 'name', type: 'text' },
      { label: 'Es porcentaje', field: 'isPercentage', type: 'toggle' },
      { label: 'Valor', field: 'value', type: 'number' }
    ];


    const modal = await this.modalCtrl.create({
      component: EditarModalComponent,
      componentProps: {
        data: cobro,
        formConfig,
        title: 'Editar Cobro Indirecto',
        saveFn: this.cobrosService.updateCharge.bind(this.cobrosService),
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.actualizado) {
      this.cargarCobrosDesdeServicio();
    }
  }


  cancelarEdicion() {
    this.editingCobroId = null;
    this.editForm = {};
  }

  async guardarEdicion() {
    if (this.editingCobroId == null) return;

    const datosEditados = { ...this.editForm };
    delete (datosEditados as any).id;

    const error = await this.cobrosService.updateCharge(this.editingCobroId, datosEditados);

    if (error) {
      let errorMessage = 'Ha ocurrido un error al intentar guardar el cobro.';
      if (error?.message.includes('network')) {
        errorMessage = 'No se pudo conectar al servidor. Intenta de nuevo más tarde.';
      }

      const toast = await this.toastController.create({
        message: errorMessage,
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } else {
      await this.cargarCobrosDesdeServicio();
      this.cancelarEdicion();
        const toast = await this.toastController.create({
          message: 'Cobro editado con éxito.',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
    }
  }

  async eliminar(index: number) {
    const cobro = this.cobrosIndirectos[index];

    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este cobro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const error = await this.cobrosService.deleteCharge(cobro.id);
             const toast = await this.toastController.create({
            message: 'Se ha eliminado con éxito',
            duration: 2000,
            color: 'danger'
          });
          toast.present();

            if (error) {
              const toast = await this.toastController.create({
                message: `Error al eliminar cobro`,
                duration: 3000,
                color: 'danger'
              });
              await toast.present();
            } else {
              this.cobrosIndirectos.splice(index, 1);
              this.selectedCobro = null;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async abrirModalAgregar() {
    const formConfig = [
      { label: 'Nombre', field: 'name', type: 'text' },
      { label: '¿Es porcentaje?', field: 'isPercentage', type: 'toggle' },
      { label: 'Valor', field: 'value', type: 'number' },
    ];

    const modal = await this.modalCtrl.create({
      component: AgregarModalComponent,
      componentProps: {
        titulo: 'Agregar Cobro Indirecto',
        formConfig: formConfig
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      const { error } = await this.cobrosService.insertCharge(data);

if (!error) {
  await this.cargarCobrosDesdeServicio();
  const toast = await this.toastController.create({
    message: 'Cobro agregado con éxito.',
    duration: 2000,
    color: 'success'
  });
  await toast.present();
} else {
  let errorMessage = 'Ha ocurrido un error al intentar agregar el cobro.';
  if (error?.message.includes('duplicate key')) {
    errorMessage = 'Ya existe un cobro con los mismos datos.';
  } else if (error?.message.includes('network')) {
    errorMessage = 'No se pudo conectar al servidor. Intenta de nuevo más tarde.';
  }

  const toast = await this.toastController.create({
    message: errorMessage,
    duration: 3000,
    color: 'danger'
  });
  await toast.present();
}


    }
  }

  }
