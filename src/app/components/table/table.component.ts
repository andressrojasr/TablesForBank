import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { ColDef, Theme, themeQuartz, GridApi } from 'ag-grid-community';
import { Credit } from 'src/app/models/credit.model';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: false,
})
export class TableComponent  implements OnInit {
  @ViewChild('agGrid', { read: ElementRef }) agGridRef!: ElementRef;
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
  colDefs: ColDef[] = [
    { field: "numCuota", headerName: "Número de cuota" },
    { field: "cuota", headerName: "Cuota" },
    { field: "interes", headerName: "Interés" },
    { field: "capital", headerName: "Capital" },
    { field: "saldo", headerName: "Saldo" },
  ];
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
        this.tasa= credit.anualRate;
        this.creditForm.get('tasa').setValue(this.tasa+'%');
        this.minCredit = credit.minCredit;
        this.maxCredit = credit.maxCredit;
        this.minTime = credit.minTime;
        this.maxTime = credit.maxTime;
        this.showTasa = true;
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
          min = this.minTime /12;
          max = this.maxTime /12;
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

    for (let i = 1; i <= plazo; i++) {
      const interes = saldo * tasaMensual;
      const cuota = amortizacion + interes;
      saldo -= amortizacion;

      this.rowData.push({
        numCuota: i,
        cuota: parseFloat(cuota.toFixed(2)),
        interes: parseFloat(interes.toFixed(2)),
        capital: parseFloat(amortizacion.toFixed(2)),
        saldo: parseFloat(Math.max(saldo, 0).toFixed(2))
      });
    }
  }

  calcularAmortizacionFrancesa(monto: number, tasaMensual: number, plazo: number) {
    let saldo = monto;
    this.rowData = [];

    const cuota = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazo)) /
                  (Math.pow(1 + tasaMensual, plazo) - 1);

    for (let i = 1; i <= plazo; i++) {
      const interes = saldo * tasaMensual;
      const capital = cuota - interes;
      saldo -= capital;

      this.rowData.push({
        numCuota: i,
        cuota: parseFloat(cuota.toFixed(2)),
        interes: parseFloat(interes.toFixed(2)),
        capital: parseFloat(capital.toFixed(2)),
        saldo: parseFloat(Math.max(saldo, 0).toFixed(2))
      });
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
    this.paginationEnabled = false;
    const gridElement = this.agGridRef?.nativeElement;

    if (!gridElement) {
      alert('No se encontró la tabla para imprimir.');
      return;
    }

    const tablaHTML = gridElement.querySelector('.ag-root-wrapper')?.outerHTML;

    if (!tablaHTML) {
      alert('La tabla aún no ha terminado de renderizarse.');
      return;
    }

    // Datos del formulario
    const { amount, term, termUnit, creditType } = this.creditForm.value;
    const tasaAnual = this.tasa; // O toma tu tasa real si es dinámica
    const tasaMensual = (tasaAnual / 12);
    const credit: Credit = this.creditTypes.find(credit => credit.id === creditType)
    const ventana = window.open('', '', 'width=1200,height=800');
    if (ventana) {
      ventana.document.write(`
        <html>
          <head>
            <title>Tabla de Amortización - ${this.typeTable}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.css">
            <style>
              @page {
                size: landscape;
                margin: 20mm;
              }
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
              }
              .ag-theme-alpine {
                height: auto;
                width: 100%;
              }
              h2 {
                text-align: center;
                margin-bottom: 20px;
              }
              .datos-creditos {
                margin-bottom: 20px;
                font-size: 16px;
              }
            </style>
          </head>
          <body>
            <h2>Tabla de Amortización - ${this.typeTable}</h2>
            <div class="datos-creditos">
              <p><strong>Tipo de Crédito:</strong> ${creditType} - ${credit.name}</p>
              <p><strong>Monto:</strong> $${Number(amount).toFixed(2)}</p>
              <p><strong>Plazo:</strong> ${term} ${termUnit === 'years' ? 'años' : 'meses'}</p>
              <p><strong>Tasa de Interés:</strong> ${termUnit ==='years' ? tasaAnual + '% anual' : tasaMensual.toFixed(2) +'% mensual'}</p>
            </div>
            <div class="ag-theme-alpine">
              ${tablaHTML}
            </div>
          </body>
        </html>
      `);
      ventana.document.close();
      ventana.focus();

      setTimeout(() => {
        ventana.print();
        ventana.close();
      }, 1000);
    }
    this.paginationEnabled = true;
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
