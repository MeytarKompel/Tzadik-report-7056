import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./MashkashDashboardPage.css";

type ReportStatus = "reported" | "not_reported";
type InventoryStatus = "assigned" | "not_assigned";

type SortOption =
  | "deviceNumberAsc"
  | "deviceNumberDesc"
  | "deviceNameAsc"
  | "deviceNameDesc"
  | "notReportedFirst"
  | "reportedFirst"
  | "notAssignedFirst"
  | "assignedFirst";

type Row = {
  inventoryItemId: string;
  deviceNumber: string;
  deviceName: string | null;
  unit: string | null;
  inventoryStatus: InventoryStatus;
  assignedUser: {
    personalNumber: string;
    fullName: string | null;
    phone: string | null;
  } | null;
  unitResponsibleUser: {
    personalNumber: string;
    fullName: string | null;
    phone: string | null;
  } | null;
  reportDate: string;
  dailyReportStatus: ReportStatus;
  reportId: string | null;
  location: string | null;
  lastReportDate: string | null;
  lastReportStatus: ReportStatus | null;
  lastReportedByUserId: string | null;
  canUnitResponsibleReport: boolean;
};

function MashkashDashboardPage(): JSX.Element {
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");
  const [assignmentFilter, setAssignmentFilter] = useState<
    "all" | "assigned" | "not_assigned"
  >("all");
  const [sortOption, setSortOption] = useState<SortOption>("notReportedFirst");
  const [loading, setLoading] = useState(true);

  const authSession =
    JSON.parse(sessionStorage.getItem("dailyAuthSession") || "null") ||
    JSON.parse(localStorage.getItem("dailyAuthSession") || "null") ||
    JSON.parse(sessionStorage.getItem("regularAuthSession") || "null") ||
    JSON.parse(localStorage.getItem("regularAuthSession") || "null");

  const user = authSession?.user ?? authSession;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      if (!user?.personalNumber) {
        console.error("No logged user found", user);
        setRows([]);
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const res = await axios.get<Row[]>(
        `http://localhost:3001/api/inventory-items/unit-responsible/daily-status/${user.personalNumber}/${today}`,
      );

      console.log("logged user:", user);
      console.log("response data:", res.data);

      setRows(res.data);
    } catch (err) {
      console.error("Failed to load unit data", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredRows = useMemo(() => {
    const filtered = rows.filter((row) => {
      const searchText = search.trim();

      const matchSearch =
        searchText === "" ||
        String(row.deviceNumber ?? "").includes(searchText) ||
        String(row.deviceName ?? "").includes(searchText);

      const matchStatus =
        statusFilter === "all" || row.dailyReportStatus === statusFilter;

      const matchAssignment =
        assignmentFilter === "all" || row.inventoryStatus === assignmentFilter;

      return matchSearch && matchStatus && matchAssignment;
    });

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "deviceNumberAsc":
          return Number(a.deviceNumber) - Number(b.deviceNumber);

        case "deviceNumberDesc":
          return Number(b.deviceNumber) - Number(a.deviceNumber);

        case "deviceNameAsc":
          return String(a.deviceName ?? "").localeCompare(
            String(b.deviceName ?? ""),
            "he",
          );

        case "deviceNameDesc":
          return String(b.deviceName ?? "").localeCompare(
            String(a.deviceName ?? ""),
            "he",
          );

        case "notReportedFirst":
          if (a.dailyReportStatus === b.dailyReportStatus) return 0;
          return a.dailyReportStatus === "not_reported" ? -1 : 1;

        case "reportedFirst":
          if (a.dailyReportStatus === b.dailyReportStatus) return 0;
          return a.dailyReportStatus === "reported" ? -1 : 1;

        case "notAssignedFirst":
          if (a.inventoryStatus === b.inventoryStatus) return 0;
          return a.inventoryStatus === "not_assigned" ? -1 : 1;

        case "assignedFirst":
          if (a.inventoryStatus === b.inventoryStatus) return 0;
          return a.inventoryStatus === "assigned" ? -1 : 1;

        default:
          return 0;
      }
    });
  }, [rows, search, statusFilter, assignmentFilter, sortOption]);

  return (
    <div className="mashkash-container" dir="rtl">
      <h1>מסך אחראי ציוד יחידתי</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="חיפוש לפי מספר / שם מכשיר"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | ReportStatus)
          }
        >
          <option value="all">כל סטטוסי הדיווח</option>
          <option value="reported">דווח</option>
          <option value="not_reported">לא דווח</option>
        </select>

        <select
          value={assignmentFilter}
          onChange={(e) =>
            setAssignmentFilter(e.target.value as "all" | InventoryStatus)
          }
        >
          <option value="all">כל השיוכים</option>
          <option value="assigned">משויך למשתמש</option>
          <option value="not_assigned">לא משויך</option>
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
        >
          <option value="notReportedFirst">לא דווח קודם</option>
          <option value="reportedFirst">דווח קודם</option>
          <option value="notAssignedFirst">לא משויך קודם</option>
          <option value="assignedFirst">משויך קודם</option>
          <option value="deviceNumberAsc">מספר מכשיר: מהקטן לגדול</option>
          <option value="deviceNumberDesc">מספר מכשיר: מהגדול לקטן</option>
          <option value="deviceNameAsc">שם מכשיר: א-ת</option>
          <option value="deviceNameDesc">שם מכשיר: ת-א</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
            setAssignmentFilter("all");
            setSortOption("notReportedFirst");
          }}
        >
          נקה סינון
        </button>

        <button type="button" onClick={loadData}>
          רענן
        </button>
      </div>

      <table className="mashkash-table">
        <thead>
          <tr>
            <th>מספר מכשיר</th>
            <th>שם מכשיר</th>
            <th>יחידה</th>
            <th>משויך ל</th>
            <th>טלפון</th>
            <th>סטטוס שיוך</th>
            <th>סטטוס דיווח</th>
            <th>מיקום</th>
            <th>דיווח אחרון</th>
          </tr>
        </thead>

        <tbody>
          {filteredRows.map((row) => (
            <tr key={row.inventoryItemId ?? row.deviceNumber}>
              <td>{row.deviceNumber}</td>
              <td>{row.deviceName ?? "-"}</td>
              <td>{row.unit ?? "-"}</td>
              <td>{row.assignedUser?.fullName ?? "לא משויך"}</td>
              <td>{row.assignedUser?.phone ?? "-"}</td>
              <td>
                {row.inventoryStatus === "assigned" ? "משויך" : "לא משויך"}
              </td>
              <td>
                {row.dailyReportStatus === "reported"
                  ? "✅ דווח"
                  : "❌ לא דווח"}
              </td>
              <td>{row.location ?? "-"}</td>
              <td>{row.lastReportDate ?? "-"}</td>
            </tr>
          ))}

          {filteredRows.length === 0 && (
            <tr>
              <td colSpan={9}>לא נמצאו מכשירים מתאימים לסינון</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MashkashDashboardPage;
