import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  profile: any = {};
  email: string = '';
  name: string = '';
  address: string = '';
  phone: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  selectedFile: File | null = null;

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async ngOnInit() {
    this.loading = true;
    try {
      // Récupérer l'utilisateur connecté
      this.user = await this.supabaseService.getUser();
      if (this.user) {
        this.email = this.user.email;
        // Récupérer les informations supplémentaires du profil
        const profileData = await this.supabaseService.getUserProfile(this.user.id);
        if (profileData) {
          this.profile = profileData;
          this.name = profileData.name || '';
          this.address = profileData.address || '';
          this.phone = profileData.phone || '';
        }
      } else {
        // Si aucun utilisateur, rediriger vers la connexion
        this.router.navigate(['/connexion']);
      }
    } catch (error: any) {
      this.errorMessage = error.message;
    }
    this.loading = false;
  }

  // Ne fait plus l'upload immédiatement, on stocke juste le fichier
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async updateProfile() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const updateData = {
        name: this.name,
        address: this.address,
        phone: this.phone
      };
      // Si un fichier a été sélectionné, on upload l'image lors de la mise à jour du profil
      if (this.selectedFile) {
        await this.supabaseService.updateProfileWithImage(this.user.id, updateData, this.selectedFile);
        // Une fois uploadé, on réinitialise la variable
        this.selectedFile = null;
      } else {
        // Sinon, on met à jour uniquement les données du profil
        await this.supabaseService.updateUserProfile(this.user.id, updateData);
      }
      this.successMessage = 'Profil mis à jour avec succès.';
    } catch (error: any) {
      this.errorMessage = error.message;
    }
    this.loading = false;
  }
}
