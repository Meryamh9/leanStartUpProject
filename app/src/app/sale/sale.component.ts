import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.scss'
})
export class SaleComponent implements OnInit {
  saleForm!: FormGroup;
  submitting = false;
  currentStep = 1;

  categories: any[] = [];
  mainCategories: any[] = [];
  filteredSubcategories: any[] = [];

  constructor(private fb: FormBuilder, private supabaseService: SupabaseService) {}

  async ngOnInit() {
    this.saleForm = this.fb.group({
      title: ['', Validators.required],
      category: [null, Validators.required],
      subcategory: [null, Validators.required],
      condition: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required]
    });

    await this.loadCategories();
  }

  async loadCategories() {
    const { data, error } = await this.supabaseService.client
      .from('Category')
      .select('*');

    if (error) {
      console.error('Erreur lors du chargement des catégories:', error.message);
      return;
    }

    this.categories = data;
    this.mainCategories = data.filter(cat => cat.parent_id === null);
  }

  onCategoryChange() {
    const selectedCategoryId = Number(this.saleForm.get('category')?.value);
    this.filteredSubcategories = this.categories.filter(cat => Number(cat.parent_id) === selectedCategoryId);
    this.saleForm.get('subcategory')?.setValue(null);
  }

  nextStep() {
    if (this.currentStep === 1 && this.saleForm.get('title')?.valid &&
      this.saleForm.get('category')?.valid &&
      this.saleForm.get('subcategory')?.valid &&
      this.saleForm.get('condition')?.valid) {
      this.currentStep = 2;
    }
  }

  previousStep() {
    this.currentStep = 1;
  }

  async submitForm() {
    if (this.saleForm.invalid) return;
    this.submitting = true;

    const formData = this.saleForm.value;

    const { data, error } = await this.supabaseService.client
      .from('Ad')
      .insert({
        title: formData.title,
        category_id: formData.subcategory,
        price: formData.price,
        description: formData.description,
        status: 'Available',
        publication_date: new Date().toISOString()
      });

    this.submitting = false;

    if (error) {
      console.error('Erreur lors de l\'ajout de l\'annonce :', error.message);
    } else {
      console.log('Annonce ajoutée avec succès !', data);
      this.saleForm.reset();
      this.currentStep = 1;
    }
  }
}
