
import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { extractApiError } from '../../../core/utils/api-error';
import { createToast } from '../../../core/utils/toast';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [FormsModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css'
})
export class CategoryList implements OnInit {

  private readonly categoryService = inject(CategoryService);

  private readonly confirmDialog = viewChild.required(ConfirmDialogComponent);

  categories = signal<Category[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  categoryName = signal('');
  editingId = signal<number | null>(null);

  // Recherche en temps réel
  searchTerm = signal('');

  filteredCategories = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();

    return this.categories().filter(category =>
      category.name.toLowerCase().includes(search)
    );
  });

  categoryCount = computed(() => this.categories().length);

  private readonly toaster = createToast();
  toast = this.toaster.toast;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.categories.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les catégories.');
        this.loading.set(false);
      }
    });
  }

  saveCategory(): void {
    const name = this.categoryName().trim();

    if (!name) {
      this.showToast('Le nom est obligatoire.', 'error');
      return;
    }

    const id = this.editingId();
    const data = { name };

    const request = id !== null
      ? this.categoryService.update(id, data)
      : this.categoryService.create(data);

    request.subscribe({
      next: () => {
        this.showToast(
          id !== null
            ? 'Catégorie modifiée avec succès.'
            : 'Catégorie créée avec succès.',
          'success'
        );

        this.resetForm();
        this.loadCategories();
      },
      error: (err) => {
        if (err.status === 409) {
          this.showToast('Cette catégorie existe déjà.', 'error');
        } else {
          this.showToast(extractApiError(err, 'Erreur lors de l’enregistrement.'), 'error');
        }
      }
    });
  }

  editCategory(category: Category): void {
    this.editingId.set(category.id);
    this.categoryName.set(category.name);
  }

  deleteCategory(category: Category): void {
    this.confirmDialog().open({
      title: 'Supprimer la catégorie',
      message: `Voulez-vous vraiment supprimer "${category.name}" ?`,
      confirmLabel: 'Supprimer',
      onConfirm: () => {
        this.categoryService.delete(category.id).subscribe({
          next: () => {
            this.showToast('Catégorie supprimée avec succès.', 'success');
            this.loadCategories();
          },
          error: (err) => {
            this.showToast(
              err.status === 409
                ? 'Impossible de supprimer : cette catégorie contient encore des produits.'
                : extractApiError(err, 'Erreur lors de la suppression.'),
              'error'
            );
          }
        });
      }
    });
  }

  resetForm(): void {
    this.categoryName.set('');
    this.editingId.set(null);
  }

  showToast = this.toaster.show;
}
