import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminInversionesPage } from './admin-inversiones.page';

const routes: Routes = [
  {
    path: '',
    component: AdminInversionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminInversionesPageRoutingModule {}
