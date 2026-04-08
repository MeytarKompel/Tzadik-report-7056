import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function DailyReportsListPage(): JSX.Element {
  const { id } = useParams();
  const [dates, setDates] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadDates();
    }
  }, [id]);

  async function loadDates(): Promise<void> {
    try {
      const res = await axios.get(
        `http://localhost:3001/api/daily-reports/by-sheet/${id}`,
      );

      console.log("Daily reports for sheet:", res.data);

      const reports = res.data;

      const uniqueDates = Array.from(
        new Set(reports.map((r: any) => r.reportDate)),
      ) as string[];

      console.log("Unique report dates:", uniqueDates);

      setDates(uniqueDates);
    } catch (err) {
      console.error("Failed to load daily reports dates", err);
    }
  }

  function goToReport(date: string): void {
    navigate(`/inventory-sheets/${id}/report/${date}`);
  }

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>Back</button>

      <h1>דיווחים יומיים</h1>

      {dates.map((date) => (
        <div
          key={date}
          onClick={() => goToReport(date)}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
        >
          📅 {date}
        </div>
      ))}
    </div>
  );
}

export default DailyReportsListPage;
