import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [MatCardModule, CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  product: any;

  constructor(private route: ActivatedRoute,
    private supabaseService: SupabaseService) {
  }

  ngOnInit(): void {
    this.loadProduct();
  }

  async loadProduct() {
    const productId = this.route.snapshot.paramMap.get('id');

    if (!productId) {
      console.warn('Aucun identifiant de produit fourni');
      return;
    }

    try {
      const product = await this.supabaseService.getProductById(productId);

      if (!product) {
        console.warn('Aucun produit récupéré');
        this.product = null;
        return;
      }

      this.product = product;
    } catch (error) {
      console.error('Erreur lors de la récupération du produit :', error);
    }
  }
}
