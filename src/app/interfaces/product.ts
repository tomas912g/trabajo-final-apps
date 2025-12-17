    export interface Product {
        id: number,
        name: string,
        description: string, 
        price: number,
        categoryId: number,
        categoryName?: string,
        imageUrl?: string,
        isFeatured: boolean, 
        isDiscount: number, 
        discountValidUntil?: string | Date; 
        isHappyHour: boolean,
        isFavorite?: boolean;
    }