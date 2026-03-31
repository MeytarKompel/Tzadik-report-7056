import axios from "axios";
import CredentialsModel from "../Models/CredentialsModel";
import UserModel from "../Models/UserModel";

class AuthService {
    private identifyUrl = "http://localhost:3001/api/users/identify";
    private storageKey = "identifiedUser";

    public async identify(credentials: CredentialsModel): Promise<UserModel> {
        const response = await axios.post<UserModel>(this.identifyUrl, credentials);
        const user = response.data;

        this.saveUser(user);

        return user;
    }

    public saveUser(user: UserModel): void {
        localStorage.setItem(this.storageKey, JSON.stringify(user));
    }

    public getUser(): UserModel | null {
        const userJson = localStorage.getItem(this.storageKey);
        if (!userJson) return null;

        return JSON.parse(userJson) as UserModel;
    }

    public isLoggedIn(): boolean {
        return this.getUser() !== null;
    }

    public logout(): void {
        localStorage.removeItem(this.storageKey);
    }
}

const authService = new AuthService();

export default authService;