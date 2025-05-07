import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TableComponent } from './table/table.component';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { InvestmentsComponent } from './investments/investments.component';
import { AgregarModalComponent } from './agregar-modal/agregar-modal.component';
import { EditarModalComponent } from './editar-modal/editar-modal.component';
import { FormInversionComponent } from './form-inversion/form-inversion.component';
import { IonCard, IonCardContent, IonItem, IonInput, IonSelect, IonSelectOption, IonSegment, IonSegmentButton, IonLabel, IonList } from '@ionic/angular';

ModuleRegistry.registerModules([AllCommunityModule]);

@NgModule({
  declarations: [TableComponent, InvestmentsComponent, AgregarModalComponent,EditarModalComponent, FormInversionComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    FormsModule,
    AgGridAngular,
  ],
  exports: [TableComponent, InvestmentsComponent, AgregarModalComponent, EditarModalComponent, FormInversionComponent]
})
export class ComponentsModule { }
