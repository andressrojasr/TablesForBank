import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-agregar-modal',
  templateUrl: './agregar-modal.component.html',
  styleUrls: ['./agregar-modal.component.scss'],
  standalone: false,
})
export class AgregarModalComponent implements OnInit {
  erroresCampos: { [campo: string]: string } = {};
  camposEnteros: string[] = ['minTime', 'maxTime', 'tiempo_minimo', 'tiempo_maximo'];
  @Input() titulo: string = 'Agregar ítem';
  @Input() formConfig: {
    label: string;
    field: string;
    type: string;
    options?: { label: string; value: any }[];
  }[] = [];

  formData: any = {};

  constructor(private modalCtrl: ModalController, private toastController: ToastController) {}

  ngOnInit(): void {
    for (const campo of this.formConfig) {
      if (campo.type === 'select-multiple') {
        this.formData[campo.field] = [];
      } else {
        this.formData[campo.field] = '';
      }
    }
  }
  async guardar() {
    const nombre = this.formData['name']?.trim() || '';
    const soloNumeros = /^[0-9]+$/.test(nombre);
    const soloEspacios = /^\s*$/.test(nombre);

    if (soloNumeros || soloEspacios || nombre.length < 3) {
      console.warn('Nombre inválido');
      return;
    }

    if (this.camposEnteros.some(f => this.formData[f]?.includes('.'))) {
      console.warn('Tiempos no deben tener decimales');
      return;
    }

    if (this.formData['minCredit'] || this.formData['minTime']){

      if (!this.formData['minCredit'] || this.formData['minCredit'] === '0') {
        console.warn('El campo minCredit no puede ser cero ni vacío.');
        return;
      }

      if (!this.formData['minTime'] || this.formData['minTime'] === '0') {
        console.warn('El campo minTime no puede ser cero ni vacío.');
        return;
      }
    }

    for (let campo in this.formData) {
      if (typeof this.formData[campo] === 'string' && parseFloat(this.formData[campo]) === 0) {
        console.warn(`El campo ${campo} no puede ser cero`);
        return;
      }
    }

    const camposVacios = this.formConfig.some(campo => {
      if (campo.type === 'select-multiple') return false;
      const valor = this.formData[campo.field];
      return valor === null || valor === undefined || valor.toString().trim() === '';
    });

    if (camposVacios) {
      const toast = await this.toastController.create({
        message: 'Por favor, completa todos los campos.',
        duration: 3000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    console.log('Datos a guardar:', this.formData);

    await this.modalCtrl.dismiss(this.formData);

    const toast = await this.toastController.create({
      message: 'Se ha agregado con éxito.',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
}

validarCampoNumerico(event: any, campo: string) {
    let valor = event.target.value;
    const esEntero = campo === 'minTime' || campo === 'maxTime';

    if (esEntero) {
      valor = valor.replace(/[^0-9]/g, '');
    } else {
      valor = valor.replace(/[^0-9.]/g, '');

      const partes = valor.split('.');
      if (partes.length > 2) {
        valor = partes[0] + '.' + partes[1]; // ignora puntos adicionales
      }

      if (partes.length === 2 && partes[1].length > 3) {
        partes[1] = partes[1].substring(0, 3);
        valor = partes[0] + '.' + partes[1];
      }
    }

    if (valor === '' || valor === '0' || valor === '0.0' || valor === '0.00' || valor === '0.000') {
      this.erroresCampos[campo] = 'El valor no puede ser cero ni vacío.';
    } else {
      this.erroresCampos[campo] = '';
    }
    if (!valor || parseFloat(valor) === 0) {
      this.erroresCampos[campo] = 'El valor no puede ser cero ni vacío.';
    } else {
      this.erroresCampos[campo] = '';
    }

    this.formData[campo] = valor;

    this.validarRelacionCampos();
}


validarRelacionCampos() {
  const minCredit = parseFloat(this.formData['minCredit']);
  const maxCredit = parseFloat(this.formData['maxCredit']);
  const minTime = parseFloat(this.formData['minTime']);
  const maxTime = parseFloat(this.formData['maxTime']);

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

  restringirTeclas(event: KeyboardEvent, campo: string) {
    const tecla = event.key;
    const esEntero = this.camposEnteros.includes(campo);

    if (['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(tecla)) return;

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

  validarCampoTexto(event: any, campo: string) {
    let valor = event.target.value || '';
    valor = valor.trimStart();

    const soloNumeros = /^[0-9]+$/.test(valor);
    const soloEspacios = /^\s*$/.test(valor);

    if (valor.startsWith('.')) {
      this.erroresCampos[campo] = 'No puede comenzar con punto.';
      this.formData[campo] = valor;
      return;
    }

    this.formData[campo] = valor;

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

  tieneErrores(): boolean {
    return Object.values(this.erroresCampos).some(msg => msg !== '');
  }
}
