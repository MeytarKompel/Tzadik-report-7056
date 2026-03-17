import { Request, Response, NextFunction } from "express";
import deviceLogic from "../5-logic/device-logic";
class DeviceController {

    public async getAllDevices(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const devices = await deviceLogic.getAllDevices();
            response.json(devices);
        }
        catch (err) {
            next(err);
        }
    }

    public async getDeviceByMongoId(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const id = request.params.id;
            const device = await deviceLogic.getDeviceByMongoId(id);

            if (!device) {
                response.status(404).json({ message: "Device not found" });
                return;
            }

            response.json(device);
        }
        catch (err) {
            next(err);
        }
    }

    public async getDeviceByNumber(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const deviceNumber = request.params.deviceNumber;
            const device = await deviceLogic.getDeviceByNumber(deviceNumber);

            if (!device) {
                response.status(404).json({ message: "Device not found" });
                return;
            }

            response.json(device);
        }
        catch (err) {
            next(err);
        }
    }


        public async getDeviceByName(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const deviceName = request.params.deviceName;
            const device = await deviceLogic.getDeviceByName(deviceName);

            if (!device) {
                response.status(404).json({ message: "Device not found" });
                return;
            }

            response.json(device);
        }
        catch (err) {
            next(err);
        }
    }

    public async addDevice(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const device = request.body;
            const addedDevice = await deviceLogic.addDevice(device);
            response.status(201).json(addedDevice);
        }
        catch (err: any) {
            if (err.message === "Device number already exists") {
                response.status(400).json({ message: err.message });
                return;
            }

            next(err);
        }
    }

    public async updateDeviceByMongoId(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const id = request.params.id;
            const device = request.body;

            const updatedDevice = await deviceLogic.updateDeviceByMongoId(id, device);

            if (!updatedDevice) {
                response.status(404).json({ message: "Device not found" });
                return;
            }

            response.json(updatedDevice);
        }
        catch (err: any) {
            if (err.message === "Device number already exists") {
                response.status(400).json({ message: err.message });
                return;
            }

            next(err);
        }
    }

    public async deleteDeviceByMongoId(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const id = request.params.id;
            const deletedDevice = await deviceLogic.deleteDeviceByMongoId(id);

            if (!deletedDevice) {
                response.status(404).json({ message: "Device not found" });
                return;
            }

            response.json({ message: "Device deleted successfully", deletedDevice });
        }
        catch (err) {
            next(err);
        }
    }
}

const deviceController = new DeviceController();

export default deviceController;