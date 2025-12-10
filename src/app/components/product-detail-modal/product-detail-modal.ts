import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interfaces/product';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail-modal.html',
  styleUrl: './product-detail-modal.scss',
})

export class ProductDetailModal {
  product = input.required<Product>();
  close = output<void>();
  
  readonly esHappyHour = computed(() => !!this.product().isHappyHour);
  
  readonly tieneDescuentoOHh = computed(
    () => this.esHappyHour() || this.#porcentaje(this.product().isDiscount) > 0
  );
  
  readonly precioActual = computed(() => {
    const p = this.product();
    const porc = this.#porcentaje(p.isDiscount);
    if (porc > 0) {
      const precio = p.price * (1 - porc / 100);
      return Math.max(0, Math.round(precio * 100) / 100);
    }
    return p.price;
  });

  onClose() {
  this.close.emit();
  }

  preventClose(event: Event) {
    event.stopPropagation();
  }

  #porcentaje(v: number | null | undefined): number {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
  }
}



