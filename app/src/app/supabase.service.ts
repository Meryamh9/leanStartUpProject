import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  // Méthode pour se connecter via email et mot de passe
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  // Méthode pour inscrire un utilisateur avec email et mot de passe
  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) {
      console.error('Erreur lors de l\'inscription :', error.message);
      throw new Error(error.message);
    }
    return data;
  }

}
