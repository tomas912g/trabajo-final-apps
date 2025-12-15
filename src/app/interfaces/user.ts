export interface User {
    id: number,
    password: string,
    firstName: string,
    lastName: string,
    email: string,
    restaurantName: string,
    address: string,
    phoneNumber: string,
}

export type NewUser = Omit<User,"id">