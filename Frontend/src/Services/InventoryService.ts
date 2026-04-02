import axios from "axios";
import authService from "./AuthService";

class InventoryService {
    private baseUrl = "http://localhost:3001/api/inventory-sheets";

    public async createSheet(): Promise<void> {
        const user = authService.getUser();
        if (!user) throw new Error("User not logged in");

        const today = new Date().toLocaleDateString("he-IL");

        await axios.post(this.baseUrl, {
            createdByUserId: user.personalNumber,
            sheetName: `גיליון מלאי ${today}`   // 🔥 זה התיקון
        });
    }
}

const inventoryService = new InventoryService();
export default inventoryService;