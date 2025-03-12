import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SupabaseService } from '../supabase.service';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  standalone: true,
  imports: [MatCardTitle, MatCard, MatCardContent, MatCardHeader, MatPaginator, MatCardSubtitle, MatIcon, CommonModule, RouterModule],
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  cards: any[] = [];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.loadAds();
  }

  async loadAds() {
    try {
      const ads = await this.supabaseService.getAd();
  
      if (!ads || !Array.isArray(ads)) { 
        console.warn("Aucune annonce récupérée");
        this.cards = [];
        return;
      }
  
      this.cards = ads.map((ad: any) => ({
        title: ad.title,
        location: ad.location,
        price: ad.price,
        image: ad.images,
      }));
  
      this.dataSource.data = this.cards;
      this.dataSource.paginator = this.paginator;
    } catch (error) {
      console.error("Erreur lors de la récupération des produits :", error);
    }
  }
  
}
