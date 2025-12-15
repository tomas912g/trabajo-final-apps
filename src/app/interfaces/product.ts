export interface Product {
    id: number,
    name: string,
    description: string, 
    price: number,
    categoryId: number,
    imageUrl?: string,
    isFeatured: boolean, //para los destacados
    isDiscount: number, //para los descuentos. Ninguno de estos dos son opcionales ya que es necesario saber su estado por defecto
    discountValidUntil?: string | Date; // opcional, para vigencia
    isHappyHour: boolean,
    isFavorite?: boolean;
}