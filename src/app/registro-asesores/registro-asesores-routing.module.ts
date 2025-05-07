import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistroAsesoresPage } from './registro-asesores.page';

const routes: Routes = [
  {
    path: '',
    component: RegistroAsesoresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistroAsesoresPageRoutingModule {}
