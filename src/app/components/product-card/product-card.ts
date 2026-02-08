import { CurrencyPipe, CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Product } from '../../interfaces/product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  product = input.required<Product>();

  viewDetail = output<Product>();
  readonly esDestacado = computed(() => !!this.product().isFeatured);
  readonly esHappyHour = computed(() => !!this.product().isHappyHour);

  readonly tieneDescuentoOHh = computed(
    () => this.esHappyHour() || this.#porcentaje(this.product().discount) > 0
  );

  readonly precioActual = computed(() => {
    const p = this.product();
    const porc = this.#porcentaje(p.discount);
    if (porc > 0) {
      const precio = p.price * (1 - porc / 100);
      return Math.max(0, Math.round(precio * 100) / 100);
    }
    return p.price;
  });

 verDetalle() {
    this.viewDetail.emit(this.product());
  }

  // ---- helpers privados ----
  #porcentaje(v: number | null | undefined): number {
    const n = Number(v ?? 0);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }
}




