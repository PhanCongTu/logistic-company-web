
const USER_KEY = 'user';

export interface User {
      userId: string;
      username: string;
      emailAddress: string;
      isEmailAddressVerified: boolean;
      accessToken: string;
      refreshToken: string;
      roles: string[];
      expired_in: string;
}

// Hàm lưu trữ thông tin user vào LocalStorage
export function saveUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Hàm lấy thông tin user từ LocalStorage
export function getUser(): User {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

// Hàm xóa thông tin user khỏi LocalStorage
export function removeUser(): void {
  localStorage.removeItem(USER_KEY);
}
