class UserModel{
    public personalNumber: string= "";
    public phone: string= "";
    public fullName: string = "";
    public role: "regular" | "mashkash" | "admin" = "regular";
    public unit : string = "";

}

export default UserModel;