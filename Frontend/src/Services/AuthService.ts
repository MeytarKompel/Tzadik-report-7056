import CredentialsModel from "../Models/CredentialsModel";
import axios from "axios";
import config from "../Utils/Config";

class AuthService{
public async login(credentials: CredentialsModel): Promise<void> {
    const response = await axios.post<string>(config.authUrl + "login", credentials);
}
}