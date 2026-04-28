import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./MashkashDashboardPage.css";

type ReportStatus = "reported" | "not_reported";

type Row = {
  deviceNumber: string;
  deviceName: string;
  assignedToUserName: string | null;
  phone: string | null;
  status: ReportStatus;
  location: string | null;
  lastReportDate: string | null;
};

function MashkashDashboardPage(): JSX.Element {
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");
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

      const res = await axios.get(
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
    return rows.filter((row) => {
      const matchSearch =
        search === "" ||
        row.deviceNumber.includes(search) ||
        (row.deviceName ?? "").includes(search);

      const matchStatus = statusFilter === "all" || row.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [rows, search, statusFilter]);

  if (loading) {
    return <div>טוען...</div>;
  }

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
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all">הכל</option>
          <option value="reported">דווח</option>
          <option value="not_reported">לא דווח</option>
        </select>
      </div>

      <table className="mashkash-table">
        <thead>
          <tr>
            <th>מספר מכשיר</th>
            <th>שם מכשיר</th>
            <th>משויך ל</th>
            <th>טלפון</th>
            <th>סטטוס</th>
            <th>מיקום</th>
            <th>דיווח אחרון</th>
          </tr>
        </thead>

        <tbody>
          {filteredRows.map((row) => (
            <tr key={row.deviceNumber}>
              <td>{row.deviceNumber}</td>
              <td>{row.deviceName}</td>
              <td>{row.assignedToUserName ?? "לא משויך"}</td>
              <td>{row.phone ?? "-"}</td>

              <td>{row.status === "reported" ? "✅ דווח" : "❌ לא דווח"}</td>

              <td>{row.location ?? "-"}</td>
              <td>{row.lastReportDate ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MashkashDashboardPage;
