export interface User {
    id: number,
    password: string,
    firstName: string,
    lastName: string,
    restaurantName: string,
    address: string,
    phoneNumber: string,
}

export type NewUser = Omit<User,"id">