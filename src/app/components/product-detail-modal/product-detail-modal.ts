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
  //recibe el producto desde el componente padre
  product = input.required<Product>();
  //aisa al padre que va a cerrar el modal
  close = output<void>();
  //mira si tiene happy hour el producto
  readonly esHappyHour = computed(() => !!this.product().isHappyHour);
  //determina si debe mostrar etiquetas especiales ( descuento o Happy Hour)
  readonly tieneDescuentoOHh = computed(
    () => this.esHappyHour() || this.#porcentaje(this.product().discount) > 0
  );
  //calcula el precio final restando el descuento (si tiene)
  readonly precioActual = computed(() => {
    const p = this.product();
    const porc = this.#porcentaje(p.discount);
    if (porc > 0) {
      //aplica porcenatje y redenodea 2 decimales
      const precio = p.price * (1 - porc / 100);
      return Math.max(0, Math.round(precio * 100) / 100);
    }
    return p.price;//devuelve el precio normal si no hay descuento
  });
  //ejecuta la salida del evento de cierre
  onClose() {
  this.close.emit();
  }
  //evita cierres accidentales
  preventClose(event: Event) {
    event.stopPropagation();
  }
  //funcion para validar que el decuento se encuentre entre 0 y 100
  #porcentaje(v: number | null | undefined): number {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return 0;//si no es un número valido devuelve 0
  return Math.max(0, Math.min(100, n));//limita el rango entre 0 y 100
  }
}



