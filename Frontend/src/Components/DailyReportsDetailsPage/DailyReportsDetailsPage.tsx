import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Tab from "@mui/material/Tab";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";

function DailyReportDetailsPage(): JSX.Element {
  const { id, date } = useParams();
  const [data, setData] = useState<any>(null);
  const [searchDeviceNumber, setSearchDeviceNumber] = useState("");
  const [filterDeviceName, setFilterDeviceName] = useState("");
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

    const matchesDeviceNumber =
      searchDeviceNumber.trim() === "" ||
      rowDeviceNumber.includes(searchDeviceNumber.trim());

    const matchesDeviceName =
      filterDeviceName.trim() === "" ||
      rowDeviceName === filterDeviceName.trim();

    return matchesDeviceNumber && matchesDeviceName;
  });

  if (!data) return <div>טוען...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>Back</button>

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

        <button
          type="button"
          onClick={() => {
            setSearchDeviceNumber("");
            setFilterDeviceName("");
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
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>מכשיר</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>שם</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>סטטוס</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>דיווח</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.map((row: any) => (
              <TableRow
                key={row.deviceNumber}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.deviceNumber}
                </TableCell>
                <TableCell>{row.deviceName}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.dailyReport.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default DailyReportDetailsPage;
