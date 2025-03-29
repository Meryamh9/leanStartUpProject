import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isLoggedIn = !!localStorage.getItem('user'); // Vérifie si un utilisateur est connecté

    if (isLoggedIn) {
      return true;
    } else {
      // Rediriger vers la page de connexion avec un message
      this.router.navigate(['/connexion'], { queryParams: { message: 'Vous devez être connecté pour mettre en vente un produit.' } });
      return false;
    }
  }
}
