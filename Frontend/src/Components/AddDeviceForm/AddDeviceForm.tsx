import { ChangeEvent, FormEvent, useState } from "react";
import Alert from "@mui/material/Alert";
import DeviceModel from "../../Models/DeviceModel";
import "./AddDeviceForm.css";

interface AddDeviceFormProps {
    onCancel: () => void;
    onSave: (device: DeviceModel) => void;
}

function AddDeviceForm(props: AddDeviceFormProps): JSX.Element {
    const [device, setDevice] = useState<DeviceModel>(new DeviceModel());
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
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

    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            setSuccessMessage("");
            return;
        }

        props.onSave(device);
        setSuccessMessage("המכשיר מוכן לשמירה");
    }

    return (
        <div className="add-device-form-wrapper">
            <form onSubmit={submit} className="add-device-form">
                <h2>הוספת מכשיר חדש</h2>

                <div className="add-device-grid">
                    <div className="form-group">
                        <label htmlFor="deviceNumber">מספר מכשיר</label>
                        <input
                            id="deviceNumber"
                            name="deviceNumber"
                            type="text"
                            value={device.deviceNumber}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="deviceName">שם מכשיר</label>
                        <input
                            id="deviceName"
                            name="deviceName"
                            type="text"
                            value={device.deviceName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="unit">יחידה</label>
                        <select
                            id="unit"
                            name="unit"
                            value={device.unit}
                            onChange={handleChange}
                        >
                            <option value="">בחר יחידה</option>
                            <option value="יחידה א">יחידה א</option>
                            <option value="יחידה ב">יחידה ב</option>
                            <option value="מחסן">מחסן</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="assignedToUserId">משתמש משויך</label>
                        <input
                            id="assignedToUserId"
                            name="assignedToUserId"
                            type="text"
                            value={device.assignedToUserId}
                            onChange={handleChange}
                            placeholder="אופציונלי"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="unitResponsibleUserId">אחראי יחידה</label>
                        <input
                            id="unitResponsibleUserId"
                            name="unitResponsibleUserId"
                            type="text"
                            value={device.unitResponsibleUserId}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">סטטוס</label>
                        <select
                            id="status"
                            name="status"
                            value={device.status}
                            onChange={handleChange}
                        >
                            <option value="assigned">assigned</option>
                            <option value="in_warehouse">in_warehouse</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <Alert severity="error" variant="filled">
                        {error}
                    </Alert>
                )}

                {successMessage && (
                    <Alert severity="success" variant="filled">
                        {successMessage}
                    </Alert>
                )}

                <div className="add-device-actions">
                    <button type="submit">שמור</button>
                    <button type="button" className="secondary-button" onClick={props.onCancel}>
                        ביטול
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddDeviceForm;