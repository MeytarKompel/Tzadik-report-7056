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

  async function updateReportStatus(
    deviceNumber: string,
    newStatus: "reported" | "not_reported",
  ) {
    try {
      await axios.patch("http://localhost:3001/api/daily-reports/status", {
        sheetId: id,
        reportDate: date,
        deviceNumber,
        status: newStatus,
      });

      setData((prev: any) => {
        if (!prev) return prev;

        return {
          ...prev,
          rows: prev.rows.map((row: any) =>
            row.deviceNumber === deviceNumber
              ? {
                  ...row,
                  dailyReport: {
                    ...row.dailyReport,
                    status: newStatus,
                  },
                }
              : row,
          ),
        };
      });
    } catch (error) {
      console.error("Failed to update report status", error);
      alert("שינוי סטטוס הדיווח נכשל");
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
    const rowReportStatus = String(row.dailyReport?.status ?? "").trim();

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
            {filteredRows.map((row: any) => (
              <TableRow
                key={row.deviceNumber}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
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
                    value={row.dailyReport?.status ?? "not_reported"}
                    onChange={(e) =>
                      updateReportStatus(
                        row.deviceNumber,
                        e.target.value as "reported" | "not_reported",
                      )
                    }
                    style={{
                      padding: "6px 10px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      minWidth: "120px",
                    }}
                  >
                    <option value="reported">דווח</option>
                    <option value="not_reported">לא דווח</option>
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default DailyReportDetailsPage;