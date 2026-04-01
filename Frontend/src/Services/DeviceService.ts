import axios from "axios";
import DeviceModel from "../Models/DeviceModel";

class DeviceService {
    private baseUrl = "http://localhost:3001/api/devices";

    public async addDevice(device: DeviceModel): Promise<DeviceModel> {
        const response = await axios.post<DeviceModel>(this.baseUrl, device);
        return response.data;
    }

    public async getAllDevices(): Promise<DeviceModel[]> {
        const response = await axios.get<DeviceModel[]>(this.baseUrl);
        return response.data;
    }
}

const deviceService = new DeviceService();
export default deviceService;