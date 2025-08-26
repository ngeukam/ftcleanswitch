// UserFormActions.tsx
import * as React from "react";
import {
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";

interface UserFormActionsProps {
  handleClose: () => void;
  loading: boolean;
}

export default function UserFormActions({
  handleClose,
  loading,
}: UserFormActionsProps) {
  return (
    <DialogActions sx={{ p: 3, borderTop: 1, borderColor: "divider" }}>
      <Button
        variant="outlined"
        onClick={handleClose}
        sx={{
          borderRadius: 1,
          px: 3,
          py: 1,
          textTransform: "none",
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
          },
        }}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{
          borderRadius: 1,
          px: 3,
          py: 1,
          textTransform: "none",
          fontWeight: 600,
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Create User"
        )}
      </Button>
    </DialogActions>
  );
}