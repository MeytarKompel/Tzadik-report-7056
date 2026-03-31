import { ChangeEvent, FormEvent, useState } from "react";
import Alert from "@mui/material/Alert";
import "./LoginPage.css";
import CredentialsModel from "../../Models/CredentialsModel";
import UserModel from "../../Models/UserModel";
import authService from "../../Services/AuthService";

function LoginPage(): JSX.Element {
    const [credentials, setCredentials] = useState<CredentialsModel>(new CredentialsModel());
    const [identifiedUser, setIdentifiedUser] = useState<UserModel | null>(null);
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        const updatedCredentials = new CredentialsModel();
        updatedCredentials.personalNumber = credentials.personalNumber;
        updatedCredentials.phone = credentials.phone;
        updatedCredentials[name as keyof CredentialsModel] = value as never;

        setCredentials(updatedCredentials);

        if (error) setError("");
        if (successMessage) setSuccessMessage("");
        if (identifiedUser) setIdentifiedUser(null);
    }

    function validate(): string {
        if (!credentials.personalNumber.trim()) return "יש להזין מספר אישי";
        if (!credentials.phone.trim()) return "יש להזין מספר טלפון";
        if (!/^\d+$/.test(credentials.personalNumber)) return "מספר אישי חייב להכיל ספרות בלבד";
        if (!/^\d+$/.test(credentials.phone)) return "מספר טלפון חייב להכיל ספרות בלבד";
        return "";
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            setSuccessMessage("");
            setIdentifiedUser(null);
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");
            setSuccessMessage("");
            setIdentifiedUser(null);

            const user = await authService.identify(credentials);

            setIdentifiedUser(user);
            setSuccessMessage("הזיהוי בוצע בהצלחה");

            console.log("Identified user:", user);
        } catch (err: any) {
            console.error(err);

            const message =
                err?.response?.data?.message ||
                "המשתמש לא נמצא או שהזיהוי נכשל";

            setError(message);
            setSuccessMessage("");
            setIdentifiedUser(null);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>התחברות למערכת</h1>

                <form onSubmit={submit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="personalNumber">מספר אישי</label>
                        <input
                            id="personalNumber"
                            name="personalNumber"
                            type="text"
                            value={credentials.personalNumber}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">טלפון</label>
                        <input
                            id="phone"
                            name="phone"
                            type="text"
                            value={credentials.phone}
                            onChange={handleChange}
                        />
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

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "מתחבר..." : "התחבר"}
                    </button>
                </form>

                {identifiedUser && (
                    <div style={{ marginTop: "16px" }}>
                        <strong>משתמש מזוהה:</strong>
                        <div>שם: {identifiedUser.fullName}</div>
                        <div>מספר אישי: {identifiedUser.personalNumber}</div>
                        <div>טלפון: {identifiedUser.phone}</div>
                        <div>יחידה: {identifiedUser.unit}</div>
                        <div>תפקיד: {identifiedUser.role}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoginPage;