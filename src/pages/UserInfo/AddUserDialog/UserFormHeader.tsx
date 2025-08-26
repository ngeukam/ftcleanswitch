// UserFormHeader.tsx
import * as React from "react";
import {
  DialogTitle,
  Stack,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

interface UserFormHeaderProps {
  title: string;
}

export default function UserFormHeader({ title }: UserFormHeaderProps) {
  return (
    <DialogTitle
      sx={{
        bgcolor: "primary.main",
        color: "primary.contrastText",
        py: 2,
        px: 3,
        fontWeight: 600,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <PersonAddIcon />
        <span>{title}</span>
      </Stack>
    </DialogTitle>
  );
}