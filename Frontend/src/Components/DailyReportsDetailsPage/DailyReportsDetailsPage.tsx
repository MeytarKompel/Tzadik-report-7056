import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";

function DailyReportDetailsPage(): JSX.Element {
  const { id, date } = useParams();
  const [data, setData] = useState<any>(null);
  const [searchDeviceNumber, setSearchDeviceNumber] = useState("");
  const [filterDeviceName, setFilterDeviceName] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, "reported" | "not_reported">
  >({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (id && date) loadData();
  }, [id, date]);

  async function loadData() {
    const res = await axios.get(
      `http://localhost:3001/api/inventory-sheets/${id}/full?reportDate=${date}`,
    );

    setData(res.data);
  }

  function handleStatusChange(
    deviceNumber: string,
    newStatus: "reported" | "not_reported",
  ) {
    setPendingChanges((prev) => ({
      ...prev,
      [deviceNumber]: newStatus,
    }));

    setSaveMessage("");
  }

  async function saveChanges() {
    try {
      setSaving(true);
      setSaveMessage("");

      const entries = Object.entries(pendingChanges);

      for (const [deviceNumber, status] of entries) {
        await axios.patch("http://localhost:3001/api/daily-reports/status", {
          sheetId: id,
          reportDate: date,
          deviceNumber,
          status,
        });
      }

      setData((prev: any) => {
        if (!prev) return prev;

        return {
          ...prev,
          rows: prev.rows.map((row: any) => {
            const changedStatus = pendingChanges[row.deviceNumber];

            if (!changedStatus) return row;

            return {
              ...row,
              dailyReport: {
                ...row.dailyReport,
                status: changedStatus,
              },
            };
          }),
        };
      });

      setPendingChanges({});
      setSaveMessage("השינויים נשמרו בהצלחה");
    } catch (error) {
      console.error("Failed to save changes", error);
      setSaveMessage("שמירת השינויים נכשלה");
    } finally {
      setSaving(false);
    }
  }

  const rows = data?.rows || [];

  const uniqueDeviceNames = Array.from(
    new Set(
      rows
        .map((row: any) => String(row.deviceName ?? "").trim())
        .filter((name: string) => name.length > 0),
    ),
  ) as string[];

  const filteredRows = rows.filter((row: any) => {
    const rowDeviceNumber = String(row.deviceNumber ?? "").trim();
    const rowDeviceName = String(row.deviceName ?? "").trim();
    const rowReportStatus = String(
      pendingChanges[row.deviceNumber] ?? row.dailyReport?.status ?? "",
    ).trim();

    const matchesDeviceNumber =
      searchDeviceNumber.trim() === "" ||
      rowDeviceNumber.includes(searchDeviceNumber.trim());

    const matchesDeviceName =
      filterDeviceName.trim() === "" ||
      rowDeviceName === filterDeviceName.trim();

    const matchesStatus =
      filterStatus === "all" || rowReportStatus === filterStatus;

    return matchesDeviceNumber && matchesDeviceName && matchesStatus;
  });

  if (!data) return <div dir="rtl" style={{ padding: "20px" }}>טוען...</div>;

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div dir="rtl" style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>חזור</button>

      <h1>{data.sheet.sheetName}</h1>
      <h3>📅 {data.reportDate}</h3>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="חיפוש לפי מספר מכשיר"
          value={searchDeviceNumber}
          onChange={(e) => setSearchDeviceNumber(e.target.value)}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            minWidth: "220px",
          }}
        />

        <select
          value={filterDeviceName}
          onChange={(e) => setFilterDeviceName(e.target.value)}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            minWidth: "220px",
          }}
        >
          <option value="">כל סוגי המכשירים</option>
          {uniqueDeviceNames.map((deviceName) => (
            <option key={deviceName} value={deviceName}>
              {deviceName}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            minWidth: "220px",
          }}
        >
          <option value="all">הכל</option>
          <option value="reported">דווח</option>
          <option value="not_reported">לא דווח</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setSearchDeviceNumber("");
            setFilterDeviceName("");
            setFilterStatus("all");
          }}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          נקה סינון
        </button>

        <button
          type="button"
          onClick={saveChanges}
          disabled={!hasPendingChanges || saving}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            cursor: !hasPendingChanges || saving ? "not-allowed" : "pointer",
            opacity: !hasPendingChanges || saving ? 0.6 : 1,
            fontWeight: "bold",
          }}
        >
          {saving ? "שומר..." : "שמור שינויים"}
        </button>

        {hasPendingChanges && !saving && (
          <span style={{ fontWeight: "bold" }}>יש שינויים שלא נשמרו</span>
        )}

        {saveMessage && (
          <span
            style={{
              fontWeight: "bold",
              color: saveMessage.includes("בהצלחה") ? "green" : "red",
            }}
          >
            {saveMessage}
          </span>
        )}
      </div>

      <TableContainer component={Paper} dir="rtl">
        <Table sx={{ minWidth: 650 }} aria-label="daily report table">
          <TableHead>
            <TableRow>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                מספר מכשיר
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                שם מכשיר
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                סטטוס מכשיר
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                דיווח
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.map((row: any) => {
              const currentStatus =
                pendingChanges[row.deviceNumber] ??
                row.dailyReport?.status ??
                "not_reported";

              const isChanged = row.dailyReport?.status !== currentStatus;

              return (
                <TableRow
                  key={row.deviceNumber}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    backgroundColor: isChanged ? "#fff8e1" : "inherit",
                  }}
                >
                  <TableCell
                    align="right"
                    component="th"
                    scope="row"
                    sx={{ direction: "ltr" }}
                  >
                    {row.deviceNumber}
                  </TableCell>

                  <TableCell align="right">{row.deviceName}</TableCell>

                  <TableCell align="right">{row.status}</TableCell>

                  <TableCell align="right">
                    <select
                      value={currentStatus}
                      onChange={(e) =>
                        handleStatusChange(
                          row.deviceNumber,
                          e.target.value as "reported" | "not_reported",
                        )
                      }
                      style={{
                        padding: "6px 10px",
                        borderRadius: "8px",
                        border: isChanged ? "2px solid orange" : "1px solid #ccc",
                        minWidth: "120px",
                      }}
                    >
                      <option value="reported">דווח</option>
                      <option value="not_reported">לא דווח</option>
                    </select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default DailyReportDetailsPage;