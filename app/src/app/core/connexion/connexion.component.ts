import { Component } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, RouterModule],
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
})
export class ConnexionComponent {
  email: string = '';
  password: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async signIn() {
    try {
      const response = await this.supabaseService.signIn(this.email, this.password);
      alert('Connexion réussie !');
      console.log('Utilisateur connecté :', response);
      // Redirige vers la page d'accueil (/home) après connexion
      this.router.navigate(['/home']);
    } catch (error) {
      alert('Échec de la connexion. Vérifiez vos identifiants.');
    }
  }
}
