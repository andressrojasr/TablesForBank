import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminPage } from './admin.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPage,
    children:[
      {
        path:'institucion',
        loadChildren:() => import('../admin-institucion/admin-institucion.module').then(m => m.AdminInstitucionPageModule)
      },
      {
        path:'creditos',
        loadChildren:() => import('../admin-creditos/admin-creditos.module').then(m => m.AdminCreditosPageModule)
      },
      {
        path:'cobros',
        loadChildren:() => import('../admin-cobros/admin-cobros.module').then(m => m.AdminCobrosPageModule)
      },
      {
        path:'',
        redirectTo:'creditos',
        pathMatch:'full'
      }
    ],
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
