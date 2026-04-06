import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import "./AdminDashboardPage.css";
import AdminSummaryCard from "../../Components/AdminSummaryCard/AdminSummaryCard";
import AddDeviceDialog from "../../Components/AddDeviceDialog/AddDeviceDialog";
import DeviceModel from "../../Models/DeviceModel";
import deviceService from "../../Services/DeviceService";
import { useNavigate } from "react-router-dom";
import inventoryService from "../../Services/InventoryService";
import AddInventorySheetDialog from "../AddInventorySheetDialog/AddInventorySheetDialog";
import axios from "axios";
import dailyReportService from "../../Services/DailyReportService";
import CreateDailyReportDialog from "../CreateDailyReportDialog/CreateDailyReportDialog";

function AdminDashboardPage(): JSX.Element {
  const [isAddDeviceDialogOpen, setIsAddDeviceDialogOpen] =
    useState<boolean>(false);
  const [devices, setDevices] = useState<DeviceModel[]>([]);
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sheetMessage, setSheetMessage] = useState<string>("");
  const [sheetError, setSheetError] = useState<string>("");
  const [isCreatingSheet, setIsCreatingSheet] = useState<boolean>(false);
  const [isSheetDialogOpen, setIsSheetDialogOpen] = useState(false);
  const [isDailyDialogOpen, setIsDailyDialogOpen] = useState(false);
  const [sheets, setSheets] = useState([]);

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    loadSheets();
  }, []);

  async function loadDevices(): Promise<void> {
    try {
      setIsLoading(true);
      setError("");

      const allDevices = await deviceService.getAllDevices();
      setDevices(allDevices);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "טעינת המכשירים נכשלה";

      setError(typeof message === "string" ? message : "טעינת המכשירים נכשלה");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadSheets(): Promise<void> {
    try {
      const res = await axios.get("http://localhost:3001/api/inventory-sheets");
      setSheets(res.data);
    } catch {
      console.error("Failed to load sheets");
    }
  }

  function openAddDeviceDialog(): void {
    setIsAddDeviceDialogOpen(true);
  }

  function closeAddDeviceDialog(): void {
    setIsAddDeviceDialogOpen(false);
  }

  async function saveDevice(device: DeviceModel): Promise<void> {
    await deviceService.addDevice(device);
    await loadDevices();
    setIsAddDeviceDialogOpen(false);
  }

  function openSheetDialog() {
    setIsSheetDialogOpen(true);
  }

  function closeSheetDialog() {
    setIsSheetDialogOpen(false);
  }

  async function saveSheet(
    sheetName: string,
    description: string,
  ): Promise<void> {
    await inventoryService.createSheet(sheetName, description);
    await loadSheets();
    setIsSheetDialogOpen(false);
  }

  async function createDaily(sheetId: string, date: string): Promise<void> {
    await dailyReportService.createDaily(sheetId, date);
    setIsDailyDialogOpen(false);
  }
  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <h1>מסך ניהול ראשי</h1>
          <p>כאן תוכל לנהל את המלאי, הדיווחים והיחידות במערכת.</p>
        </div>
      </div>

      <section className="admin-summary-grid">
        <AdminSummaryCard
          title="סה״כ מכשירים"
          value={devices.length}
          subtitle="כלל המכשירים במערכת"
        />

        <AdminSummaryCard
          title="מכשירים פעילים"
          value={devices.filter((device) => device.isActive).length}
          subtitle="מכשירים פעילים במערכת"
        />

        <AdminSummaryCard
          title="מכשירים לא פעילים"
          value={devices.filter((device) => !device.isActive).length}
          subtitle="מכשירים שסומנו כלא פעילים"
        />

        <AdminSummaryCard
          title="משתמשים"
          value={96}
          subtitle="סה״כ משתמשים רשומים"
        />
      </section>

      <section className="admin-sections-grid">
        <div className="admin-panel">
          <h2>פעולות מהירות</h2>

          <div className="admin-actions">
            <button type="button" onClick={openAddDeviceDialog}>
              הוספת מכשיר חדש
            </button>
            <button type="button" onClick={openSheetDialog}>
              יצירת גיליון מלאי
            </button>
            <button
              onClick={async () => {
                await loadSheets();
                setIsDailyDialogOpen(true);
              }}
            >
              יצירת דיווח יומי
            </button>
            <button type="button">מעקב אחרי לא דווח</button>
            <button type="button" onClick={() => navigate("/import-devices")}>
              ייבוא מכשירים מ-CSV
            </button>{" "}
            {sheetError && (
              <Alert severity="error" variant="filled" sx={{ mt: 2 }}>
                {sheetError}
              </Alert>
            )}
            {sheetMessage && (
              <Alert severity="success" variant="filled" sx={{ mt: 2 }}>
                {sheetMessage}
              </Alert>
            )}
          </div>
        </div>

        <div className="admin-panel">
          <h2>סטטוס מערכת</h2>
          <ul className="admin-status-list">
            <li>סה״כ מכשירים במערכת: {devices.length}</li>
            <li>
              מכשירים פעילים:{" "}
              {devices.filter((device) => device.isActive).length}
            </li>
            <li>
              מכשירים לא פעילים:{" "}
              {devices.filter((device) => !device.isActive).length}
            </li>
          </ul>
        </div>
      </section>

      <section className="admin-panel">
        <h2>רשימת מכשירים</h2>

        {error && (
          <Alert severity="error" variant="filled" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <p>טוען מכשירים...</p>
        ) : devices.length === 0 ? (
          <p>אין מכשירים להצגה.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>מספר מכשיר</th>
                  <th>שם מכשיר</th>
                  <th>פעיל</th>
                  <th>נוצר בתאריך</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device._id || device.deviceNumber}>
                    <td>{device.deviceNumber}</td>
                    <td>{device.deviceName}</td>
                    <td>{device.isActive ? "כן" : "לא"}</td>
                    <td>
                      {device.createdAt
                        ? new Date(device.createdAt).toLocaleDateString("he-IL")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AddDeviceDialog
        open={isAddDeviceDialogOpen}
        onClose={closeAddDeviceDialog}
        onSave={saveDevice}
      />

      <AddInventorySheetDialog
        open={isSheetDialogOpen}
        onClose={closeSheetDialog}
        onSave={saveSheet}
      />

      <CreateDailyReportDialog
        open={isDailyDialogOpen}
        onClose={() => setIsDailyDialogOpen(false)}
        onSave={createDaily}
        sheets={sheets}
      />
    </div>
  );
}

export default AdminDashboardPage;
