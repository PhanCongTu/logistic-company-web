import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private USER_KEY = 'user';

  private userInfoSubject = new BehaviorSubject<any>(this.getUser());
  userInfo$ = this.userInfoSubject.asObservable();


    // Hàm lưu trữ thông tin user vào LocalStorage
    saveUser(userInfo: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
    this.userInfoSubject.next(userInfo);
  }

  // Hàm lấy thông tin user từ LocalStorage
    getUser(): User {
    const userInfo = localStorage.getItem(this.USER_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Hàm xóa thông tin user khỏi LocalStorage
    removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
    this.userInfoSubject.next(null);
  }

  // Get the access token
  getToken(): String | undefined {
    return this.getUser().accessToken;
  }

  // Update the access token
  updateAccessToken(accessToken: string): void {
    const user: User = this.getUser();
    const newUser: User = {...user, accessToken: accessToken};
    this.saveUser(newUser);
  }
}