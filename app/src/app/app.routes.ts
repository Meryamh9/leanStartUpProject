import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./core/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'a-propos',
    loadChildren: () => import('./core/a-propos/a-propos.module').then(m => m.AProposModule)
  },
  {
    path: 'connexion',
    loadChildren: () => import('./core/connexion/connexion.module').then(m => m.ConnexionModule)
  },
  {
    path: 'inscription',
    loadChildren: () => import('./core/inscription/inscription.module').then(m => m.InscriptionModule)
  },
  {
    path: 'produit',
    loadChildren: () => import('./product/product.module').then(m => m.ProductModule)
  },
  {
    path: 'mettre-en-vente',
    loadChildren: () => import('./sale/sale.module').then(m => m.SaleModule)
  },
  {
    path: '**',
    redirectTo: ''  // Redirection vers la racine pour les routes non définies
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
