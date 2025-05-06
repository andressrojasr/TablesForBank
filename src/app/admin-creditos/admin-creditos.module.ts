import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminCreditosPageRoutingModule } from './admin-creditos-routing.module';

import { AdminCreditosPage } from './admin-creditos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminCreditosPageRoutingModule
  ],
  declarations: [AdminCreditosPage]
})
export class AdminCreditosPageModule {}
