import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef, Theme, themeQuartz } from 'ag-grid-community';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: false,
})
export class TableComponent  implements OnInit {
  @ViewChild('agGrid', { read: ElementRef }) agGridRef!: ElementRef;
  fb = inject(FormBuilder);
  creditForm: FormGroup;
  showAmount = false;
  showTerm = false;
  showTermOption = false;
  typeTable = '';
  showTable = false;

  creditTypes = [
    { value: 'personal', label: 'Crédito Personal' },
    { value: 'hipotecario', label: 'Crédito Hipotecario' },
    { value: 'automotriz', label: 'Crédito Automotriz' },
  ];
  
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

  ngOnInit() {
    this.creditForm = this.fb.group({
      creditType: [null, Validators.required],
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
        const min = 1;
        const max = unit === 'years' ? 30 : 360;
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
    const tasaAnual = 0.12; // O toma tu tasa real si es dinámica
    const tasaMensual = (tasaAnual / 12) * 100;
  
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
              <p><strong>Tipo de Crédito:</strong> ${creditType}</p>
              <p><strong>Monto:</strong> $${Number(amount).toFixed(2)}</p>
              <p><strong>Plazo:</strong> ${term} ${termUnit === 'years' ? 'años' : 'meses'}</p>
              <p><strong>Interés Mensual:</strong> ${tasaMensual.toFixed(2)}%</p>
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
  }
  
}
