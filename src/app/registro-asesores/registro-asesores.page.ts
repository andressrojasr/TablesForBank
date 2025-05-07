import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { ToastController, NavController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro-asesores',
  templateUrl: './registro-asesores.page.html',
  styleUrls: ['./registro-asesores.page.scss'],
  standalone: false,
})
export class RegistroAsesoresPage {

  asesorForm: FormGroup;

  fb = inject(FormBuilder);
  supabase = inject(SupabaseService);
  toastCtrl = inject(ToastController);
  navCtrl = inject(NavController);

  constructor() {
    this.asesorForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onRegistrarAsesor() {
    const { email, password, nombre } = this.asesorForm.value;

    const { data: signUpData, error: signUpError } = await this.supabase.getClient().auth.signUp({
      email,
      password
    });

    if (signUpError) {
      this.presentToast('Error al crear usuario: ' + signUpError.message, 'danger');
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      this.presentToast('No se pudo obtener el ID del usuario.', 'danger');
      return;
    }

    const { error: insertError } = await this.supabase.getClient().from('usuarios').insert({
      id: userId,
      nombre,
      rol: 'asesor'
    });

    if (insertError) {
      this.presentToast('Error al guardar datos del asesor: ' + insertError.message, 'danger');
      return;
    }

    this.presentToast('Asesor registrado exitosamente.', 'success');
    this.asesorForm.reset();
    this.navCtrl.navigateBack('/admin');
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }
}
