import { FormEvent, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

interface Sheet {
  _id: string;
  sheetName: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (sheetId: string, date: string) => Promise<void>;
  sheets: Sheet[];
}

function CreateDailyReportDialog(props: Props): JSX.Element {
  const [sheetId, setSheetId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): string {
    if (!sheetId) return "יש לבחור גיליון";
    if (!date) return "יש לבחור תאריך";
    return "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await props.onSave(sheetId, date);
    } catch {
      setError("יצירת דיווח יומי נכשלה");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (isSubmitting) return;
    setSheetId("");
    setError("");
    props.onClose();
  }

  return (
    <Dialog open={props.open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ direction: "rtl" }}>יצירת דיווח יומי</DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ direction: "rtl" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              label="בחר גיליון"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
            >
              {props.sheets.map((sheet) => (
                <MenuItem key={sheet._id} value={sheet._id}>
                  {sheet.sheetName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="תאריך"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {error && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error" variant="filled">
                {error}
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ direction: "rtl" }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "יוצר..." : "צור"}
          </Button>

          <Button onClick={handleClose} variant="outlined">
            ביטול
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default CreateDailyReportDialog;
