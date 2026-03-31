import { ChangeEvent, FormEvent, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import DeviceModel from "../../Models/DeviceModel";

interface AddDeviceDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (device: DeviceModel) => void;
}

function AddDeviceDialog(props: AddDeviceDialogProps): JSX.Element {
    const [device, setDevice] = useState<DeviceModel>(new DeviceModel());
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    function handleChange(event: ChangeEvent<HTMLInputElement>): void {
        const { name, value } = event.target;

        const updatedDevice = new DeviceModel();
        updatedDevice.deviceNumber = device.deviceNumber;
        updatedDevice.deviceName = device.deviceName;
        updatedDevice.unit = device.unit;
        updatedDevice.assignedToUserId = device.assignedToUserId;
        updatedDevice.unitResponsibleUserId = device.unitResponsibleUserId;
        updatedDevice.status = device.status;

        updatedDevice[name as keyof DeviceModel] = value as never;

        setDevice(updatedDevice);

        if (error) setError("");
        if (successMessage) setSuccessMessage("");
    }

    function validate(): string {
        if (!device.deviceNumber.trim()) return "יש להזין מספר מכשיר";
        if (!device.deviceName.trim()) return "יש להזין שם מכשיר";
        if (!device.unit.trim()) return "יש לבחור יחידה";
        if (!device.unitResponsibleUserId.trim()) return "יש להזין אחראי יחידה";
        if (!/^\d+$/.test(device.deviceNumber)) return "מספר מכשיר חייב להכיל ספרות בלבד";
        return "";
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            setSuccessMessage("");
            return;
        }

        props.onSave(device);
        setSuccessMessage("המכשיר נשמר בהצלחה");
    }

    function handleClose(): void {
        setError("");
        setSuccessMessage("");
        setDevice(new DeviceModel());
        props.onClose();
    }

    return (
        <Dialog open={props.open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ direction: "rtl", textAlign: "right" }}>
                הוספת מכשיר חדש
            </DialogTitle>

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent sx={{ direction: "rtl" }}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
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

                        <TextField
                            select
                            label="יחידה"
                            name="unit"
                            value={device.unit}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="">בחר יחידה</MenuItem>
                            <MenuItem value="יחידה א">יחידה א</MenuItem>
                            <MenuItem value="יחידה ב">יחידה ב</MenuItem>
                            <MenuItem value="מחסן">מחסן</MenuItem>
                        </TextField>

                        <TextField
                            label="משתמש משויך"
                            name="assignedToUserId"
                            value={device.assignedToUserId}
                            onChange={handleChange}
                            fullWidth
                            helperText="אופציונלי"
                        />

                        <TextField
                            label="אחראי יחידה"
                            name="unitResponsibleUserId"
                            value={device.unitResponsibleUserId}
                            onChange={handleChange}
                            fullWidth
                        />

                        <TextField
                            select
                            label="סטטוס"
                            name="status"
                            value={device.status}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="assigned">assigned</MenuItem>
                            <MenuItem value="in_warehouse">in_warehouse</MenuItem>
                        </TextField>
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
                    <Button type="submit" variant="contained">
                        שמור
                    </Button>

                    <Button type="button" variant="outlined" onClick={handleClose}>
                        ביטול
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default AddDeviceDialog;