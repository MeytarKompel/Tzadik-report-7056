import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function InventorySheetsPage(): JSX.Element {
  const [sheets, setSheets] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSheets();
  }, []);

  async function loadSheets() {
    try {
      const res = await axios.get("http://localhost:3001/api/inventory-sheets");
      setSheets(res.data);
    } catch {
      console.error("Failed to load sheets");
    }
  }

  function goToSheet(sheet: any): void {
    const sheetId = sheet._id?.toString?.() ?? String(sheet._id);
    console.log("sheetId for navigate:", sheetId);
    navigate(`/inventory-sheets/${sheetId}/reports`);
  }

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate("/admin")}>Back</button>

      <h1>רשימת גיליונות</h1>

      {sheets.map((sheet: any) => {
        const sheetId = sheet._id?.toString?.() ?? String(sheet._id);

        return (
          <div
            key={sheetId}
            onClick={() => goToSheet(sheet)}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              cursor: "pointer",
            }}
          >
            <h3>{sheet.sheetName}</h3>
            <p>{sheet.description}</p>
            <small>{sheet.status}</small>
          </div>
        );
      })}
    </div>
  );
}

export default InventorySheetsPage;
