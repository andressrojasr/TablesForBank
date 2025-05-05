import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminCobrosPageRoutingModule } from './admin-cobros-routing.module';

import { AdminCobrosPage } from './admin-cobros.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminCobrosPageRoutingModule
  ],
  declarations: [AdminCobrosPage]
})
export class AdminCobrosPageModule {}
