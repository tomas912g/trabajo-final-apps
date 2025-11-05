import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Product } from '../../interfaces/product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  // Producto a mostrar
  producto = input.required<Product>();

  // Opcional: para cerrar si lo usás dentro de un modal
  close = output<void>();

  // Flags derivados
  readonly esDestacado = computed(() => !!this.producto().isFeatured);
  readonly esHappyHour = computed(() => !!this.producto().isHappyHour);
  readonly tieneDescuentoOHh = computed(
    () => this.esHappyHour() || this.#porcentaje(this.producto().isDiscount) > 0
  );

  // Precio actual aplicando solo el porcentaje isDiscount (0..100)
  readonly precioActual = computed(() => {
    const p = this.producto();
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

  // ---- helpers privados ----
  #porcentaje(v: number | null | undefined): number {
    const n = Number(v ?? 0);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }
}




