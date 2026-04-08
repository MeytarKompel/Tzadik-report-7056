import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import "./AdminDashboardPage.css";
import AdminSummaryCard from "../../Components/AdminSummaryCard/AdminSummaryCard";
import AddDeviceDialog from "../../Components/AddDeviceDialog/AddDeviceDialog";
import AddUserDialog from "../../Components/AddUserDialog/AddUserDialog";
import DeviceModel from "../../Models/DeviceModel";
import UserModel from "../../Models/UserModel";
import deviceService from "../../Services/DeviceService";
import userService from "../../Services/UserService";
import { useNavigate } from "react-router-dom";
import inventoryService from "../../Services/InventoryService";
import AddInventorySheetDialog from "../AddInventorySheetDialog/AddInventorySheetDialog";
import axios from "axios";
import dailyReportService from "../../Services/DailyReportService";
import CreateDailyReportDialog from "../CreateDailyReportDialog/CreateDailyReportDialog";

function AdminDashboardPage(): JSX.Element {
  const [isAddDeviceDialogOpen, setIsAddDeviceDialogOpen] =
    useState<boolean>(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] =
    useState<boolean>(false);

  const [devices, setDevices] = useState<DeviceModel[]>([]);
  const [users, setUsers] = useState<UserModel[]>([]);

  const navigate = useNavigate();

  const [error, setError] = useState<string>("");
  const [userError, setUserError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUsersLoading, setIsUsersLoading] = useState<boolean>(true);

  const [sheetMessage, setSheetMessage] = useState<string>("");
  const [sheetError, setSheetError] = useState<string>("");
  const [isCreatingSheet, setIsCreatingSheet] = useState<boolean>(false);

  const [isSheetDialogOpen, setIsSheetDialogOpen] = useState(false);
  const [isDailyDialogOpen, setIsDailyDialogOpen] = useState(false);
  const [sheets, setSheets] = useState([]);

  useEffect(() => {
    loadDevices();
    loadUsers();
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

  async function loadUsers(): Promise<void> {
    try {
      setIsUsersLoading(true);
      setUserError("");

      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "טעינת המשתמשים נכשלה";

      setUserError(
        typeof message === "string" ? message : "טעינת המשתמשים נכשלה",
      );
    } finally {
      setIsUsersLoading(false);
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

  function openAddUserDialog(): void {
    setIsAddUserDialogOpen(true);
  }

  function closeAddUserDialog(): void {
    setIsAddUserDialogOpen(false);
  }

  async function saveDevice(device: DeviceModel): Promise<void> {
    await deviceService.addDevice(device);
    await loadDevices();
    setIsAddDeviceDialogOpen(false);
  }

  async function saveUser(user: UserModel): Promise<void> {
    await userService.addUser(user);
    await loadUsers();
    setIsAddUserDialogOpen(false);
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

  const sortedDevices = [...devices].sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }

    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return dateB - dateA;
  });

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <h1>מסך ניהול ראשי</h1>
          <p>כאן תוכל לנהל את המלאי, הדיווחים, היחידות והמשתמשים במערכת.</p>
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
          value={users.length}
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

            <button type="button" onClick={openAddUserDialog}>
              הוספת משתמש חדש
            </button>

            <button type="button" onClick={() => navigate("/users")}>
              ניהול משתמשים
            </button>

            <button type="button" onClick={openSheetDialog}>
              יצירת גיליון מלאי
            </button>

            <button
              type="button"
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
            </button>

            <button type="button" onClick={() => navigate("/inventory-sheets")}>
              מעבר לרשימת גיליונות
            </button>

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
            <li>סה״כ משתמשים במערכת: {users.length}</li>
            <li>
              מנהלים: {users.filter((user) => user.role === "admin").length}
            </li>
            <li>
              משקשים: {users.filter((user) => user.role === "mashkash").length}
            </li>
            <li>
              משתמשים רגילים:{" "}
              {users.filter((user) => user.role === "regular").length}
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
          <div className="admin-table-wrapper admin-table-scroll">
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
                {sortedDevices.map((device) => (
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

      <section className="admin-panel">
        <h2>רשימת משתמשים</h2>

        {userError && (
          <Alert severity="error" variant="filled" sx={{ mb: 2 }}>
            {userError}
          </Alert>
        )}

        {isUsersLoading ? (
          <p>טוען משתמשים...</p>
        ) : users.length === 0 ? (
          <p>אין משתמשים להצגה.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>מספר אישי</th>
                  <th>שם מלא</th>
                  <th>טלפון</th>
                  <th>יחידה</th>
                  <th>סוג משתמש</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.personalNumber || user.personalNumber}>
                    <td>{user.personalNumber}</td>
                    <td>{user.fullName}</td>
                    <td>{user.phone}</td>
                    <td>{user.unit || "-"}</td>
                    <td>
                      {user.role === "admin"
                        ? "מנהל"
                        : user.role === "mashkash"
                          ? "משקש"
                          : "משתמש רגיל"}
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

      <AddUserDialog
        open={isAddUserDialogOpen}
        onClose={closeAddUserDialog}
        onSave={saveUser}
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
