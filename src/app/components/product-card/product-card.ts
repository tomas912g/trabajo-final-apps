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
  product = input.required<Product>();//requiere si o si un objeto tipo Product para mostrarse
// Evento de salida que envía el producto seleccionado al componente padre para abrir el modal de detalles
  viewDetail = output<Product>();
  //mira si el producto debe mostrarse como "Favorito"
  readonly esDestacado = computed(() => !!this.product().isFeatured);//Signal computada
  //mira si el producto se encuentra en Happy Hour
  readonly esHappyHour = computed(() => !!this.product().isHappyHour);//Signal computada
  //determina si la tarjeta debe mostrar etiquetas de oferta
  readonly tieneDescuentoOHh = computed(
    () => this.esHappyHour() || this.#porcentaje(this.product().discount) > 0
  );
  //hace el caluclo del precio final
  readonly precioActual = computed(() => {
    const p = this.product();
    const porc = this.#porcentaje(p.discount);
    if (porc > 0) {
      //calcula el descuento y redondea a dos decimales
      const precio = p.price * (1 - porc / 100);
      return Math.max(0, Math.round(precio * 100) / 100);
    }
    return p.price;//si no hay descuento retorna el precio original
  });
//se activa al hacer clic en la tarjeta del producto. Emite los datos hacia el componente menu
 verDetalle() {
    this.viewDetail.emit(this.product());
  }

  //funcion para validar que el decuento se encuentre entre 0 y 100
  #porcentaje(v: number | null | undefined): number {
    const n = Number(v ?? 0);
    if (!Number.isFinite(n)) return 0;//si no es un número valido devuelve 0
    return Math.max(0, Math.min(100, n));//limita el rango entre 0 y 100
  }
}




