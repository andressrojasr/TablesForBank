import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminCobrosPage } from './admin-cobros.page';

const routes: Routes = [
  {
    path: '',
    component: AdminCobrosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminCobrosPageRoutingModule {}
