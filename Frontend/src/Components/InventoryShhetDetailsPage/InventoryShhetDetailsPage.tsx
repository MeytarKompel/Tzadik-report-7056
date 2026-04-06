import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function InventorySheetDetailsPage(): JSX.Element {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (id) loadSheet();
    }, [id]);

    async function loadSheet() {
        try {
            const res = await axios.get(
                `http://localhost:3001/api/inventory-sheets/${id}/full`
            );
            setData(res.data);
        } catch {
            console.error("Failed to load sheet");
        }
    }

    if (!data) return <div>טוען...</div>;

    return (
        <div style={{ padding: "20px" }}>
            <h1>{data.sheet.sheetName}</h1>

            <p>תאריך: {data.reportDate}</p>

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

export default InventorySheetDetailsPage;