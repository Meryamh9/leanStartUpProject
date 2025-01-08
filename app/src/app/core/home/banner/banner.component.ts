import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../supabase.service'

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {
  latestAds: any[] = []; // Tableau pour stocker les annonces

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.loadLatestAds();
  }

  async loadLatestAds() {
    try {
      this.latestAds = await this.supabaseService.getLatestAds(3); // Récupère 3 annonces
      console.log('Dernières annonces chargées dans le BannerComponent :', this.latestAds);
    } catch (error) {
      console.error('Erreur lors du chargement des dernières annonces :', error);
    }
  }
}
