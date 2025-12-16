export interface Restaurant {
    id: number,
    restaurantName: string,
    address: string,
    phoneNumber: string,
    image?: string,
    category?: string,
    isFavorite?: boolean,
}
//para que sepa la forma de los datos en caso de que la API llame con otro nombre
