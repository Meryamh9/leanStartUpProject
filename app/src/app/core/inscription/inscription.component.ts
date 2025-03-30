import { Component } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroupDirective, FormsModule, NgForm } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import { ErrorStateMatcher } from '@angular/material/core';
import {MatButtonModule} from '@angular/material/button';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule],
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.scss'],
})
export class InscriptionComponent {
  email: string = '';
  password: string = '';
  matcher = new MyErrorStateMatcher();

  constructor(private supabaseService: SupabaseService) {}

  async signUp() {
    try {
      const response = await this.supabaseService.signUp(this.email, this.password);
      console.log('Inscription réussie :', response);
      alert('Inscription réussie. Vérifiez votre email pour la confirmation.');
    } catch (error) {
      console.error('Erreur lors de l\'inscription :');
      alert('Erreur lors de l\'inscription : ');
    }
  }
}
