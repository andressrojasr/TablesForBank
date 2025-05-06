import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { AgregarModalComponent } from '../components/agregar-modal/agregar-modal.component';
import { SupabaseService } from '../services/supabase.service';
import { PostgrestError } from '@supabase/supabase-js';
import { EditarModalComponent } from '../components/editar-modal/editar-modal.component';

@Component({
  selector: 'app-admin-creditos',
  templateUrl: './admin-creditos.page.html',
  styleUrls: ['./admin-creditos.page.scss'],
  standalone: false,
})
export class AdminCreditosPage implements OnInit {
  tiposCreditos: any[] = [];
  selectedCredit: any = null;
  editingCreditId: number | null = null;
  editForm: any = {};
  selectedCobros: any[] = [];

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private creditosService: SupabaseService,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.cargarCreditosDesdeServicio();
  }

  async cargarCreditosDesdeServicio() {
    const { data, error }: { data?: any[]; error?: PostgrestError } = await this.creditosService.getInformationCredit();

    if (error) {
      console.error('Error al obtener créditos:', error.message);
    } else {
      this.tiposCreditos = data || [];
    }
  }
  async verDetalle(tipo: any) {
    const cobros = await this.creditosService.getCobrosForCredit(tipo.id);

    if (!cobros) {
      const toast = await this.toastController.create({
        message: 'No se encontraron cobros asociados.',
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
    }

    this.selectedCredit = tipo;
    this.selectedCobros = cobros;
  }



  async editar(credito: any) {
    const cobrosDisponibles = (await this.creditosService.getInformationCharges()).data || [];
    const cobrosAsociados = (await this.creditosService.getCobrosDeCredito(credito.id)).data || [];

    const selectedCobros = cobrosAsociados.map(c => c.cobro_id);

    const formConfig = [
      { label: 'Nombre', field: 'name', type: 'text' },
      { label: 'Tasa de Interés', field: 'anualRate', type: 'number' },
      { label: 'Monto Mínimo', field: 'minCredit', type: 'number' },
      { label: 'Monto Máximo', field: 'maxCredit', type: 'number' },
      { label: 'Tiempo Mínimo(Meses)', field: 'minTime', type: 'number' },
      { label: 'Tiempo Máximo(Meses)', field: 'maxTime', type: 'number' },
      { label: 'Información', field: 'information', type: 'textarea' },
      {
        label: 'Cobros Asociados',
        field: 'cobros',
        type: 'select-multiple',
        options: cobrosDisponibles.map(c => ({ label: c.name, value: c.id }))
      }
    ];

    const modal = await this.modalCtrl.create({
      component: EditarModalComponent,
      componentProps: {
        data: { ...credito, cobros: selectedCobros },
        formConfig,
        title: 'Editar Crédito',
        saveFn: async (id, data) => {
          const { cobros, ...datosCredito } = data;
          await this.creditosService.updateCredit(id, datosCredito);
          return await this.creditosService.actualizarCobrosCredito(id, cobros);
        }
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.actualizado) {
      this.cargarCreditosDesdeServicio();
    }
  }

  cancelarEdicion() {
    this.editingCreditId = null;
    this.editForm = {};
  }

  async guardarEdicion() {
    if (!this.editingCreditId) return;

    const datosEditados = { ...this.editForm };
    delete datosEditados.id;

    const error = await this.creditosService.updateCredit(this.editingCreditId, datosEditados);

    if (error) {
      let errorMessage = 'Ha ocurrido un error al intentar guardar el crédito.';
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
      await this.cargarCreditosDesdeServicio();
      this.cancelarEdicion();

      const toast = await this.toastController.create({
        message: 'Crédito actualizado con éxito.',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    }
  }

  async eliminar(index: number) {
    const credito = this.tiposCreditos[index];

    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este tipo de crédito?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const { error, details } = await this.creditosService.deleteCredit(credito.id);

            if (error) {
              const toast = await this.toastController.create({
                message: `Error: ${details || 'No se pudo eliminar el crédito'}`,
                duration: 3000,
                color: 'danger',
              });
              await toast.present();
            } else {
              this.tiposCreditos.splice(index, 1);
              this.selectedCredit = null;

              const toast = await this.toastController.create({
                message: 'Se ha eliminado con éxito',
                duration: 2000,
                color: 'success',
              });
              await toast.present();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async abrirModalAgregar() {
    const cobrosDisponibles = (await this.creditosService.getInformationCharges()).data || [];

    const formConfig = [
      { label: 'Nombre', field: 'name', type: 'text' },
      { label: 'Tasa de Interés Anual', field: 'anualRate', type: 'number' },
      { label: 'Monto Mínimo', field: 'minCredit', type: 'number' },
      { label: 'Monto Máximo', field: 'maxCredit', type: 'number' },
      { label: 'Tiempo Mínimo(Meses)', field: 'minTime', type: 'number' },
      { label: 'Tiempo Máximo(Meses)', field: 'maxTime', type: 'number' },
      { label: 'Información', field: 'information', type: 'textarea' },
      {
        label: 'Cobros Asociados',
        field: 'cobros',
        type: 'select-multiple',
        options: cobrosDisponibles.map(c => ({ label: c.name, value: c.id }))
      }
    ];

    const modal = await this.modalCtrl.create({
      component: AgregarModalComponent,
      componentProps: {
        titulo: 'Agregar Tipo de Crédito',
        formConfig
      }
    });

    await modal.present();

    const { data: formData } = await modal.onDidDismiss();

    if (formData) {
      const { cobros, ...datosCredito } = formData;
      console.log('Datos a enviar al backend:', datosCredito);

      const result = await this.creditosService.insertCredit(datosCredito);
      const nuevoCredito = result.data;
      const errorCredito = result.error;

      console.log('Nuevo crédito:', nuevoCredito, 'Error:', errorCredito);

      if (errorCredito || !Array.isArray(nuevoCredito) || nuevoCredito.length === 0 || !nuevoCredito[0]?.id) {
        const toast = await this.toastController.create({
          message: 'Error al crear el crédito.',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
        return;
      }

      const creditId = nuevoCredito[0].id;

      const errorCobros = await this.creditosService.actualizarCobrosCredito(creditId, cobros);

      if (errorCobros) {
        const toast = await this.toastController.create({
          message: 'Crédito creado, pero hubo un error al asociar cobros.',
          duration: 3000,
          color: 'warning'
        });
        await toast.present();
      } else {
        const toast = await this.toastController.create({
          message: 'Crédito creado con éxito.',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
      }

      await this.cargarCreditosDesdeServicio();
    }


  }

}
