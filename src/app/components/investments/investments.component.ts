import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-investments',
  templateUrl: './investments.component.html',
  styleUrls: ['./investments.component.scss'],
  standalone: false
})
export class InvestmentsComponent implements OnInit {
  // Datos del formulario
  monto: number = 0;
  modoPlazo: 'meses' | 'dias' = 'meses';
  plazoMeses: number = 0;
  plazoDias: number = 0;
  ganancia: number | null = null;
  plazoSeleccionado: string = '';
  
  // Datos de inversiones
  tiposInversion: any[] = [];
  tipoInversionSeleccionado: any = null;
  loading: boolean = true;
  
  // Rangos calculados
  minMeses: number = 0;
  maxMeses: number = 0;
  minDias: number = 0;
  maxDias: number = 0;
  rangoPlazoTexto: string = '';

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadInvestmentData();
  }

  async loadInvestmentData() {
    this.loading = true;
    const { data, error } = await this.supabaseService.getInvestments();

    if (error) {
      console.error('Error al obtener inversiones:', error);
      this.loading = false;
      return;
    }

    if (data && data.length > 0) {
      this.tiposInversion = data;
      this.tipoInversionSeleccionado = this.tiposInversion[0];
      this.updateDatosInversion();
    }
    this.loading = false;
  }

  updateDatosInversion() {
    if (!this.tipoInversionSeleccionado) return;
    
    this.monto = this.tipoInversionSeleccionado.min_amount;
    
    // Calcular valores para los rangos
    this.minDias = this.tipoInversionSeleccionado.min_duration;
    this.maxDias = this.tipoInversionSeleccionado.max_duration;
    this.minMeses = Math.floor(this.minDias / 30);
    this.maxMeses = Math.floor(this.maxDias / 30);
    
    this.plazoMeses = this.minMeses;
    this.plazoDias = this.minDias;
    
    this.actualizarRangoPlazoTexto();
    this.calcular();
  }

  actualizarRangoPlazoTexto() {
    this.rangoPlazoTexto = this.modoPlazo === 'meses' 
      ? `${this.minMeses} a ${this.maxMeses} meses`
      : `${this.minDias} a ${this.maxDias} días`;
  }

  onTipoInversionChange() {
    this.updateDatosInversion();
  }

  onMontoChange() {
    if (this.tipoInversionSeleccionado) {
      this.monto = Math.min(
        Math.max(this.monto, this.tipoInversionSeleccionado.min_amount),
        this.tipoInversionSeleccionado.max_amount
      );
      this.calcular();
    }
  }

  onModoChange() {
    this.actualizarRangoPlazoTexto();
    this.calcular();
  }

  onPlazoChange() {
    this.calcular();
  }

  calcular() {
    if (!this.tipoInversionSeleccionado) return;

    const dias = this.modoPlazo === 'meses' ? this.plazoMeses * 30 : this.plazoDias;
    
    // Validar que el plazo esté dentro de los rangos permitidos
    if (dias < this.minDias) {
      this.plazoDias = this.minDias;
      this.plazoMeses = this.minMeses;
    } else if (dias > this.maxDias) {
      this.plazoDias = this.maxDias;
      this.plazoMeses = this.maxMeses;
    }

    this.plazoSeleccionado = `${this.modoPlazo === 'meses' ? this.plazoMeses + ' meses' : this.plazoDias + ' días'}`;
    const gananciaCalc = this.monto * (this.tipoInversionSeleccionado.interest_rate / 100) * (dias / 365);
    this.ganancia = parseFloat(gananciaCalc.toFixed(2));
  }
}