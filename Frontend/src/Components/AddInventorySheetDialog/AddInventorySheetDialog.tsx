import { ChangeEvent, FormEvent, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

interface AddInventorySheetDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (sheetName: string, description: string) => Promise<void>;
}

function AddInventorySheetDialog(props: AddInventorySheetDialogProps): JSX.Element {
    const [sheetName, setSheetName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    function validate(): string {
        if (!sheetName.trim()) return "יש להזין שם גיליון";
        return "";
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");

            await props.onSave(sheetName, description);

            handleClose();
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data ||
                "יצירת גיליון נכשלה";

            setError(typeof message === "string" ? message : "יצירת גיליון נכשלה");
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleClose(): void {
        if (isSubmitting) return;

        setSheetName("");
        setDescription("");
        setError("");
        props.onClose();
    }

    return (
        <Dialog open={props.open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ direction: "rtl", textAlign: "right" }}>
                יצירת גיליון מלאי
            </DialogTitle>

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent sx={{ direction: "rtl" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            label="שם גיליון"
                            value={sheetName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSheetName(e.target.value)}
                            fullWidth
                        />

                        <TextField
                            label="תיאור"
                            value={description}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
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

                <DialogActions sx={{ direction: "rtl", px: 3, pb: 3 }}>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? "יוצר..." : "צור גיליון"}
                    </Button>

                    <Button onClick={handleClose} variant="outlined" disabled={isSubmitting}>
                        ביטול
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default AddInventorySheetDialog;