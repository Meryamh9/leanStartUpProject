import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../core/services/supabase.service';

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

  // Images
  images: File[] = [];
  imagePreviews: string[] = [];

  // Utilisateur connecté
  currentUserId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    // Init form
    this.saleForm = this.fb.group({
      title: ['', Validators.required],
      category: [null, Validators.required],
      subcategory: [null, Validators.required],
      condition: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required]
    });

    // Charger catégories
    await this.loadCategories();

    // Récupération utilisateur connecté
    const user = await this.supabaseService.getUser();
    if (user) this.currentUserId = user.id;
    else console.warn('Aucun utilisateur connecté : artisan_id sera null');

    // Slots de preview
    this.initPreviewArray();
  }

  async loadCategories() {
    const { data, error } = await this.supabaseService.client
      .from('Category')
      .select('*');
    if (error) {
      console.error('Erreur chargement catégories :', error.message);
      return;
    }
    this.categories = data ?? [];
    this.mainCategories = this.categories.filter(cat => cat.parent_id === null);
  }

  onCategoryChange() {
    const selectedCategoryId = Number(this.saleForm.get('category')?.value);
    this.filteredSubcategories = this.categories.filter(
      cat => cat.parent_id === selectedCategoryId
    );
    this.saleForm.patchValue({ subcategory: null });
  }

  // Navigation multi-étapes
  goToStep(stepNumber: number) {
    if (this.currentStep === 1 && stepNumber === 2 && !this.isStep1Valid()) return;
    if (this.currentStep === 2 && stepNumber === 3 && !this.isStep2Valid()) return;
    this.currentStep = stepNumber;
  }

  isStep1Valid(): boolean {
    return !!this.saleForm.get('title')?.valid &&
      !!this.saleForm.get('category')?.valid &&
      !!this.saleForm.get('subcategory')?.valid &&
      !!this.saleForm.get('condition')?.valid;
  }

  isStep2Valid(): boolean {
    return !!this.saleForm.get('price')?.valid &&
      !!this.saleForm.get('description')?.valid;
  }

  // Prévisualisation
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

    // Limiter à 10 images
    if (this.images.length + newFiles.length > 10) {
      alert('Vous ne pouvez sélectionner que 10 images maximum.');
      return;
    }

    this.images.push(...newFiles);
    this.updatePreviews();
    input.value = ''; // reset
  }

  updatePreviews() {
    this.initPreviewArray();
    this.images.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews[idx] = e.target.result as string;
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
        const uploadedUrl = await this.uploadImageToSupabase(file);
        if (uploadedUrl) imageUrls.push(uploadedUrl);
      }

      // 2) Insérer dans Ad
      const formData = this.saleForm.value;
      const now = new Date();

      // Générer un ID unique
      const adId = Date.now();

      const { data, error } = await this.supabaseService.client
        .from('Ad')
        .insert({
          ad_id: adId,
          title: formData.title,
          description: formData.description,
          publication_date: now.toISOString(),
          price: formData.price,
          quantity: 1,
          status: 'Available',
          location: null,
          material_id: null,
          artisan_id: this.currentUserId, // utilisateur connecté
          category_id: formData.subcategory,
          images: imageUrls
        })
        .select();

      if (error) {
        throw new Error(error.message);
      }
      console.log('Annonce ajoutée avec succès !', data);

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

  // Upload vers le bucket 'ad-images'
  async uploadImageToSupabase(file: File): Promise<string | null> {
    try {
      const filePath = `ad-images/${Date.now()}-${file.name}`;
      const { error } = await this.supabaseService.client
        .storage
        .from('ad-images')  // Ton bucket déjà configuré
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error('Erreur upload image:', error.message);
        return null;
      }

      // Récupération de l'URL publique
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
