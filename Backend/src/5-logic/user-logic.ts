import ClientError from "../2-utils/client-error";
import UserModel, { IUser } from "../4-models/user-model";

async function getAllUsers(): Promise<IUser[]> {
    return UserModel.find().sort({ createdAt: -1 }).exec();
}

async function getUserByPersonalNumber(personalNumber: string): Promise<IUser | null> {
    return UserModel.findOne({ personalNumber }).exec();
}

async function getUsersByUnit(unit: string): Promise<IUser[]> {
    return UserModel.find({ unit }).sort({ createdAt: -1 }).exec();
}

async function getUsersByRole(role: string): Promise<IUser[]> {
    return UserModel.find({ role }).sort({ createdAt: -1 }).exec();
}

async function identifyUserForReport(personalNumber: string, phone: string): Promise<IUser | null> {
    const normalizedPhone = phone.replace(/\D/g, "");
    
    return UserModel.findOne({
        personalNumber,
        phone: normalizedPhone,
    }).exec();
}

async function addUser(user: IUser): Promise<IUser> {
    user.phone = user.phone.replace(/\D/g, "");

    const existingPersonalNumber = await UserModel.findOne({
        personalNumber: user.personalNumber
    }).exec();

    if (existingPersonalNumber) {
        throw new ClientError(400,"Personal number already exists");
    }

    const existingUserIdentification = await UserModel.findOne({
        personalNumber: user.personalNumber,
        phone: user.phone
    }).exec();

    if (existingUserIdentification) {
        throw new ClientError(400,"User identification already exists");
    }

    return UserModel.create(user);
}

async function updateUser(personalNumber: string, user: Partial<IUser>): Promise<IUser | null> {
    if (user.phone) {
        user.phone = user.phone.replace(/\D/g, "");
    }

    const currentUser = await UserModel.findOne({ personalNumber }).exec();

    if (!currentUser) {
        return null;
    }

    if (user.personalNumber && user.personalNumber !== personalNumber) {
        const existingPersonalNumber = await UserModel.findOne({
            personalNumber: user.personalNumber,
            _id: { $ne: currentUser._id }
        }).exec();

        if (existingPersonalNumber) {
            throw new ClientError(400,"Personal number already exists");
        }
    }

    const updatedPersonalNumber = user.personalNumber ?? currentUser.personalNumber;
    const updatedPhone = user.phone ?? currentUser.phone;

    const existingUserIdentification = await UserModel.findOne({
        personalNumber: updatedPersonalNumber,
        phone: updatedPhone,
        _id: { $ne: currentUser._id }
    }).exec();

    if (existingUserIdentification) {
        throw new ClientError(400,"User identification already exists");
    }

    return UserModel.findOneAndUpdate(
        { personalNumber },
        user,
        { new: true, runValidators: true }
    ).exec();
}

async function deleteUser(personalNumber: string): Promise<IUser | null> {
    return UserModel.findOneAndDelete({ personalNumber }).exec();
}

export default {
    getAllUsers,
    getUserByPersonalNumber,
    getUsersByUnit,
    getUsersByRole,
    identifyUserForReport,
    addUser,
    updateUser,
    deleteUser
};