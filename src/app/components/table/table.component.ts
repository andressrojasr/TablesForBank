import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, Theme, themeQuartz, GridApi } from 'ag-grid-community';
import { Charge } from 'src/app/models/charge';
import { Credit } from 'src/app/models/credit.model';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: false,
})
export class TableComponent  implements OnInit {
  @ViewChild('agGrid') agGrid!: AgGridAngular;
  fb = inject(FormBuilder);
  supabase = inject(SupabaseService);
  toastCtrl = inject(ToastController);
  alertCtrl = inject(AlertController);
  creditForm: FormGroup;
  showTasa = false;
  showAmount = false;
  showTerm = false;
  showTermOption = false;
  typeTable = '';
  showTable = false;
  paginationEnabled = true;

  credits: [] = [];
  tasa = 0;
  minCredit = 0;
  maxCredit = 0;
  minTime = 0;
  maxTime = 0;

  creditChannel: any;

  creditTypes: Credit[] = [];
  chargesForCredit: Charge[] = [];
  
  myTheme = themeQuartz.withParams({
    backgroundColor: '#f5f7fa',                   // Gris claro para fondo general
    foregroundColor: '#1a1a1a',                   // Texto oscuro para buena legibilidad
    headerTextColor: '#ffffff',                   // Blanco para los headers
    headerBackgroundColor: '#003366',             // Azul corporativo oscuro
    oddRowBackgroundColor: '#ffffff',             // Blanco para filas impares
    headerColumnResizeHandleColor: '#005599',     // Azul intermedio para el handle
    borderColor: '#d0d7de',                       // Bordes suaves y definidos
    accentColor: '#007acc',                       // Azul claro para selección/resaltado
    fontFamily: 'Segoe UI, Roboto, sans-serif',   // Fuente moderna y profesional
    fontSize: '14px'                              // Tamaño legible
  });

  theme: Theme | "legacy" = this.myTheme;
  defaultColDef: ColDef = {
    sortable: false,
    editable: false,
    flex: 1,
    minWidth: 100,
    filter: false,
  };

  rowData = [];

  // Column Definitions: Defines the columns to be displayed.
  baseColDefs: ColDef[] = [
    { field: "numCuota", headerName: "Número de cuota" },
    { field: "cuota", headerName: "Cuota" },
    { field: "interes", headerName: "Interés" },
    { field: "capital", headerName: "Capital" },
    { field: "saldo", headerName: "Saldo" },
  ];

  colDefs: ColDef[] = [...this.baseColDefs];
  constructor() { }

  async ngOnInit() {
    this.getCredits();

    this.creditChannel = this.supabase.subscribeToCreditChanges((payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        const newCredit = payload.new;
        if (payload.eventType === 'INSERT') {
          this.creditTypes = [...this.creditTypes, newCredit];
        } else if (payload.eventType === 'UPDATE') {
          this.creditTypes = this.creditTypes.map(credit =>
            credit.id === newCredit.id ? newCredit : credit
          );
        } else if (payload.eventType === 'DELETE') {
          const deletedCredit = payload.old;
          this.creditTypes = this.creditTypes.filter(credit => credit.id !== deletedCredit.id);
        }
      }
    });

    this.creditForm = this.fb.group({
      creditType: [null, Validators.required],
      tasa: [{ value: '', disabled: true }, Validators.required],
      amount: [{ value: '', disabled: true }, [
        Validators.required,
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      termUnit: [{ value: 'months', disabled: true }, Validators.required],
      term: [{ value: '', disabled: true }, [
        Validators.required,
        Validators.pattern(/^[0-9]+$/)
      ]],
    });

    // Al seleccionar tipo, habilitar monto
    this.creditForm.get('creditType').valueChanges.subscribe(val => {
      if (val) {
        let credit: Credit = this.creditTypes.find(credit => credit.id === val)
        this.showTable = false;
        this.tasa= credit.anualRate;
        this.creditForm.get('tasa').setValue(this.tasa+'%');
        this.minCredit = credit.minCredit;
        this.maxCredit = credit.maxCredit;
        this.minTime = credit.minTime;
        this.maxTime = credit.maxTime;
        this.showTasa = true;
        this.chargesForCredit = [];
        this.colDefs = [...this.baseColDefs];
        this.creditForm.get('amount').setValue('');
        this.creditForm.get('term').setValue('');
        this.getCreditCharge(credit.id).then(() => {
          this.buildChargeColumns();
          this.agGrid.api.redrawRows();
          this.agGrid.api.refreshCells({ force: true });
          this.agGrid.api.refreshHeader();
        })
        console.log(this.colDefs);
        this.creditForm.get('amount').setValidators([
          Validators.required,
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
          Validators.min(this.minCredit),
          Validators.max(this.maxCredit)
        ]);
        this.creditForm.get('amount').enable();
        this.showAmount = true;
        this.creditForm.get('termUnit').disable();
        this.showTermOption = false;
        this.showTerm = false;
      } else {
        this.creditForm.get('amount').disable();
        this.showAmount = false;
      }
    });

    // Al monto válido, habilitar unidad de plazo
    this.creditForm.get('amount').valueChanges.subscribe(() => {
      if (this.creditForm.get('amount').valid) {
        this.creditForm.get('termUnit').enable();
        this.showTermOption = true;
      } else {
        this.creditForm.get('termUnit').disable();
        this.showTermOption = false;
        this.showTerm = false;
      }
    });

    // Al seleccionar unidad, habilitar input de plazo
    this.creditForm.get('termUnit').valueChanges.subscribe(unit => {
      if (unit) {
        this.creditForm.get('term').enable();
        this.showTerm = true;
        // Ajustar validadores de rango según unidad
        let min = this.minTime;
        let max = this.maxTime;
        if (unit === 'years') {
          min = parseFloat((this.minTime/12).toFixed(0))
          max = parseFloat((this.maxTime/12).toFixed(0));
          
        }
        this.creditForm.get('term').setValidators([
          Validators.required,
          Validators.min(min),
          Validators.max(max),
          Validators.pattern(/^[0-9]+$/)
        ]);
        this.creditForm.get('term').updateValueAndValidity();
      }
    });
  }

  calcularAmortizacionAlemana(monto: number, tasaMensual: number, plazo: number) {
    let saldo = monto;
    const amortizacion = monto / plazo;
    this.rowData = [];
  
    // Pre-cálculo de cargos por periodo
    const perPeriodCharges = this.chargesForCredit.map(charge => {
      const total = charge.isPercentage
        ? monto * (charge.value / 100)
        : charge.value;
      return total / plazo;
    });
  
    for (let i = 1; i <= plazo; i++) {
      const interes = saldo * tasaMensual;
      const cuota   = amortizacion + interes;
      saldo        -= amortizacion;
  
      // construye la fila básica
      const fila: any = {
        numCuota: i,
        cuota:    parseFloat(cuota.toFixed(2)),
        interes:  parseFloat(interes.toFixed(2)),
        capital:  parseFloat(amortizacion.toFixed(2)),
        saldo:    parseFloat(Math.max(saldo, 0).toFixed(2)),
      };
      let cuotaTotal = parseFloat(cuota.toFixed(2));
      // añade dinámicamente cada cargo a la fila
      this.chargesForCredit.forEach((charge, idx) => {
        fila[`charge_${charge.id}`] = parseFloat(perPeriodCharges[idx].toFixed(2));
        cuotaTotal += perPeriodCharges[idx];
      });
      fila.cuotaTotal = parseFloat(cuotaTotal.toFixed(2));
      this.rowData.push(fila);
    }
  }
  

  calcularAmortizacionFrancesa(monto: number, tasaMensual: number, plazo: number) {
    let saldo = monto;
    this.rowData = [];
     // Pre-cálculo de cargos por periodo
     const perPeriodCharges = this.chargesForCredit.map(charge => {
      const total = charge.isPercentage
        ? monto * (charge.value / 100)
        : charge.value;
      return total / plazo;
    });
    const cuota = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazo)) /
                  (Math.pow(1 + tasaMensual, plazo) - 1);

    for (let i = 1; i <= plazo; i++) {
      const interes = saldo * tasaMensual;
      const capital = cuota - interes;
      saldo -= capital;

      // construye la fila básica
      const fila: any = {
        numCuota: i,
        cuota:    parseFloat(cuota.toFixed(2)),
        interes:  parseFloat(interes.toFixed(2)),
        capital:  parseFloat(capital.toFixed(2)),
        saldo:    parseFloat(Math.max(saldo, 0).toFixed(2)),
      };
      let cuotaTotal = parseFloat(cuota.toFixed(2));
      // añade dinámicamente cada cargo a la fila
      this.chargesForCredit.forEach((charge, idx) => {
        fila[`charge_${charge.id}`] = parseFloat(perPeriodCharges[idx].toFixed(2));
        cuotaTotal += perPeriodCharges[idx];
      });
      fila.cuotaTotal = parseFloat(cuotaTotal.toFixed(2));
      this.rowData.push(fila);
    }
  }

  generarAlemana() {
    if (this.creditForm.valid) {
      const { amount, term } = this.creditForm.value;
      const tasaAnual = 0.14;
      const tasaMensual = tasaAnual / 12;
      this.calcularAmortizacionAlemana(amount, tasaMensual, term);
      this.typeTable = 'Alemana';
      this.showTable = true;
    }
  }

  generarFrancesa() {
    if (this.creditForm.valid) {
      const { amount, term } = this.creditForm.value;
      const tasaAnual = 0.14;
      const tasaMensual = tasaAnual / 12;
      this.calcularAmortizacionFrancesa(amount, tasaMensual, term);
      this.typeTable = 'Francesa';
      this.showTable = true;
    }
  }

  imprimirTabla() {
    
  }

  private async getCredits() {
    try {
      const { data, error } = await this.supabase.getCredits();
      if (error) throw error;
      if (data) {
        this.creditTypes = data;
      }
    } catch (err) {
      const toast = await this.toastCtrl.create({
        message: 'Error al cargar creditos: '+ err.message,
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  private async getCreditCharge(id: Number) {
    try {
      const { data, error } = await this.supabase.getChargesForCredit(id);
      if (error) throw error;
      if (data) {
        this.chargesForCredit = data;
      }
    } catch (err) {
      const toast = await this.toastCtrl.create({
        message: 'Error al cargar datos del crédito: '+ err.message,
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  private buildChargeColumns() {
    // Parte base
    this.colDefs = [...this.baseColDefs];
    // Si hay cargos, agrégalos
    this.chargesForCredit.forEach(charge => {
      this.colDefs.push({
        field: `charge_${charge.id}`,
        headerName: `Cargo: ${charge.name}`
      });
    });
    // Ejemplo: cuota total si la necesitas siempre
    this.colDefs.push({
      field: 'cuotaTotal',
      headerName: 'Cuota Total'
    });
  }
  
  
  

  ngOnDestroy(): void {
    if (this.creditChannel) {
      this.creditChannel.unsubscribe();
    }
  }
  

  async showCreditInfo(credit: Credit) {
    const alert = await this.alertCtrl.create({
      header: `Crédito ${credit.name}`,
      message: `
        Información: ${credit.information}
      `,
      buttons: ['Cerrar'] // Botón para cerrar la alerta
    });

    await alert.present();
  }
}
