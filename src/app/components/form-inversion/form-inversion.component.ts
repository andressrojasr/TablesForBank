import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-form-inversion',
  templateUrl: './form-inversion.component.html',
  styleUrls: ['./form-inversion.component.scss'],
  standalone: false,
})
export class FormInversionComponent implements OnInit {
  @Input() inversion: any;
  form = this.fb.group({
    investment_type: ['', Validators.required],
    interest_rate: [0, [Validators.required, Validators.min(0.01), Validators.max(100)]],
    min_amount: [0, [Validators.required, Validators.min(1)]],
    max_amount: [0, [Validators.required, Validators.min(1)]],
    min_duration: [0, [Validators.required, Validators.min(1)]],
    max_duration: [0, [Validators.required, Validators.min(1)]]
  });
  loading = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private supabase: SupabaseService
  ) {}

  ngOnInit() {
    if (this.inversion) {
      this.form.patchValue(this.inversion);
    }
  }

  async guardar() {
    if (this.form.invalid) return;

    this.loading = true;
    const formData = this.form.value;

    try {
      if (this.inversion) {
        // Actualizar
        const { error } = await this.supabase.updateInvestment(this.inversion.id, formData);
        if (error) throw error;
      } else {
        // Crear
        const { error } = await this.supabase.createInvestment(formData as any);
        if (error) throw error;
      }

      this.modalCtrl.dismiss({ success: true });
    } catch (error: any) {
      console.error('Error guardando inversión:', error);
      alert('Error: ' + error.message);
    } finally {
      this.loading = false;
    }
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }
}