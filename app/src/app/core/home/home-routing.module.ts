import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BannerComponent } from './banner/banner.component';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'banner', // /banner affichera le BannerComponent
        component: BannerComponent
      },
      {
        path: '', // Cela affichera le contenu par défaut de HomeComponent
        redirectTo: 'banner', // Redirige vers 'banner' par défaut si aucun chemin n'est spécifié
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
