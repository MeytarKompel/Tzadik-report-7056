import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function DailyReportDetailsPage(): JSX.Element {
  const { id, date } = useParams();
  const [data, setData] = useState<any>(null);
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

  if (!data) return <div>טוען...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>Back</button>

      <h1>{data.sheet.sheetName}</h1>
      <h3>📅 {data.reportDate}</h3>

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
          {data.rows.map((row: any) => (
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
