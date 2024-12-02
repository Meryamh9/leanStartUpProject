import { Component } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
})
export class ConnexionComponent {
  email: string = ''; // Stocke l'email de l'utilisateur
  password: string = ''; // Stocke le mot de passe de l'utilisateur

  constructor(private supabaseService: SupabaseService) {}

  async signIn() {
    try {
      const response = await this.supabaseService.signIn(this.email, this.password);
      alert('Connexion réussie !');
      console.log('Utilisateur connecté :', response);
    } catch (error) {
      alert('Échec de la connexion. Vérifiez vos identifiants.');
    }
  }
}
