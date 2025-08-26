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
} from '@mui/material';
import { Close, Circle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PropertyItem {
  id?: string | number;
  name: string;
  [key: string]: any; // Allow additional properties
}

interface PropertyDialogProps {
  open: boolean;
  handleClose: () => void;
  modalTitle: string | ReactNode;
  jsonData: PropertyItem[];
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  enableAnimations?: boolean;
}

export const PropertyDialog = ({
  open,
  handleClose,
  modalTitle,
  jsonData,
  maxWidth = 'sm',
  enableAnimations = true,
}: PropertyDialogProps) => {
  const theme = useTheme();

  // Animation variants
  const dialogVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth={maxWidth}
      onClose={handleClose}
      aria-labelledby="property-details-dialog"
      PaperProps={{
        component: enableAnimations ? motion.div : 'div',
        ...(enableAnimations && {
          initial: 'hidden',
          animate: 'visible',
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
          pb: 1,
        }}
      >
        <Typography variant="body1" fontWeight="600" component="div">
          {modalTitle}
        </Typography>
        <IconButton
          onClick={handleClose}
          aria-label="close"
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.text.primary,
            },
          }}
        >
          <Close />
        </IconButton>
      </Box>

      <Divider sx={{ mx: 3 }} />

      <DialogContent sx={{ p: 0 }}>
        <List sx={{ py: 0 }}>
          {jsonData.map((item, index) => {
            const MotionListItem = enableAnimations ? motion(ListItem) : ListItem;
            
            return (
              <Box
                key={item.id || index}
                component={enableAnimations ? motion.div : 'div'}
                {...(enableAnimations && {
                  initial: 'hidden',
                  animate: 'visible',
                  variants: itemVariants,
                  transition: { delay: index * 0.05 },
                })}
              >
                <MotionListItem
                  sx={{
                    px: 3,
                    py: 2,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, mr: 2 }}>
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: theme.palette.primary.main,
                      }}
                    >
                      <Circle sx={{ fontSize: '14px', color: 'white' }} />
                    </Avatar>
                  </ListItemIcon>
                  <Typography variant="body1" fontWeight="500">
                    {item.name} - {item.address}
                  </Typography>
                </MotionListItem>
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