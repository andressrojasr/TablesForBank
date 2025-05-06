import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminCreditosPage } from './admin-creditos.page';

const routes: Routes = [
  {
    path: '',
    component: AdminCreditosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminCreditosPageRoutingModule {}
