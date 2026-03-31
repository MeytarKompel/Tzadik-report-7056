import axios from "axios";
import CredentialsModel from "../Models/CredentialsModel";
import UserModel from "../Models/UserModel";

interface AuthSession {
  user: UserModel;
  loginDate: string;
}

class AuthService {
  private identifyUrl = "http://localhost:3001/api/users/identify";
  private dailyStorageKey = "dailyAuthSession";

  public async identify(credentials: CredentialsModel): Promise<UserModel> {
    const response = await axios.post<UserModel>(this.identifyUrl, credentials);
    const user = response.data;

    if (user.role === "mashkash" || user.role === "admin") {
      this.saveDailySession(user);
    }

    return user;
  }

  private getTodayDateString(): string {
    return new Date().toISOString().split("T")[0];
  }

  private saveDailySession(user: UserModel): void {
    const session: AuthSession = {
      user,
      loginDate: this.getTodayDateString(),
    };

    localStorage.setItem(this.dailyStorageKey, JSON.stringify(session));
  }

  public getUser(): UserModel | null {
    const dailySessionJson = localStorage.getItem(this.dailyStorageKey);
    console.log("getUser dailySessionJson:", dailySessionJson);

    if (!dailySessionJson) return null;

    const session = JSON.parse(dailySessionJson) as AuthSession;
    console.log("getUser parsed session:", session);

    if (session.loginDate !== this.getTodayDateString()) {
      return null;
    }

    return session.user;
  }

  public shouldSkipLogin(): boolean {
    const user = this.getUser();
    console.log("shouldSkipLogin user:", user);

    if (!user) return false;

    return user.role === "admin" || user.role === "mashkash";
  }

  public hasAccessSession(): boolean {
    const result = this.shouldSkipLogin();
    console.log("hasAccessSession:", result);
    return result;
  }

  public logout(): void {
    localStorage.removeItem(this.dailyStorageKey);
  }
}

const authService = new AuthService();

export default authService;
