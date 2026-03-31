import axios from "axios";
import CredentialsModel from "../Models/CredentialsModel";
import UserModel from "../Models/UserModel";

class AuthService {
    private identifyUrl = "http://localhost:3001/api/users/identify";

    public async identify(credentials: CredentialsModel): Promise<UserModel> {
        const response = await axios.post<UserModel>(this.identifyUrl, credentials);
        return response.data;
    }
}

const authService = new AuthService();

export default authService;