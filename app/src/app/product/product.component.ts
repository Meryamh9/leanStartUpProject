// product.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SupabaseService } from '../supabase.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIcon],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  cards: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.loadAds();
  }

  async loadAds() {
    try {
      const ads = await this.supabaseService.getAd();

      // On mappe les données de "Ad" pour correspondre
      // @ts-ignore
      this.cards = ads.map((ad: any) => ({
        title: ad.title,
        location: ad.location,
        price: ad.price,
        image: ad.images,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des produits :', error);
    }
  }
}