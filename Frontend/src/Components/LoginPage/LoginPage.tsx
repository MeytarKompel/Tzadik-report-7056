import { ChangeEvent, FormEvent, useState } from "react";
import "./LoginPage.css";
import CredentialsModel from "../../Models/CredentialsModel";
import Alert from "@mui/material/Alert";

function LoginPage(): JSX.Element {
  const [credentials, setCredentials] = useState<CredentialsModel>(
    new CredentialsModel(),
  );
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    const updatedCredentials = new CredentialsModel();
    updatedCredentials.personalNumber = credentials.personalNumber;
    updatedCredentials.phoneNumber = credentials.phoneNumber;

    updatedCredentials[name as keyof CredentialsModel] = value as never;

    setCredentials(updatedCredentials);

    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  }

  function validate(): string {
    if (!credentials.personalNumber.trim()) return "יש להזין מספר אישי";
    if (!credentials.phoneNumber.trim()) return "יש להזין מספר טלפון";
    if (!/^\d+$/.test(credentials.personalNumber))
      return "מספר אישי חייב להכיל ספרות בלבד";
    if (!/^\d+$/.test(credentials.phoneNumber))
      return "מספר טלפון חייב להכיל ספרות בלבד";
    return "";
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
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

      console.log("Login data:", credentials);

      setSuccessMessage("ניסיון ההתחברות נשלח בהצלחה");
    } catch (err) {
      setError("ההתחברות נכשלה");
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
              name="phoneNumber"
              type="text"
              value={credentials.phoneNumber}
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
      </div>
    </div>
  );
}

export default LoginPage;
