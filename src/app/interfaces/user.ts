export interface User {
    id: number,
    email: string,
    password: string,
    restaurant: string,
    address: string,
}

export type NewUser = Omit<User,"id">