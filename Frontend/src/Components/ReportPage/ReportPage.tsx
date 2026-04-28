import { useEffect, useState } from "react";
import axios from "axios";
import "./ReportPage.css";

type ReportStatus = "reported" | "not_reported";

type Row = {
  inventoryItemId: string;
  sheetId: string;
  deviceNumber: string;
  deviceName: string | null;
  assignedUser: {
    personalNumber: string;
    fullName: string | null;
    phone: string | null;
  } | null;
  dailyReportStatus: ReportStatus;
  location: string | null;
  notes: string | null;
};

function ReportPage(): JSX.Element {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

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

      if (!user?.personalNumber) return;

      const today = new Date().toISOString().split("T")[0];

      let url = "";

      if (user.role === "regular") {
        url = `http://localhost:3001/api/inventory-items/assigned-user/daily-status/${user.personalNumber}/${today}`;
      }

      if (user.role === "mashkash") {
        url = `http://localhost:3001/api/inventory-items/unit-responsible/daily-status/${user.personalNumber}/${today}`;
      }

      const res = await axios.get(url);
      setRows(res.data);
    } catch (err) {
      console.error("Failed to load report data", err);
    } finally {
      setLoading(false);
    }
  }

  async function reportDevice(row: Row) {
    try {
      setSaving(row.deviceNumber);

      const today = new Date().toISOString().split("T")[0];

      await axios.post("http://localhost:3001/api/daily-reports/report", {
        personalNumber: user.personalNumber,
        phone: user.phone,
        deviceNumber: row.deviceNumber,
        reportDate: today,
      });

      await loadData();
    } catch (err) {
      console.error("Report failed", err);
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="report-container" dir="rtl">
      <h1>מסך דיווח יומי</h1>

      <table className="report-table">
        <thead>
          <tr>
            <th>מספר מכשיר</th>
            <th>שם מכשיר</th>
            <th>משויך ל</th>
            <th>סטטוס</th>
            <th>פעולה</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.inventoryItemId}>
              <td>{row.deviceNumber}</td>
              <td>{row.deviceName ?? "-"}</td>
              <td>{row.assignedUser?.fullName ?? "לא משויך"}</td>

              <td>
                {row.dailyReportStatus === "reported"
                  ? "✅ דווח"
                  : "❌ לא דווח"}
              </td>

              <td>
                {row.dailyReportStatus === "not_reported" && (
                  <button
                    onClick={() => reportDevice(row)}
                    disabled={saving === row.deviceNumber}
                  >
                    {saving === row.deviceNumber ? "שולח..." : "דווח"}
                  </button>
                )}
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={5}>אין מכשירים להצגה</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReportPage;