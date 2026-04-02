import axios from "axios";

class DailyReportService {
    private baseUrl = "http://localhost:3001/api/daily-reports";

    public async createDaily(sheetId: string, reportDate: string): Promise<void> {
        await axios.post(`${this.baseUrl}/create`, {
            sheetId,
            reportDate
        });
    }
}

const dailyReportService = new DailyReportService();
export default dailyReportService;