import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminInstitucionPageRoutingModule } from './admin-institucion-routing.module';

import { AdminInstitucionPage } from './admin-institucion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminInstitucionPageRoutingModule
  ],
  declarations: [AdminInstitucionPage]
})
export class AdminInstitucionPageModule {}
