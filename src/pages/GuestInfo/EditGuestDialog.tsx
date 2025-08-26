import * as React from "react";
import {
  Box,
  Button,
  CardContent,
  Container,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { useForm } from "react-hook-form";
import useApi from "../../hooks/APIHandler";
import { toast } from "react-toastify";
import ImageUpload from "../../components/ImageUpload";
import { useNavigate, useParams } from "react-router-dom";
import { Guest, GuestCreateUpdateData } from "./types"; // Assuming this path is correct
import Appbar from "../../components/Appbar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function EditGuestPage() {
  const { callApi, loading } = useApi();
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialIdCard, setInitialIdCard] = React.useState<
    { url: string; name?: string }[]
  >([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GuestCreateUpdateData>();

  // Fetch guest data and populate the form on component load
  React.useEffect(() => {
    if (!id) return;
    const fetchGuest = async () => {
      try {
        const response = await callApi({
          url: `/guests/${id}/`,
          method: "GET",
        });

        if (response?.status === 200 && response.data) {
          const guestData: Guest = response.data;
          // Set form values from the fetched data
          reset({
            first_name: guestData.user.first_name,
            last_name: guestData.user.last_name,
            phone: guestData.user.phone,
            email: guestData.user.email,
          });

          // Set the initial image URL for the ImageUpload component
          if (guestData.id_card_url) {
            setInitialIdCard([{ url: guestData.id_card_url }]);
          } else {
            setInitialIdCard([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch guest:", error);
        toast.error("Failed to load guest data. Please try again.");
      }
    };
    fetchGuest();
  }, [id, reset]);

  // ImageUpload component now handles new file uploads, we just need the new file's data
  const handleImageUpload = (uploadedImages: any[]) => {
    // The ImageUpload component returns a list of files with URL and File objects
    // We only care about the new file's data for the API call
    const newlyUploaded = uploadedImages.filter(
      (img) => img.file instanceof File
    );
    if (newlyUploaded.length > 0) {
      // Store the newly uploaded file to send with the form data
      reset({
        ...reset,
        id_card: newlyUploaded[0].file,
      });
    } else {
      // If the user removed the image, clear the id_card field
      reset({
        ...reset,
        id_card: null,
      });
    }
  };

  const onSubmit = async (data: GuestCreateUpdateData) => {
    if (!id) return;

    // Create a new FormData object to handle both text and file data
    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);

    if (data.id_card) {
      formData.append("id_card", data.id_card);
    }

    try {
      const response = await callApi({
        url: `/guests/${id}/`,
        method: "PUT",
        body: formData,
        header: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response?.status === 200) {
        toast.success("Guest updated successfully!");
        navigate("/guests");
      }
    } catch (error) {
      console.error("Failed to update guest:", error);
      toast.error("Failed to update guest. Please try again.");
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="Edit Guest" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Container sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <IconButton
                    color="inherit"
                    onClick={() => navigate("/guests")}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Grid>
                <Grid item>
                  <Typography variant="h6">Edit Guest</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={3}>
                {/* Apartment Selection */}
                <Grid item xs={12} sm={6}>
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    size="medium"
                    {...register("last_name", {
                      required: "Last name is required",
                    })}
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
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
                </Grid>
                <Grid item xs={12} sm={6}>
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
                </Grid>
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      ID Card Upload
                    </Typography>
                    <ImageUpload
                      onUpload={handleImageUpload}
                      multiple={false}
                      maxFiles={1}
                      maxFileSize={10}
                      allowedTypes={[
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                        "image/gif",
                      ]}
                      initialFiles={initialIdCard}
                    />
                  </Box>
                </Grid>
              </Grid>
              <DialogActions>
                <Button
                  onClick={() => navigate(-1)}
                  color="inherit"
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? "Updating..." : "Update"}
                </Button>
              </DialogActions>
            </Paper>
          </Container>
        </form>
      </Box>
    </Box>
  );
}
