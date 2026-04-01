class DeviceModel {
    public _id?: string;
    public deviceNumber: string = "";
    public deviceName: string = "";
    public isActive: boolean = true;
    public createdAt?: string;
    public updatedAt?: string;
}

export default DeviceModel;