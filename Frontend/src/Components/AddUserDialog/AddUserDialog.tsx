import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import UserModel from "../../Models/UserModel";

type AddUserDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (user: UserModel) => Promise<void>;
};

function AddUserDialog(props: AddUserDialogProps): JSX.Element {
  const [user, setUser] = useState<UserModel>(new UserModel());

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(): Promise<void> {
    await props.onSave(user);
    setUser(new UserModel());
  }

  function handleClose(): void {
    setUser(new UserModel());
    props.onClose();
  }

  return (
    <Dialog open={props.open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>הוספת משתמש חדש</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="מספר אישי"
          name="personalNumber"
          value={user.personalNumber}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="dense"
          label="שם מלא"
          name="fullName"
          value={user.fullName}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="dense"
          label="טלפון"
          name="phone"
          value={user.phone}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="dense"
          label="יחידה"
          name="unit"
          value={user.unit}
          onChange={handleChange}
        />

        <TextField
          select
          fullWidth
          margin="dense"
          label="סוג משתמש"
          name="role"
          value={user.role}
          onChange={handleChange}
        >
          <MenuItem value="regular">משתמש רגיל</MenuItem>
          <MenuItem value="mashkash">משקש</MenuItem>
          <MenuItem value="admin">מנהל</MenuItem>
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>ביטול</Button>
        <Button variant="contained" onClick={handleSave}>
          שמירה
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddUserDialog;