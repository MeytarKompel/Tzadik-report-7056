import UserModel from "./UserModel"

class AuthResponseModel {
    public token: string = ""
    public user: UserModel = new UserModel();
}

export default AuthResponseModel;