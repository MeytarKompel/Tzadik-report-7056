import axios from "axios";
import authService from "./AuthService";

class InventoryService {
    private baseUrl = "http://localhost:3001/api/inventory-sheets";

public async createSheet(sheetName: string, description: string): Promise<void> {
    const user = authService.getUser();
    if (!user) throw new Error("User not logged in");

await axios.post(`${this.baseUrl}/create-clean`, {
    createdByUserId: user.personalNumber,
    sheetName,
    description
});
}
}

const inventoryService = new InventoryService();
export default inventoryService;