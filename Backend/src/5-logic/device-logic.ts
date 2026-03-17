import DeviceModel, { IDevice } from "../4-models/device-model";

class DeviceLogic {
  public async getAllDevices(): Promise<IDevice[]> {
    return DeviceModel.find().sort({ createdAt: -1 }).exec();
  }

  public async getDeviceByMongoId(id: string): Promise<IDevice | null> {
    return DeviceModel.findById(id).exec();
  }

  public async getDeviceByNumber(
    deviceNumber: string,
  ): Promise<IDevice | null> {
    return DeviceModel.findOne({ deviceNumber }).exec();
  }

  public async getDeviceByName(deviceName: string): Promise<IDevice | null> {
    return DeviceModel.findOne({ deviceName }).exec();
  }

  public async addDevice(device: Partial<IDevice>): Promise<IDevice> {
    const existingDevice = await DeviceModel.findOne({
      deviceNumber: device.deviceNumber,
    }).exec();

    if (existingDevice) {
      throw new Error("Device number already exists");
    }

    const newDevice = new DeviceModel(device);
    return newDevice.save();
  }

  public async updateDeviceByMongoId(
    id: string,
    device: Partial<IDevice>,
  ): Promise<IDevice | null> {
    if (device.deviceNumber) {
      const existingDevice = await DeviceModel.findOne({
        deviceNumber: device.deviceNumber,
        _id: { $ne: id },
      }).exec();

      if (existingDevice) {
        throw new Error("Device number already exists");
      }
    }

    return DeviceModel.findByIdAndUpdate(id, device, {
      new: true,
      runValidators: true,
    }).exec();
  }

  public async deleteDeviceByMongoId(id: string): Promise<IDevice | null> {
    return DeviceModel.findByIdAndDelete(id).exec();
  }
}

const deviceLogic = new DeviceLogic();

export default deviceLogic;
