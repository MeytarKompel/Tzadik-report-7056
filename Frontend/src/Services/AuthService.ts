import axios from "axios";
import AuthResponseModel from "../Models/AuthResponseModel";
import CredentialsModel from "../Models/CredentialsModel";


class AuthService {
    public async login(credentials: CredentialsModel): Promise<AuthResponseModel> {
        const response = await axios.post<AuthResponseModel>(
            "http://localhost:3001/api/auth/login",
            credentials
        );

        return response.data;
    }
}

const authService = new AuthService();

export default authService;