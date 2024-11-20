import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CommonModule
  ],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent {
  cards = [
    { title: 'Carte 1', content: 'Contenu de la carte 1' },
    { title: 'Carte 2', content: 'Contenu de la carte 2' },
    { title: 'Carte 3', content: 'Contenu de la carte 3' }
  ];
  

}
