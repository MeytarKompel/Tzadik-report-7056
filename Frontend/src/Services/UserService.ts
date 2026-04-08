import axios from "axios";
import UserModel from "../Models/UserModel";

class UserService {
  public async getAllUsers(): Promise<UserModel[]> {
    const response = await axios.get<UserModel[]>("http://localhost:3001/api/users");
    return response.data;
  }

  public async addUser(user: UserModel): Promise<UserModel> {
    const response = await axios.post<UserModel>(
      "http://localhost:3001/api/users",
      user
    );
    return response.data;
  }
}

const userService = new UserService();
export default userService;