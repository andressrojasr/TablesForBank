import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false,

})
export class AdminPage implements OnInit {
  canEditInstitution = false;
  canCreateAsesores = false;
  constructor(private supabase: SupabaseService) {
    const rol = this.supabase.currentUserRole;
    this.canEditInstitution = rol === 'admin';
    this.canCreateAsesores = rol === 'admin';
  }
  ngOnInit() {
  }

}
