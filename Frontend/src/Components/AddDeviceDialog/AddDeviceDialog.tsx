import { ChangeEvent, FormEvent, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import DeviceModel from "../../Models/DeviceModel";

interface AddDeviceDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (device: DeviceModel) => Promise<void>;
}

function AddDeviceDialog(props: AddDeviceDialogProps): JSX.Element {
    const [device, setDevice] = useState<DeviceModel>(new DeviceModel());
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    function handleChange(event: ChangeEvent<HTMLInputElement>): void {
        const { name, value } = event.target;

        const updatedDevice = new DeviceModel();
        updatedDevice.deviceNumber = device.deviceNumber;
        updatedDevice.deviceName = device.deviceName;
        updatedDevice.isActive = device.isActive;

        updatedDevice[name as keyof DeviceModel] = value as never;

        setDevice(updatedDevice);

        if (error) setError("");
        if (successMessage) setSuccessMessage("");
    }

    function validate(): string {
        if (!device.deviceNumber.trim()) return "יש להזין מספר מכשיר";
        if (!device.deviceName.trim()) return "יש להזין שם מכשיר";
        if (!/^\d+$/.test(device.deviceNumber)) return "מספר מכשיר חייב להכיל ספרות בלבד";
        return "";
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            setSuccessMessage("");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");
            setSuccessMessage("");

            await props.onSave(device);

            setSuccessMessage("המכשיר נשמר בהצלחה");

            setTimeout(() => {
                setDevice(new DeviceModel());
                setSuccessMessage("");
                props.onClose();
            }, 800);
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data ||
                "שמירת המכשיר נכשלה";

            setError(typeof message === "string" ? message : "שמירת המכשיר נכשלה");
            setSuccessMessage("");
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleClose(): void {
        if (isSubmitting) return;

        setError("");
        setSuccessMessage("");
        setDevice(new DeviceModel());
        props.onClose();
    }

    return (
        <Dialog open={props.open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ direction: "rtl", textAlign: "right" }}>
                הוספת מכשיר חדש
            </DialogTitle>

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent sx={{ direction: "rtl" }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            mt: 1
                        }}
                    >
                        <TextField
                            label="מספר מכשיר"
                            name="deviceNumber"
                            value={device.deviceNumber}
                            onChange={handleChange}
                            fullWidth
                        />

                        <TextField
                            label="שם מכשיר"
                            name="deviceName"
                            value={device.deviceName}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>

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
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, direction: "rtl" }}>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? "שומר..." : "שמור"}
                    </Button>

                    <Button type="button" variant="outlined" onClick={handleClose} disabled={isSubmitting}>
                        ביטול
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default AddDeviceDialog;