import { Component } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.scss'],
})
export class InscriptionComponent {
  email: string = '';
  password: string = '';

  constructor(private supabaseService: SupabaseService) {}

  async signUp() {
    try {
      const response = await this.supabaseService.signUp(this.email, this.password);
      console.log('Inscription réussie :', response);
      alert('Inscription réussie. Vérifiez votre email pour la confirmation.');
    } catch (error) {
      console.error('Erreur lors de l\'inscription :');
      alert('Erreur lors de l\'inscription : ');
    }
  }
}
