import { ChangeEvent, useState } from "react";
import Papa from "papaparse";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import DeviceModel from "../../Models/DeviceModel";
import deviceService from "../../Services/DeviceService";

function ImportDevicesPage(): JSX.Element {
  const [devices, setDevices] = useState<DeviceModel[]>([]);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccessMessage("");
    setDevices([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedDevices: DeviceModel[] = (results.data as any[]).map(
            (row) => {
              const device = new DeviceModel();

              // 🔥 התאמה לעברית
              device.deviceNumber = String(row["צ"] ?? "").trim();
              device.deviceName = String(row["מכשיר"] ?? "").trim();

              device.isActive = true;

              return device;
            },
          );

          const validDevices = parsedDevices.filter(
            (d) => d.deviceNumber && d.deviceName,
          );

          if (validDevices.length === 0) {
            setError("לא נמצאו נתונים תקינים בקובץ.");
            return;
          }

          setDevices(validDevices);
        } catch {
          setError("קריאת הקובץ נכשלה.");
        }
      },
      error: () => {
        setError("קריאת קובץ ה-CSV נכשלה.");
      },
    });
  }

  async function handleImport(): Promise<void> {
    if (devices.length === 0) {
      setError("אין מכשירים לייבוא.");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      setSuccessMessage("");

      await deviceService.importDevices(devices);

      setSuccessMessage(`יובאו בהצלחה ${devices.length} מכשירים.`);
      setDevices([]);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "ייבוא המכשירים נכשל";

      setError(typeof message === "string" ? message : "ייבוא המכשירים נכשל");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Box
      sx={{
        direction: "rtl",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography variant="h4">ייבוא מכשירים מ-CSV</Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          העלה קובץ CSV עם העמודות: <strong>deviceNumber</strong>,{" "}
          <strong>deviceName</strong>
        </Typography>

        <input type="file" accept=".csv" onChange={handleFileChange} />

        {error && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error" variant="filled">
              {error}
            </Alert>
          </Box>
        )}

        {successMessage && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" variant="filled">
              {successMessage}
            </Alert>
          </Box>
        )}
      </Paper>

      {devices.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            תצוגה מקדימה ({devices.length} רשומות)
          </Typography>

          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "10px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    מספר מכשיר
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "10px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    שם מכשיר
                  </th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device, index) => (
                  <tr key={`${device.deviceNumber}-${index}`}>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {device.deviceNumber}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {device.deviceName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={isUploading}
            >
              {isUploading ? "מייבא..." : "ייבא ל-DB"}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default ImportDevicesPage;
