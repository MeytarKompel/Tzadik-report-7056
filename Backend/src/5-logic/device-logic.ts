import ClientError from "../2-utils/client-error";
import DeviceModel, { IDevice } from "../4-models/device-model";

class DeviceLogic {
    public async getAllDevices(): Promise<IDevice[]> {
        return DeviceModel.find()
            .sort({ createdAt: -1 })
            .exec();
    }

    public async getDeviceByMongoId(id: string): Promise<IDevice | null> {
        return DeviceModel.findById(id).exec();
    }

    public async getDeviceByNumber(deviceNumber: string): Promise<IDevice | null> {
        return DeviceModel.findOne({ deviceNumber }).exec();
    }

    public async getDevicesByName(deviceName: string): Promise<IDevice[]> {
        return DeviceModel.find({ deviceName })
            .sort({ createdAt: -1 })
            .exec();
    }

    public async addDevice(device: Partial<IDevice>): Promise<IDevice> {
        const existingDevice = await DeviceModel.findOne({
            deviceNumber: device.deviceNumber
        }).exec();

        if (existingDevice) {
            throw new ClientError(400, "Device number already exists");
        }

        const newDevice = new DeviceModel(device);
        return newDevice.save();
    }

    public async updateDeviceByMongoId(
        id: string,
        device: Partial<IDevice>
    ): Promise<IDevice | null> {
        if (device.deviceNumber) {
            const existingDevice = await DeviceModel.findOne({
                deviceNumber: device.deviceNumber,
                _id: { $ne: id }
            }).exec();

            if (existingDevice) {
                throw new ClientError(400, "Device number already exists");
            }
        }

        return DeviceModel.findByIdAndUpdate(
            id,
            device,
            {
                new: true,
                runValidators: true
            }
        ).exec();
    }

    public async updateDeviceByNumber(
        deviceNumber: string,
        device: Partial<IDevice>
    ): Promise<IDevice | null> {
        const currentDevice = await DeviceModel.findOne({ deviceNumber }).exec();

        if (!currentDevice) {
            return null;
        }

        if (device.deviceNumber && device.deviceNumber !== deviceNumber) {
            const existingDevice = await DeviceModel.findOne({
                deviceNumber: device.deviceNumber,
                _id: { $ne: currentDevice._id }
            }).exec();

            if (existingDevice) {
                throw new ClientError(400, "Device number already exists");
            }
        }

        return DeviceModel.findOneAndUpdate(
            { deviceNumber },
            device,
            {
                new: true,
                runValidators: true
            }
        ).exec();
    }

    public async deleteDeviceByMongoId(id: string): Promise<IDevice | null> {
        return DeviceModel.findByIdAndDelete(id).exec();
    }

    public async deleteDeviceByNumber(deviceNumber: string): Promise<IDevice | null> {
        return DeviceModel.findOneAndDelete({ deviceNumber }).exec();
    }

    public async  importDevices(devices: Partial<IDevice>[]): Promise<IDevice[]> {
    const preparedDevices = devices.map(device => ({
        deviceNumber: String(device.deviceNumber ?? "").trim(),
        deviceName: String(device.deviceName ?? "").trim(),
        isActive: true
    }));

    return await DeviceModel.insertMany(preparedDevices, { ordered: false });
}
}

const deviceLogic = new DeviceLogic();

export default deviceLogic;