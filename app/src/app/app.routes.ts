import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
    path: '**',
    redirectTo: ''  // Redirection vers la racine pour les routes non définies
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
