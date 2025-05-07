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

  // Rangos (BD almacena meses)
  minMesesBD: number = 0;  // Valor original de BD (meses)
  maxMesesBD: number = 0;  // Valor original de BD (meses)
  minDias: number = 0;     // Calculado: minMesesBD * 30
  maxDias: number = 0;     // Calculado: maxMesesBD * 30
  rangoPlazoTexto: string = '';
  montoError: string = '';

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

    // Valores originales de la BD (en meses)
    this.minMesesBD = this.tipoInversionSeleccionado.min_duration;
    this.maxMesesBD = this.tipoInversionSeleccionado.max_duration;

    // Convertimos a días (asumiendo 30 días/mes)
    this.minDias = this.minMesesBD * 30;
    this.maxDias = this.maxMesesBD * 30;

    // Inicializamos con el mínimo permitido
    this.plazoMeses = this.minMesesBD;
    this.plazoDias = this.minDias;

    this.actualizarRangoPlazoTexto();
    this.calcular();
  }

  actualizarRangoPlazoTexto() {
    this.rangoPlazoTexto = this.modoPlazo === 'meses'
      ? `${this.minMesesBD} a ${this.maxMesesBD} meses`  // Muestra rangos en meses
      : `${this.minDias} a ${this.maxDias} días`;        // Muestra rangos en días
  }

  onTipoInversionChange() {
    this.updateDatosInversion();
  }

  onMontoChange() {
    if (this.tipoInversionSeleccionado) {
      const min = this.tipoInversionSeleccionado.min_amount;
      const max = this.tipoInversionSeleccionado.max_amount;

      if (this.monto < min) {
        this.montoError = `El monto mínimo permitido es $${min}`;
        this.ganancia = null;
        return;
      } else if (this.monto > max) {
        this.montoError = `El monto máximo permitido es $${max}`;
        this.ganancia = null;
        return;
      }

      this.montoError = '';
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

    // Convertimos el plazo seleccionado a días para cálculos
    let dias = 0;
    if (this.modoPlazo === 'meses') {
      dias = this.plazoMeses * 30;  // Convertir meses a días

      // Validar rango en meses
      if (this.plazoMeses < this.minMesesBD) {
        this.plazoMeses = this.minMesesBD;
      } else if (this.plazoMeses > this.maxMesesBD) {
        this.plazoMeses = this.maxMesesBD;
      }
    } else {
      dias = this.plazoDias;

      // Validar rango en días
      if (this.plazoDias < this.minDias) {
        this.plazoDias = this.minDias;
      } else if (this.plazoDias > this.maxDias) {
        this.plazoDias = this.maxDias;
      }
    }

    this.plazoSeleccionado = this.modoPlazo === 'meses'
      ? `${this.plazoMeses} meses`
      : `${this.plazoDias} días`;

    const gananciaCalc = this.monto * (this.tipoInversionSeleccionado.interest_rate / 100) * (dias / 365);
    this.ganancia = parseFloat(gananciaCalc.toFixed(2));
  }
}
