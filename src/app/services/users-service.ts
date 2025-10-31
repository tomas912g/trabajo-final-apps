import { Injectable } from '@angular/core';
import { NewUser } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  
  async register(registerData: NewUser) {
    const res = await fetch("https://agenda-api.somee.com/api/Users",
    { 
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(registerData)
    });
  const data = await res.json();
  return { ok: res.ok, ...data };
  }
}
