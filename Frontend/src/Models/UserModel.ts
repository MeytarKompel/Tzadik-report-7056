class UserModel{
    public personalNumber: string= "";
    public phoneNumber: string= "";
    public role: "regular" | "mashkash" | "admin" = "regular";
    public unit : string = "";

}

export default UserModel;