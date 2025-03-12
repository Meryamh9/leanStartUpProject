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

  saleForm!: FormGroup;
  submitting = false;
  currentStep = 1;

  categories: any[] = [];
  mainCategories: any[] = [];
  filteredSubcategories: any[] = [];

  // Gestion des images
  images: File[] = [];
  imagePreviews: string[] = [];

  // Utilisateur connecté (artisan)
  currentUserId: string | null = null;

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

    // Récupérer toutes les catégories
    await this.loadCategories();

    // Récupérer l'utilisateur connecté
    const user = await this.supabaseService.getUser();
    if (user) {
      this.currentUserId = user.id;
    } else {
      console.warn('Aucun utilisateur connecté. Artisan_id sera null.');
    }

    // Préparer 10 slots d'images (max)
    this.initPreviewArray();
  }

  async loadCategories() {
    const { data, error } = await this.supabaseService.client
      .from('Category')
      .select('*');
    if (error) {
      console.error('Erreur de chargement des catégories:', error.message);
      return;
    }

    this.categories = data ?? [];
    this.mainCategories = this.categories.filter((cat) => cat.parent_id === null);
  }

  onCategoryChange() {
    const selectedCategoryId = Number(this.saleForm.get('category')?.value);
    this.filteredSubcategories = this.categories.filter(
      (cat) => cat.parent_id === selectedCategoryId
    );
    this.saleForm.patchValue({ subcategory: null });
  }

  // Navigation étapes
  goToStep(stepNumber: number) {
    // Étape 1 -> Étape 2
    if (this.currentStep === 1 && stepNumber === 2 && !this.isStep1Valid()) return;

    // Étape 2 -> Étape 3
    if (this.currentStep === 2 && stepNumber === 3 && !this.isStep2Valid()) return;

    this.currentStep = stepNumber;
  }

  isStep1Valid(): boolean {
    return this.saleForm.get('title')!.valid &&
      this.saleForm.get('category')!.valid &&
      this.saleForm.get('subcategory')!.valid &&
      this.saleForm.get('condition')!.valid;
  }

  isStep2Valid(): boolean {
    return this.saleForm.get('price')!.valid &&
      this.saleForm.get('description')!.valid;
  }

  // Pour gérer 10 slots images
  initPreviewArray() {
    this.imagePreviews = Array(10).fill(null);
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files);

    // Vérification 10 max
    if (this.images.length + newFiles.length > 10) {
      alert('Max 10 images autorisées.');
      return;
    }

    this.images.push(...newFiles);
    this.updatePreviews();

    // reset input
    input.value = '';
  }

  updatePreviews() {
    this.initPreviewArray();
    this.images.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews[index] = e.target.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.images.splice(index, 1);
    this.updatePreviews();
  }

  // Soumission finale
  async submitForm() {
    if (this.saleForm.invalid) {
      console.error('Formulaire invalide');
      return;
    }

    this.submitting = true;

    try {
      // 1) Upload images
      const imageUrls: string[] = [];
      for (const file of this.images) {
        const url = await this.uploadImageToSupabase(file);
        if (url) imageUrls.push(url);
      }

      // 2) Insertion dans Ad
      const formData = this.saleForm.value;
      const now = new Date();

      // ad_id doit être unique => on utilise Date.now()
      const adId = Date.now();

      const { data, error } = await this.supabaseService.client
        .from('Ad')
        .insert({
          ad_id: adId,
          title: formData.title,
          description: formData.description,
          publication_date: now.toISOString(),
          price: formData.price,
          quantity: 1,              // par défaut 1
          status: 'Available',
          location: null,          // ou un champ si besoin
          material_id: null,       // si besoin
          artisan_id: this.currentUserId, // utilisateur connecté
          category_id: formData.subcategory,
          images: imageUrls        // Array de strings, stocké en JSONB
        })
        .select();

      if (error) {
        throw new Error(error.message);
      }

      console.log('Annonce ajoutée avec succès :', data);

      // 3) Reset
      this.saleForm.reset();
      this.images = [];
      this.initPreviewArray();
      this.currentStep = 1;

    } catch (err: any) {
      console.error('Erreur lors de la création de l\'annonce :', err.message);
    }

    this.submitting = false;
  }

  async uploadImageToSupabase(file: File): Promise<string | null> {
    try {
      const filePath = `ad-images/${Date.now()}-${file.name}`;
      const { error } = await this.supabaseService.client
        .storage
        .from('ad-images')
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error('Erreur upload image:', error.message);
        return null;
      }

      const { data } = this.supabaseService.client
        .storage
        .from('ad-images')
        .getPublicUrl(filePath);

      return data?.publicUrl || null;
    } catch (err: any) {
      console.error('Exception upload:', err.message);
      return null;
    }
  }
}
