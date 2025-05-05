import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminInstitucionPage } from './admin-institucion.page';

const routes: Routes = [
  {
    path: '',
    component: AdminInstitucionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminInstitucionPageRoutingModule {}
