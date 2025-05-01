import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TableComponent } from './table/table.component';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { InvestmentsComponent } from './investments/investments.component';

ModuleRegistry.registerModules([AllCommunityModule]);

@NgModule({
  declarations: [TableComponent, InvestmentsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    FormsModule,
    AgGridAngular,
  ],
  exports: [TableComponent, InvestmentsComponent]
})
export class ComponentsModule { }
