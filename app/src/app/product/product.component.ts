import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  cards = [
    { title: 'Lot de palettes', location: 'Bordeaux 33000', price: 55, image: 'assets/images/cycle1.jpg' },
    { title: 'Canapé', location: 'Lille 59800', price: 20, image: 'assets/images/canape.jpg' },
    { title: 'Table', location: 'Paris 75000', price: 9, image: 'assets/images/table.jpg' },
    { title: 'Table de salle à manger', location: 'Nantes 44000', price: 80, image: 'assets/images/salle-manger.jpg' },
    { title: 'Lot de tables', location: 'Marseille 13000', price: 100, image: 'assets/images/lot-tables.jpg' },
    { title: 'Chevet', location: 'Lyon 69000', price: 15, image: 'assets/images/chevet.jpg' },
  ];

}
