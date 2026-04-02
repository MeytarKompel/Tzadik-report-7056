import axios from "axios";
import DeviceModel from "../Models/DeviceModel";

class DeviceService {
    private baseUrl = "http://localhost:3001/api/devices";

    public async getAllDevices(): Promise<DeviceModel[]> {
        const response = await axios.get<DeviceModel[]>(this.baseUrl);
        return response.data;
    }

    public async addDevice(device: DeviceModel): Promise<DeviceModel> {
        const response = await axios.post<DeviceModel>(this.baseUrl, device);
        return response.data;
    }

    public async importDevices(devices: DeviceModel[]): Promise<void> {
        await axios.post(`${this.baseUrl}/import`, devices);
    }
}

const deviceService = new DeviceService();
export default deviceService;