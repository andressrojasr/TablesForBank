import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TableComponent } from './table/table.component';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgregarModalComponent } from './agregar-modal/agregar-modal.component';
import { EditarModalComponent } from './editar-modal/editar-modal.component';

ModuleRegistry.registerModules([AllCommunityModule]);

@NgModule({
  declarations: [TableComponent, AgregarModalComponent,EditarModalComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    FormsModule,
    AgGridAngular,
  ],
  exports: [TableComponent, AgregarModalComponent, EditarModalComponent]
})
export class ComponentsModule { }
