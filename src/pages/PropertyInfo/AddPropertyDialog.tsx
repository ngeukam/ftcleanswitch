import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import AddIcon from "@mui/icons-material/Add";
import SearchInput from "../../components/SearchInput";
import { useForm } from "react-hook-form";
import useApi from "../../hooks/APIHandler";
import { toast } from "react-toastify";
import LocationAutocomplete from "../../components/LocationAutocomplete";
import GoogleMapsProvider from "../../provider/googleMapProvider";
import { Refresh } from "@mui/icons-material";

type FormValues = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
};

interface AddPropertyDialogProps {
  handleChange: () => void;
  searchQuery: string;
  searchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

export default function AddPropertyDialog({
  handleChange,
  searchQuery,
  searchChange,
  handleRefresh,
}: AddPropertyDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { callApi, loading } = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>();

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleLocationSelect = (locationData: {
    address: string;
    latitude: number;
    longitude: number;
    distance: number;
  }) => {
    setValue("address", locationData.address);
    setValue("latitude", locationData.latitude);
    setValue("longitude", locationData.longitude);
    setValue("distance", locationData.distance);
  };

  const onSubmit = async (data: FormValues) => {
    console.log("data", data);
    const response = await callApi({
      url: "/properties/",
      method: "POST",
      body: data,
    });

    if (response?.status === 201) {
      handleChange();
      toast.success("Property added successfully!");
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
            sx={{ mr: 2, borderRadius: 1, textTransform: "none" }}
          >
            Refresh
          </Button>
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
            Add Property
          </Button>
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
        <GoogleMapsProvider>
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ overflow: "visible" }}
          >
            <DialogTitle>Add Property</DialogTitle>

            <DialogContent dividers sx={{ py: 2, px: 3 }}>
              {/* Property Name */}
              <TextField
                margin="dense"
                id="name"
                label="Property Name"
                fullWidth
                variant="outlined"
                type="text"
                sx={{ mb: 2 }}
                {...register("name", { required: "Name is required" })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />

              {/* Address with Autocomplete */}
              <Box sx={{ mb: 2 }}>
                <LocationAutocomplete
                  onSelect={handleLocationSelect}
                  label="Property Address"
                  defaultValue={watch("address") || ""}
                />
                {errors.address && (
                  <Typography
                    color="error"
                    variant="caption"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    {errors.address.message}
                  </Typography>
                )}
              </Box>

              {/* Distance Input */}
              <TextField
                margin="dense"
                id="distance"
                label="Min distance Clock In/Out (Meters)"
                fullWidth
                variant="outlined"
                type="number"
                sx={{ mb: 2 }}
                {...register("distance", {
                  required: "Min distance is required",
                  valueAsNumber: true,
                })}
                error={!!errors.distance}
                InputLabelProps={{ shrink: true }}
                helperText={errors.distance?.message}
              />

              {/* Latitude/Longitude Group */}
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  margin="dense"
                  id="latitude"
                  label="Latitude"
                  fullWidth
                  variant="outlined"
                  type="number"
                  {...register("latitude", {
                    required: "Latitude is required",
                    valueAsNumber: true,
                  })}
                  error={!!errors.latitude}
                  InputLabelProps={{ shrink: true }}
                  helperText={errors.latitude?.message}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ flex: 1 }}
                />

                <TextField
                  margin="dense"
                  id="longitude"
                  label="Longitude"
                  fullWidth
                  variant="outlined"
                  type="number"
                  {...register("longitude", {
                    required: "Longitude is required",
                    valueAsNumber: true,
                  })}
                  error={!!errors.longitude}
                  InputLabelProps={{ shrink: true }}
                  helperText={errors.longitude?.message}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ flex: 1 }}
                />
              </Box>
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
        </GoogleMapsProvider>
      </Dialog>
    </div>
  );
}
