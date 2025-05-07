import { Bank } from '../models/bank.model';
import { SupabaseService } from './../services/supabase.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-institucion',
  templateUrl: './admin-institucion.page.html',
  styleUrls: ['./admin-institucion.page.scss'],
  standalone: false,
})
export class AdminInstitucionPage implements OnInit {
  banco: Bank = {} as Bank;
  editando: boolean = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private supabaseService: SupabaseService) { }

  async ngOnInit() {
    await this.loadBankInformation();
  }

  async loadBankInformation() {
    try {
      const response = await this.supabaseService.getInformationBank();
      if (response.data && response.data.length > 0) {
        this.banco = response.data[0];
      } else {
        console.error('No se encontraron datos del banco:', response.error);
      }
    } catch (error) {
      console.error('Error al obtener la información del banco:', error);
    }
  }

  empezarEdicion() {
    this.editando = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async guardarBanco() {

  if (this.nombreInvalido) {
    console.warn('El nombre del banco no puede contener solo números');
    return;
  }
    let logoUrl = this.banco.logo;

    if (this.selectedFile) {
      const fileExt = this.selectedFile.name.split('.').pop();
      const filePath = `${this.banco.id}.${fileExt}`;

      try {
        const { url, error: uploadError } = await this.supabaseService.uploadImage('bank', filePath, this.selectedFile);
        if (uploadError) {
          console.error('Error subiendo el logo:', uploadError);
          console.error('Detalles del error de subida de archivo:', JSON.stringify(uploadError, null, 2));
          return;
        }
        logoUrl = `${url}?t=${Date.now()}`;

        console.log('Archivo subido correctamente:', url);
      } catch (uploadError) {
        console.error('Error inesperado al intentar subir el archivo:', uploadError);
        return;
      }
    }

    try {
      const error = await this.supabaseService.updateBank(this.banco.id, {
        name: this.banco.name,
        logo: logoUrl,
      });

      if (!error) {
        console.log('Cambios guardados correctamente');
        await this.loadBankInformation();
        this.editando = false;
        this.selectedFile = null;
        this.previewUrl = null;
      } else {
        console.error('Error al guardar los cambios:', error);
      }
    } catch (error) {
      console.error('Error inesperado al guardar los cambios:', error);
    }
  }
  nombreInvalido: boolean = false;
  mensajeErrorNombre: string = '';

  validarNombreBanco(event: any) {
    let valor = event.target.value || '';
    valor = valor.trimStart();
    this.banco.name = valor;

    if (valor.startsWith('.') || valor.startsWith('0')) {
      this.nombreInvalido = true;
      this.mensajeErrorNombre = 'No puede comenzar con punto ni con cero.';
      return;
    }

    const soloNumeros = /^[0-9]+$/.test(valor);
    const soloEspacios = /^\s*$/.test(valor);

    if (soloEspacios) {
      this.nombreInvalido = true;
      this.mensajeErrorNombre = 'El campo no puede estar vacío.';
    } else if (soloNumeros) {
      this.nombreInvalido = true;
      this.mensajeErrorNombre = 'No puede contener solo números.';
    } else if (valor.length < 5) {
      this.nombreInvalido = true;
      this.mensajeErrorNombre = 'Debe tener al menos 5 caracteres.';
    } else {
      this.nombreInvalido = false;
      this.mensajeErrorNombre = '';
    }
  }



}
