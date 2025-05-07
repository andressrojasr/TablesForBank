import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistroAsesoresPageRoutingModule } from './registro-asesores-routing.module';

import { RegistroAsesoresPage } from './registro-asesores.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    RegistroAsesoresPageRoutingModule
  ],
  declarations: [RegistroAsesoresPage]
})
export class RegistroAsesoresPageModule {}
