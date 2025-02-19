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

  async getAd() {
    const { data, error } = await this.supabase
      .from('Ad')
      .select('*');
    if (error) {
      console.error('Erreur lors de la récupération des données :', error);
    } else {
      console.log('Données récupérées :', data);
    }
    return data;
  }

  async getLatestAds(limit: number = 3) {
    const { data, error } = await this.supabase
      .from('Ad')        // Nom de la table
      .select('*')       // Sélectionne toutes les colonnes
      .order('publication_date', { ascending: false }) // Trie par date de publication, les plus récentes d'abord
      .limit(limit);     // Limite à 3 résultats

    if (error) {
      console.error('Erreur lors de la récupération des dernières annonces :', error.message);
      throw new Error(error.message);
    }

    console.log('Dernières annonces récupérées :', data);
    return data;
  }

  // Récupère l'utilisateur connecté
  async getUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur :', error.message);
      return null;
    }
    return user;
  }

  // Permet d'écouter les changements d'état d'authentification
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // Permet de se déconnecter
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('userprofile')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) {
      console.error('Erreur lors de la récupération du profil utilisateur :', error.message);
      return null;
    }
    return data;
  }

// Met à jour les informations du profil dans la table "userprofile"
  async updateUserProfile(userId: string, profileData: any) {
    const { data, error } = await this.supabase
      .from('userprofile')
      .update(profileData)
      .eq('user_id', userId);
    if (error) {
      console.error('Erreur lors de la mise à jour du profil utilisateur :', error.message);
      throw new Error(error.message);
    }
    return data;
  }

// Fonction qui upload une image (si fournie) puis met à jour le profil avec l'URL de l'image
  async updateProfileWithImage(userId: string, profileData: any, file?: File) {
    if (file) {
      // Définir un chemin unique pour le fichier dans le bucket
      const filePath = `profile/${userId}-${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await this.supabase
        .storage
        .from('ad-images')
        .upload(filePath, file, { upsert: true });
      if (uploadError) {
        console.error("Erreur lors de l'upload de l'image :", uploadError.message);
        throw new Error(uploadError.message);
      }
      // Récupérer l'URL publique de l'image uploadée
      const { data: publicUrlData } = this.supabase
        .storage
        .from('ad-images')
        .getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;
      if (!publicUrl) {
        throw new Error("Impossible de récupérer l'URL publique de l'image.");
      }
      // Ajouter l'URL de l'image aux données de profil
      profileData = { ...profileData, avatar_url: publicUrl };
    }
    // Mettre à jour le profil dans la table userprofile
    return await this.updateUserProfile(userId, profileData);
  }


// Met à jour le mot de passe de l'utilisateur via l'API Auth de Supabase
//   async updateUserPassword(newPassword: string) {
//     const { data, error } = await this.supabase.auth.updateUser({ password: newPassword });
//     if (error) {
//       throw new Error(error.message);
//     }
//     return data;
//   }
}
