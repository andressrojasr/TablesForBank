import { Component, inject, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { AuthService } from '../services/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false,

})
export class AdminPage implements OnInit {
  canEditInstitution = false;
  canCreateAsesores = false;
  authService: AuthService = inject(AuthService);
  navCtrl = inject(NavController);

  constructor(private supabase: SupabaseService) {
    const rol = this.supabase.currentUserRole;
    this.canEditInstitution = rol === 'admin';
    this.canCreateAsesores = rol === 'admin';
  }
  ngOnInit() {
  }

  logout() {
    this.authService.logout();
    this.navCtrl.navigateRoot('/home');
  }


}
