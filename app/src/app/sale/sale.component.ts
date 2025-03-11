import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './sale.component.html',
  styleUrls: ['./sale.component.scss']
})
export class SaleComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Formulaire
  saleForm!: FormGroup;
  submitting = false;
  currentStep = 1;

  // Catégories
  categories: any[] = [];
  mainCategories: any[] = [];
  filteredSubcategories: any[] = [];

  // Gestion des images
  images: File[] = [];            // Fichiers bruts
  imagePreviews: string[] = [];   // URLs base64 (taille 10)

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    this.saleForm = this.fb.group({
      title: ['', Validators.required],
      category: [null, Validators.required],
      subcategory: [null, Validators.required],
      condition: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required]
    });

    // Charger les catégories depuis Supabase
    await this.loadCategories();

    // 10 emplacements possibles
    this.initPreviewArray();
  }

  async loadCategories() {
    const { data, error } = await this.supabaseService.client
      .from('Category')
      .select('*');
    if (error) {
      console.error('Erreur chargement catégories:', error.message);
      return;
    }

    this.categories = data || [];
    this.mainCategories = this.categories.filter(cat => cat.parent_id === null);
  }

  // Changement de catégorie => recalcul des sous-catégories
  onCategoryChange() {
    const selectedCategoryId = Number(this.saleForm.get('category')?.value);
    this.filteredSubcategories = this.categories.filter(cat => Number(cat.parent_id) === selectedCategoryId);
    this.saleForm.get('subcategory')?.setValue(null);
  }

  // Contrôler la navigation entre les étapes
  goToStep(stepNumber: number) {
    if (this.currentStep === 1 && stepNumber === 2 && !this.isStep1Valid()) {
      return;
    }
    if (this.currentStep === 2 && stepNumber === 3 && !this.isStep2Valid()) {
      return;
    }
    this.currentStep = stepNumber;
  }

  isStep1Valid(): boolean {
    return !!this.saleForm.get('title')?.valid
      && !!this.saleForm.get('category')?.valid
      && !!this.saleForm.get('subcategory')?.valid
      && !!this.saleForm.get('condition')?.valid;
  }

  isStep2Valid(): boolean {
    return !!this.saleForm.get('price')?.valid
      && !!this.saleForm.get('description')?.valid;
  }

  // Prépare un tableau de 10 places vides
  initPreviewArray() {
    this.imagePreviews = Array(10).fill(null);
  }

  // Ouvrir l'explorateur de fichiers
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  // Quand on sélectionne un ou plusieurs fichiers
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files);

    // On vérifie le total
    if (this.images.length + newFiles.length > 10) {
      alert('Vous ne pouvez sélectionner que 10 images maximum.');
      return;
    }

    // On ajoute les nouveaux fichiers
    this.images.push(...newFiles);

    // On met à jour les previews
    this.updatePreviews();

    // On réinitialise l'input
    input.value = '';
  }

  updatePreviews() {
    // Tout remettre à null
    this.initPreviewArray();

    // Relecture des fichiers existants
    this.images.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews[idx] = e.target.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  // Supprimer une image
  removeImage(index: number, event: MouseEvent) {
    // Empêche l'éventuel clic sur l'image ou la case
    event.stopPropagation();

    // Retirer le fichier correspondant
    this.images.splice(index, 1);

    // Mettre à jour les previews
    this.updatePreviews();
  }

  // Soumission finale
  async submitForm() {
    if (this.saleForm.invalid) return;
    this.submitting = true;

    try {
      // 1) Upload des fichiers dans Supabase
      const imageUrls: string[] = [];
      for (const file of this.images) {
        const uploadedUrl = await this.uploadImageToSupabase(file);
        if (uploadedUrl) {
          imageUrls.push(uploadedUrl);
        }
      }

      // 2) Insertion dans la table Ad
      const formData = this.saleForm.value;
      const { data, error } = await this.supabaseService.client
        .from('Ad')
        .insert({
          title: formData.title,
          category_id: formData.subcategory,
          price: formData.price,
          description: formData.description,
          status: 'Available',
          publication_date: new Date().toISOString(),
          images: imageUrls // Stocké dans un champ text[] ou jsonb
        })
        .select();

      if (error) throw new Error(error.message);

      console.log('Annonce ajoutée avec succès !', data);

      // 3) Nettoyage
      this.saleForm.reset();
      this.images = [];
      this.initPreviewArray();
      this.currentStep = 1;

    } catch (err: any) {
      console.error('Erreur :', err.message);
    }

    this.submitting = false;
  }

  async uploadImageToSupabase(file: File): Promise<string | null> {
    try {
      const filePath = `ad-images/${Date.now()}-${file.name}`;
      const { data, error } = await this.supabaseService.client
        .storage
        .from('ad-images')
        .upload(filePath, file, { upsert: true });
      if (error) {
        console.error('Erreur upload Supabase:', error.message);
        return null;
      }
      const { data: publicUrlData } = this.supabaseService.client
        .storage
        .from('ad-images')
        .getPublicUrl(filePath);
      return publicUrlData?.publicUrl || null;
    } catch (err: any) {
      console.error('Erreur upload:', err.message);
      return null;
    }
  }
}
