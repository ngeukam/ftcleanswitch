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
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import AddIcon from "@mui/icons-material/Add";
import SearchInput from "../../components/SearchInput";
import { useForm } from "react-hook-form";
import useApi from "../../hooks/APIHandler";
import { toast } from "react-toastify";
import ImageUpload from "../../components/ImageUpload";
import { currencyData } from "../../constant";
import { getUser } from "../../utils/Helper";

type FormValues = {
  number: number;
  name: string;
  property_assigned: number | null;
  capacity: number | null;
  numberOfBeds: number | null;
  apartmentType: string;
  inService: boolean;
  cleaned: boolean;
  price: number | null;
  currency: string;
  image: any;
  is_active: boolean;
};

interface AddApartmentDialogProps {
  properties: any[];
  apartments: any[];
  setApartments: React.Dispatch<React.SetStateAction<any[]>>;
  handleChange: () => void;
  searchQuery: string;
  searchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddApartmentDialog({
  properties,
  apartments,
  setApartments,
  handleChange,
  searchQuery,
  searchChange,
}: AddApartmentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { callApi, loading } = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      inService: false,
      cleaned: true,
      is_active: true,
    },
  });

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleImageUpload = (uploadedImages: any) => {
    setValue("image", uploadedImages);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await callApi({
        url: "/apartments/",
        method: "POST",
        body: data,
      });

      if (response?.status === 201) {
        setApartments([...apartments, response.data]);
        handleChange();
        toast.success("Apartment added successfully!");
        handleClose();
      }
    } catch (error) {
      toast.error("Failed to add apartment");
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
        {getUser()?.role != "receptionist" && (
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
            Add Apartment
          </Button>
        )}
      </Stack>

      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Add New Apartment</DialogTitle>

          <DialogContent dividers sx={{ py: 2, px: 3 }}>
            {/* Apartment Number */}
            <TextField
              margin="dense"
              id="number"
              label="Apartment Number"
              fullWidth
              variant="outlined"
              type="number"
              sx={{ mb: 2 }}
              {...register("number", {
                required: "Apartment number is required",
                valueAsNumber: true,
                // validate: (value) => {
                //   if (apartments.some(apt => apt.number === value)) {
                //     return "Apartment number already exists";
                //   }
                //   return true;
                // },
              })}
              error={!!errors.number}
              helperText={errors.number?.message}
            />

            {/* Apartment Name */}
            <TextField
              margin="dense"
              id="name"
              label="Apartment Name (Optional)"
              fullWidth
              variant="outlined"
              type="text"
              sx={{ mb: 2 }}
              {...register("name")}
            />

            {/* Property Assignment */}
            <TextField
              select
              margin="dense"
              id="property_assigned"
              label="Assigned Property"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              {...register("property_assigned", {
                valueAsNumber: true,
              })}
            >
              {/* <MenuItem value={null}>None</MenuItem> */}
              {properties?.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name} - {property.address}
                </MenuItem>
              ))}
            </TextField>

            {/* Apartment Type */}
            <TextField
              select
              margin="dense"
              id="apartmentType"
              label="Apartment Type"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              {...register("apartmentType", {
                required: "Apartment type is required",
              })}
              error={!!errors.apartmentType}
              helperText={errors.apartmentType?.message}
            >
              <MenuItem value="king">King</MenuItem>
              <MenuItem value="luxury">Luxury</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="economic">Economic</MenuItem>
            </TextField>

            {/* Capacity and Beds */}
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                margin="dense"
                id="capacity"
                label="Capacity"
                fullWidth
                variant="outlined"
                type="number"
                {...register("capacity", {
                  valueAsNumber: true,
                })}
                sx={{ flex: 1 }}
              />

              <TextField
                margin="dense"
                id="numberOfBeds"
                label="Number of Beds"
                fullWidth
                variant="outlined"
                type="number"
                {...register("numberOfBeds", {
                  valueAsNumber: true,
                })}
                sx={{ flex: 1 }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                select
                margin="dense"
                id="currency"
                label="Currency"
                fullWidth
                variant="outlined"
                defaultValue="EUR"
                sx={{ flex: 1 }}
                {...register("currency", {
                  required: "Currency is required",
                })}
                error={!!errors.currency}
                helperText={errors.currency?.message}
              >
                {currencyData.map((currency) => (
                  <MenuItem key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </MenuItem>
                ))}
              </TextField>

              {/* Price */}
              <TextField
                margin="dense"
                id="price"
                label="Price"
                fullWidth
                variant="outlined"
                type="number"
                sx={{ flex: 1 }}
                {...register("price", {
                  valueAsNumber: true,
                })}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1 }}>
                      {watch("currency") ? watch("currency") : "€"}
                    </Box>
                  ),
                }}
              />
            </Box>

            {/* Status Checkboxes */}
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    {...register("inService")}
                    checked={watch("inService")}
                    onChange={(e) => setValue("inService", e.target.checked)}
                  />
                }
                label="In Service"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    {...register("cleaned")}
                    checked={watch("cleaned")}
                    onChange={(e) => setValue("cleaned", e.target.checked)}
                  />
                }
                label="Cleaned"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    {...register("is_active")}
                    checked={watch("is_active")}
                    onChange={(e) => setValue("is_active", e.target.checked)}
                  />
                }
                label="Active"
              />
            </Box>

            {/* Image Upload */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Apartment Images
              </Typography>
              <ImageUpload
                onUpload={handleImageUpload}
                multiple={true}
                maxFiles={10}
                maxFileSize={10} // 10MB
                allowedTypes={[
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                  "image/gif",
                ]}
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
      </Dialog>
    </div>
  );
}
