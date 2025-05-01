import { Component, OnInit } from '@angular/core';
import { IonCard } from "@ionic/angular/standalone";

@Component({
  selector: 'app-investments',
  templateUrl: './investments.component.html',
  styleUrls: ['./investments.component.scss'],
  standalone: false,
})
export class InvestmentsComponent  implements OnInit {

  monto: number = 500;
  modoPlazo: 'meses' | 'dias' = 'meses';
  plazoMeses: number = 60;
  plazoDias: number = 31;

  tasa: number = 0.058; // Tasa anual
  ganancia: number | null = null;
  plazoSeleccionado: string = '';

  ngOnInit() {
    this.calcular();
  }

  onMontoChange() {
    this.monto = Math.min(Math.max(this.monto, 500), 5000000);
    this.calcular();
  }

  onModoChange() {
    this.calcular();
  }

  calcular() {
    const dias = this.modoPlazo === 'meses' ? this.plazoMeses * 30 : this.plazoDias;
    this.plazoSeleccionado = `${this.modoPlazo === 'meses' ? this.plazoMeses + ' meses' : this.plazoDias + ' días'}`;
    const gananciaCalc = this.monto * this.tasa * (dias / 365);
    this.ganancia = parseFloat(gananciaCalc.toFixed(2));
  }

}
