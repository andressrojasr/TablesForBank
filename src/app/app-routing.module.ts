import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule),
    canActivate: []
  },
  {
    path: 'admin-institucion',
    loadChildren: () => import('./admin-institucion/admin-institucion.module').then( m => m.AdminInstitucionPageModule),
    canActivate: []

  },
  {
    path: 'admin-creditos',
    loadChildren: () => import('./admin-creditos/admin-creditos.module').then( m => m.AdminCreditosPageModule)
  },
  {
    path: 'admin-cobros',
    loadChildren: () => import('./admin-cobros/admin-cobros.module').then( m => m.AdminCobrosPageModule)
  },
  {
    path: 'admin-inversiones',
    loadChildren: () => import('./admin-inversiones/admin-inversiones.module').then( m => m.AdminInversionesPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
