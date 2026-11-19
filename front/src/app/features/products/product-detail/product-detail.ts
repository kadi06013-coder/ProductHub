import { Component, signal, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  product = signal<Product | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  toast = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct(id);
  }

  loadProduct(id: number) {
    this.loading.set(true);
    this.productService.getById(id).subscribe({
      next: (res) => {
        this.product.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Produit introuvable.');
        this.loading.set(false);
      }
    });
  }

  edit() {
    const p = this.product();
    if (p) this.router.navigate(['/products', p.id, 'edit']);
  }

  delete() {
    const p = this.product();
    if (!p) return;
    this.confirmDialog.open({
      title: 'Supprimer le produit',
      message: `Voulez-vous vraiment supprimer "${p.name}" ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      onConfirm: () => {
        this.productService.delete(p.id).subscribe({
          next: () => {
            this.showToast('Produit supprimé avec succès', 'success');
            setTimeout(() => this.router.navigate(['/products']), 1000);
          },
          error: () => this.showToast('Erreur lors de la suppression', 'error')
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 3500);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date));
  }

  getImageUrl(product: Product): string {
    return product.image_url || 'https://placehold.co/600x500/6366f1/ffffff?text=' + encodeURIComponent(product.name);
  }
}
