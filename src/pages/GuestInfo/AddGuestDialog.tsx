import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Slide,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import SearchInput from "../../components/SearchInput";
import { useForm } from "react-hook-form";
import useApi from "../../hooks/APIHandler";
import { toast } from "react-toastify";
import { GuestCreateUpdateData } from "./types";
import ImageUpload from "../../components/ImageUpload";
import { Refresh } from "@mui/icons-material";

interface AddGuestDialogProps {
  handleChange: () => void;
  searchQuery: string;
  searchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hideButtonAdd?: boolean;
  handleRefresh?: () => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddGuestDialog({
  handleChange,
  searchQuery,
  searchChange,
  hideButtonAdd,
  handleRefresh,
}: AddGuestDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { callApi, loading } = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GuestCreateUpdateData>();

  const handleClickOpen = () => setOpen(true);
  const [idCardFile, setIdCardFile] = React.useState<File | null>(null);
  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleImageUpload = (uploadedImages: File[]) => {
    if (uploadedImages && uploadedImages.length > 0) {
      setIdCardFile(uploadedImages[0]);
    }
  };

  const onSubmit = async (data: GuestCreateUpdateData) => {
    if (idCardFile) {
      data.id_card = idCardFile;
    }
    const response = await callApi({
      url: "/guests/create/",
      method: "POST",
      body: data,
    });

    if (response?.status === 201) {
      handleChange();
      toast.success("Guest added successfully!");
      handleClose();
    }
  };

  return (
    <div>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <SearchInput value={searchQuery} handleChange={searchChange} />
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => handleRefresh}
            sx={{ mr: 2, borderRadius: 1, textTransform: "none", }}
          >
            Refresh
          </Button>
          {!hideButtonAdd && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleClickOpen}
              sx={{
                borderRadius: 1,
                textTransform: "none",
                px: 3,
                py: 1,
                fontWeight: 600,
              }}
            >
              Add Guest
            </Button>
          )}
        </Box>
      </Stack>

      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        maxWidth="xs"
        fullWidth
        sx={{ height: "100%" }}
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ overflow: "visible" }}>
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
              <span>Add New Guest</span>
            </Stack>
          </DialogTitle>

          <DialogContent dividers sx={{ py: 2, px: 3 }}>
            <TextField
              label="First Name"
              fullWidth
              margin="normal"
              variant="outlined"
              size="medium"
              {...register("first_name", {
                required: "First name is required",
              })}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Last Name"
              fullWidth
              margin="normal"
              variant="outlined"
              size="medium"
              {...register("last_name", {
                required: "Last name is required",
              })}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Phone Number"
              fullWidth
              margin="normal"
              variant="outlined"
              size="medium"
              type="tel"
              placeholder="0 123456789"
              {...register("phone", {
                required: "Phone number is required",
              })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Email Address"
              fullWidth
              margin="normal"
              variant="outlined"
              size="medium"
              type="email"
              placeholder="ex: test@test.com"
              {...register("email", {
                required: "Email is required",
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Grid item xs={12}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  ID Card Upload
                </Typography>
                <ImageUpload
                  onUpload={() => handleImageUpload}
                  multiple={true}
                  maxFiles={1}
                  maxFileSize={10}
                  allowedTypes={[
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif",
                  ]}
                />
              </Box>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
