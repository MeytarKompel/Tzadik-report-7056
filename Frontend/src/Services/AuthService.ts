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
    private regularStorageKey = "regularAuthSession";

    public async identify(credentials: CredentialsModel): Promise<UserModel> {
        const response = await axios.post<UserModel>(this.identifyUrl, credentials);
        const user = response.data;

        if (user.role === "regular") {
            this.saveRegularSession(user);
        } else {
            this.saveDailySession(user);
        }

        return user;
    }

    private getTodayDateString(): string {
        return new Date().toISOString().split("T")[0];
    }

    private saveRegularSession(user: UserModel): void {
        sessionStorage.setItem(this.regularStorageKey, JSON.stringify(user));
    }

    private saveDailySession(user: UserModel): void {
        const session: AuthSession = {
            user,
            loginDate: this.getTodayDateString()
        };

        localStorage.setItem(this.dailyStorageKey, JSON.stringify(session));
    }

    public getUser(): UserModel | null {
        const regularUserJson = sessionStorage.getItem(this.regularStorageKey);
        if (regularUserJson) {
            return JSON.parse(regularUserJson) as UserModel;
        }

        const dailySessionJson = localStorage.getItem(this.dailyStorageKey);
        if (dailySessionJson) {
            const session = JSON.parse(dailySessionJson) as AuthSession;
            return session.user;
        }

        return null;
    }

    public shouldSkipLogin(): boolean {
        const dailySessionJson = localStorage.getItem(this.dailyStorageKey);
        if (!dailySessionJson) return false;

        const session = JSON.parse(dailySessionJson) as AuthSession;

        if (session.user.role !== "admin" && session.user.role !== "mashkash") {
            return false;
        }

        return session.loginDate === this.getTodayDateString();
    }

    public hasAccessSession(): boolean {
        const regularUserJson = sessionStorage.getItem(this.regularStorageKey);
        if (regularUserJson) {
            return true;
        }

        return this.shouldSkipLogin();
    }

    public logout(): void {
        sessionStorage.removeItem(this.regularStorageKey);
        localStorage.removeItem(this.dailyStorageKey);
    }
}

const authService = new AuthService();

export default authService;