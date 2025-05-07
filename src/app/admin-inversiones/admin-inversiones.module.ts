import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminInversionesPageRoutingModule } from './admin-inversiones-routing.module';
import { AdminInversionesPage } from './admin-inversiones.page';
import {ComponentsModule} from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminInversionesPageRoutingModule,
    ComponentsModule
  ],
  declarations: [AdminInversionesPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AdminInversionesPageModule {}
