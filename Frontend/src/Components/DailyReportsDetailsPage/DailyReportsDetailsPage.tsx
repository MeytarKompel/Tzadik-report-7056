import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
      `http://localhost:3001/api/inventory-sheets/${id}/full?reportDate=${date}`
    );

    setData(res.data);
  }

  const rows = data?.rows || [];

  const uniqueDeviceNames = Array.from(
    new Set(
      rows
        .map((row: any) => String(row.deviceName ?? "").trim())
        .filter((name: string) => name.length > 0)
    )
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

      <table>
        <thead>
          <tr>
            <th>מכשיר</th>
            <th>שם</th>
            <th>סטטוס</th>
            <th>דיווח</th>
          </tr>
        </thead>

        <tbody>
          {filteredRows.map((row: any) => (
            <tr key={row.deviceNumber}>
              <td>{row.deviceNumber}</td>
              <td>{row.deviceName}</td>
              <td>{row.status}</td>
              <td>{row.dailyReport.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DailyReportDetailsPage;