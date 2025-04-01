import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Router, RouterModule } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { SupabaseService } from '../services/supabase.service';
@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, RouterModule],
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
})
export class ConnexionComponent implements OnInit {
  email: string = '';
  password: string = '';
  message: string | null = null; // Variable pour stocker le message de redirection

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Récupérer le message de redirection depuis les paramètres de l'URL
    this.route.queryParams.subscribe(params => {
      this.message = params['message'] || null;
    });
  }

  async signIn() {
    try {
      const response = await this.supabaseService.signIn(this.email, this.password);
      alert('Connexion réussie !');
      console.log('Utilisateur connecté :', response);

      // Stocker l'utilisateur dans localStorage
      localStorage.setItem('user', JSON.stringify(response));

      // Rediriger vers la page où l'utilisateur voulait aller avant
      this.router.navigate(['/home']);
    } catch (error) {
      alert('Échec de la connexion. Vérifiez vos identifiants.');
    }
  }
}
