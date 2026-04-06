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

    function goToSheet(sheetId: string) {
        navigate(`/inventory-sheets/${sheetId}`);
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>רשימת גיליונות</h1>

            {sheets.map(sheet => (
                <div
                    key={sheet._id}
                    onClick={() => goToSheet(sheet._id)}
                    style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        marginBottom: "10px",
                        cursor: "pointer"
                    }}
                >
                    <h3>{sheet.sheetName}</h3>
                    <p>{sheet.description}</p>
                    <small>{sheet.status}</small>
                </div>
            ))}
        </div>
    );
}

export default InventorySheetsPage;