// UserFormDialog.tsx
import * as React from "react";
import {
  Dialog,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface AddUserDialogProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  children: React.ReactNode;
}

export default function UserFormDialog({
  open,
  handleClose,
  onSubmit,
  children,
}: AddUserDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 1,
          maxHeight: "90vh",
        },
      }}
    >
      <form onSubmit={onSubmit}>
        {children}
      </form>
    </Dialog>
  );
}