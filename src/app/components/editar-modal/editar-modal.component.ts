import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-editar-modal',
  templateUrl: './editar-modal.component.html',
  styleUrls: ['./editar-modal.component.scss'],
  standalone: false,
})
export class EditarModalComponent implements OnInit {
  @Input() data: any;
  @Input() formConfig: {
    label: string;
    field: string;
    type: string;
    options?: { id: number, label: string, value: any }[];
  }[] = [];
  @Input() title: string = 'Editar';
  @Input() saveFn!: (id: any, datos: any) => Promise<any>;

  editData: any = {};
  erroresCampos: { [campo: string]: string } = {};
  camposEnteros: string[] = ['minTime', 'maxTime', 'tiempo_minimo', 'tiempo_maximo'];

  constructor(private modalCtrl: ModalController, private toastController: ToastController) {}

  ngOnInit() {
    this.editData = { ...this.data };

    for (const campo of this.formConfig) {
      if (campo.type === 'select-multiple') {
        const valor = this.editData[campo.field];
        if (typeof valor === 'string') {
          this.editData[campo.field] = valor.split(',').map((id: string) => parseInt(id.trim(), 10));
        } else if (!Array.isArray(valor)) {
          this.editData[campo.field] = [];
        }
      }
    }
  }

  async guardar() {
    const nombre = this.editData['name']?.trim() || '';
    const soloNumeros = /^[0-9]+$/.test(nombre);
    const soloEspacios = /^\s*$/.test(nombre);

    if (soloNumeros || soloEspacios || nombre.length < 3) {
      this.erroresCampos['name'] = 'Nombre inválido.';
      return;
    }

    if (this.camposEnteros.some(f => this.editData[f]?.includes?.('.'))) {
      const toast = await this.toastController.create({
        message: 'Tiempos no deben tener decimales.',
        duration: 3000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    if (this.editData['minCredit'] || this.editData['minTime']) {
      if (!this.editData['minCredit'] || this.editData['minCredit'] === '0') {
        this.erroresCampos['minCredit'] = 'El campo no puede ser cero.';
        return;
      }

      if (!this.editData['minTime'] || this.editData['minTime'] === '0') {
        this.erroresCampos['minTime'] = 'El campo no puede ser cero.';
        return;
      }
    }

    for (let campo in this.editData) {
      if (typeof this.editData[campo] === 'string' && parseFloat(this.editData[campo]) === 0) {
        this.erroresCampos[campo] = `El campo no puede ser cero`;
        return;
      }
    }

    const camposVacios = this.formConfig.some(campo => {
      if (campo.type === 'select-multiple') return false;
      const valor = this.editData[campo.field];
      return valor === null || valor === undefined || valor.toString().trim() === '';
    });

    if (camposVacios || this.tieneErrores()) {
      const toast = await this.toastController.create({
        message: 'Por favor, completa todos los campos correctamente.',
        duration: 3000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    const result = await this.saveFn(this.data.id, this.editData);

    if (!result || (typeof result === 'object' && !result.message)) {
      await this.modalCtrl.dismiss({ actualizado: true });

      const toast = await this.toastController.create({
        message: 'Se ha editado con éxito',
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } else {
      let errorMessage = 'Ha ocurrido un error al intentar guardar.';

      if (typeof result.message === 'string' && result.message.includes('network')) {
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

  cerrar() {
    this.modalCtrl.dismiss();
  }

  validarCampoTexto(event: any, campo: string) {
    let valor = event.target.value || '';
    valor = valor.trimStart();

    const soloNumeros = /^[0-9]+$/.test(valor);
    const soloEspacios = /^\s*$/.test(valor);

    if (valor.startsWith('.')) {
      this.erroresCampos[campo] = 'No puede comenzar con punto.';
      this.editData[campo] = valor;
      return;
    }

    this.editData[campo] = valor;

    if (soloEspacios) {
      this.erroresCampos[campo] = 'El campo no puede estar vacío.';
    } else if (soloNumeros) {
      this.erroresCampos[campo] = 'No puede contener solo números.';
    } else if (valor.length < 3) {
      this.erroresCampos[campo] = 'Debe tener al menos 3 caracteres.';
    } else {
      this.erroresCampos[campo] = '';
    }
  }

  validarCampoNumerico(event: any, campo: string) {
    let valor = event.target.value;
    const esEntero = this.camposEnteros.includes(campo);
    let mensajeError = '';

    if (esEntero) {
      valor = valor.replace(/[^0-9]/g, '');
    } else {
      valor = valor.replace(/[^0-9.]/g, '');
      const partes = valor.split('.');

      if (partes.length > 2) {
        valor = partes[0] + '.' + partes[1];
      }

      if (partes.length === 2 && partes[1].length > 3) {
        partes[1] = partes[1].substring(0, 3);
        valor = partes[0] + '.' + partes[1];
      }
    }

    if (!valor || parseFloat(valor) === 0 || valor === '0.0' || valor === '0.00' || valor === '0.000') {
      mensajeError = 'El valor no puede ser cero ni vacío.';
    }

    if (campo === 'value' && this.editData['isPercentage']) {
      const numero = parseFloat(valor);
      if (isNaN(numero) || numero < 1 || numero > 100) {
        console.log('El valor debe ser un número entre 1 y 100.');
        mensajeError = 'Debe ser un valor entre 1 y 100 si es porcentaje.';
      }
    }

    this.editData[campo] = valor;
    this.erroresCampos[campo] = mensajeError;

    this.validarRelacionCampos();
  }

  restringirTeclas(event: KeyboardEvent, campo: string) {
    const tecla = event.key;
    const esEntero = this.camposEnteros.includes(campo);

    if (["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(tecla)) return;

    const input = event.target as HTMLInputElement;
    const valorActual = input.value;
    const cursorPos = input.selectionStart ?? valorActual.length;

    const esNumero = /^[0-9]$/.test(tecla);
    const esPunto = tecla === '.';

    if (valorActual === '' && (esPunto || tecla === '0')) {
      event.preventDefault();
      return;
    }

    if (esEntero) {
      if (!esNumero) {
        event.preventDefault();
      }
      return;
    }

    if (esPunto) {
      if (valorActual.includes('.')) {
        event.preventDefault();
      }
      return;
    }

    if (!esNumero) {
      event.preventDefault();
      return;
    }

    const puntoIndex = valorActual.indexOf('.');
    if (puntoIndex !== -1 && cursorPos > puntoIndex) {
      const decimales = valorActual.split('.')[1] || '';
      if (decimales.length >= 3) {
        event.preventDefault();
      }
    }

  }

  validarRelacionCampos() {
    const minCredit = parseFloat(this.editData['minCredit']);
    const maxCredit = parseFloat(this.editData['maxCredit']);
    const minTime = parseFloat(this.editData['minTime']);
    const maxTime = parseFloat(this.editData['maxTime']);

    if (!isNaN(minCredit) && !isNaN(maxCredit)) {
      if (minCredit >= maxCredit) {
        this.erroresCampos['minCredit'] = 'Debe ser menor que el máximo.';
      } else if (this.erroresCampos['minCredit'] === 'Debe ser menor que el máximo.') {
        delete this.erroresCampos['minCredit'];
      }
    }

    if (!isNaN(minTime) && !isNaN(maxTime)) {
      if (minTime >= maxTime) {
        this.erroresCampos['minTime'] = 'Debe ser menor que el máximo.';
      } else if (this.erroresCampos['minTime'] === 'Debe ser menor que el máximo.') {
        delete this.erroresCampos['minTime'];
      }
    }
  }

  tieneErrores(): boolean {
    return Object.values(this.erroresCampos).some(msg => msg !== '');
  }
  toggleChanged() {
    this.validarCampoNumerico({ target: { value: this.editData['value'] } }, 'value');
  }
}
