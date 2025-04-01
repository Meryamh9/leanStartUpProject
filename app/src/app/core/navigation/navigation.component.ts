import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavContent,
    MatSidenavContainer,
    RouterLink
  ],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  user: any = null;

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    // Récupère l'utilisateur connecté au démarrage
    this.user = await this.supabaseService.getUser();
    // Écoute les changements d'état d'authentification
    this.supabaseService.onAuthStateChange((event: string, session: any) => {
      this.user = session?.user || null;
    });
  }

  async logout() {
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['/connexion']); // ou '/login' selon votre routing
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }
}
