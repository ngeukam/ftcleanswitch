import {
  Dialog,
  DialogContent,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  Avatar,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
import { Close, Circle } from "@mui/icons-material";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TaskItem {
  [key: string]: any; // Allow additional properties
}

interface TaskDialogProps {
  open: boolean;
  handleClose: () => void;
  modalTitle: string | ReactNode;
  jsonData: TaskItem[];
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  enableAnimations?: boolean;
}

export const TaskDialog = ({
  open,
  handleClose,
  modalTitle,
  jsonData,
  maxWidth = "sm",
  enableAnimations = true,
}: TaskDialogProps) => {
  const theme = useTheme();

  const dialogVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  // Check if data is array of strings (like assigned_to_names)
  const isStringArray =
    Array.isArray(jsonData) &&
    jsonData.every((item) => typeof item === "string");

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth={maxWidth}
      onClose={handleClose}
      PaperProps={{
        component: enableAnimations ? motion.div : "div",
        ...(enableAnimations && {
          initial: "hidden",
          animate: "visible",
          variants: dialogVariants,
          transition: { duration: 0.3 },
        }),
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10],
          background: theme.palette.background.paper,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 3,
          pb: 1,
        }}
      >
        <Typography variant="body1" fontWeight="600" component="div">
          {modalTitle}
        </Typography>
        <IconButton onClick={handleClose} aria-label="close">
          <Close />
        </IconButton>
      </Box>
      <Divider sx={{ mx: 3 }} />
      <DialogContent sx={{ p: 0 }}>
        <List sx={{ py: 0 }}>
          {isStringArray
            ? // Render simple string array
              jsonData.map((name, index) => (
                <Box
                  key={index}
                  component={enableAnimations ? motion.div : "div"}
                  {...(enableAnimations && {
                    initial: "hidden",
                    animate: "visible",
                    variants: itemVariants,
                    transition: { delay: index * 0.05 },
                  })}
                >
                  <ListItem sx={{ px: 3, py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 32, mr: 2 }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: theme.palette.primary.main,
                        }}
                      >
                        <Circle sx={{ fontSize: "14px", color: "white" }} />
                      </Avatar>
                    </ListItemIcon>
                    <Typography variant="body1">
                      {typeof name === "string" ? name : JSON.stringify(name)}
                    </Typography>
                  </ListItem>
                  {index < jsonData.length - 1 && (
                    <Divider sx={{ mx: 3 }} variant="inset" />
                  )}
                </Box>
              ))
            : // Render object array
              jsonData.map((item, index) => {
                const displayText = item.department
                  ? `${item.first_name} ${item.last_name} (${item.department})`
                  : JSON.stringify(item);

                return (
                  <Box
                    key={item.id || index}
                    component={enableAnimations ? motion.div : "div"}
                    {...(enableAnimations && {
                      initial: "hidden",
                      animate: "visible",
                      variants: itemVariants,
                      transition: { delay: index * 0.05 },
                    })}
                  >
                    <ListItem sx={{ px: 3, py: 2 }}>
                      <ListItemIcon sx={{ minWidth: 32, mr: 2 }}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: theme.palette.primary.main,
                          }}
                        >
                          <Circle sx={{ fontSize: "14px", color: "white" }} />
                        </Avatar>
                      </ListItemIcon>
                      <Typography variant="body1">{displayText}</Typography>
                    </ListItem>
                    {index < jsonData.length - 1 && (
                      <Divider sx={{ mx: 3 }} variant="inset" />
                    )}
                  </Box>
                );
              })}
        </List>
      </DialogContent>
    </Dialog>
  );
};
