import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Chip,
  useTheme,
  Toolbar,
  Paper,
  Collapse,
  InputAdornment,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useStepContext,
} from "@mui/material";
import {
  Person,
  Phone,
  ContactMail,
  ExpandMore,
  ExpandLess,
  CalendarMonth,
  Email,
  Search,
  ArrowBack,
  Save,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import useApi from "../../hooks/APIHandler";
import Appbar from "../../components/Appbar";
import ImageUpload from "../../components/ImageUpload";
import { useNavigate, useParams } from "react-router-dom";

interface Apartment {
  id: string;
  name: string;
  number: number;
  inService: boolean;
  price: number;
  property_assigned_name: string;
  property_address: string;
  currency: string;
  cleaned: boolean;
  apartmentType: string;
}

interface User {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

interface Guest {
  id: string;
  idCard?: any;
  user: User;
}

interface Booking {
  id: string;
  apartment: Apartment;
  startDate: string;
  endDate: string;
  guest: Guest;
  status: string;
  totalPrice: number;
}

const renderApartmentType = (type: string) => {
  const colorMap: Record<string, any> = {
    king: "primary",
    luxury: "secondary",
    normal: "info",
    economic: "warning",
  };

  return (
    <Chip
      label={type.charAt(0).toUpperCase() + type.slice(1)}
      color={colorMap[type] || "default"}
      size="small"
      sx={{ ml: 1 }}
    />
  );
};

const getAvailableStatusOptions = (currentStatus: string) => {
  const allStatusOptions = [
    { value: "confirmed", label: "Confirmed" },
    { value: "checked_in", label: "Checked In" },
    { value: "checked_out", label: "Checked Out" },
    { value: "cancelled", label: "Cancelled" },
    { value: "upcoming", label: "Upcoming" },
    { value: "active", label: "Active" },
  ];

  switch (currentStatus) {
    case "checked_in":
      return allStatusOptions.filter(
        (option) => option.value === "checked_out"
      );
    case "checked_out":
      return allStatusOptions.filter(
        (option) => option.value === "checked_out"
      ); // Only show current status
    case "cancelled":
      return allStatusOptions.filter((option) =>
        ["confirmed", "upcoming", "active"].includes(option.value)
      );
    default:
      return allStatusOptions.filter(
        (option) => option.value !== "checked_out"
      );
  }
};

export default function BookingEdit() {
  const theme = useTheme();
  const { callApi } = useApi();
  const { id } = useParams();
  const navigate = useNavigate();

  // Form state
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartment, setSelectedApartment] = useState<string>("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [guestData, setGuestData] = useState<Guest>({
    id: "",
    user: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
    },
    idCard: null,
  });
  const [showGuestDetails, setShowGuestDetails] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isLoadingApartments, setIsLoadingApartments] = useState(true);
  const [isLoadingGuests, setIsLoadingGuests] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestOptions, setGuestOptions] = useState<Guest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGuestSearchDialog, setShowGuestSearchDialog] = useState(false);
  const [isNewGuest, setIsNewGuest] = useState(true);
  const [originalBooking, setOriginalBooking] = useState<Booking | null>(null);
  const [status, setStatus] = useState<string>("");
  const availableStatusOptions = getAvailableStatusOptions(status);

  // Fetch booking details and available apartments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingApartments(true);

        // Fetch booking details
        const bookingResponse = await callApi({
          url: `/apartments/bookings/${id}/`,
          method: "GET",
        });

        if (bookingResponse?.status === 200) {
          const bookingData = bookingResponse.data;
          setOriginalBooking(bookingData);
          setSelectedApartment(bookingData.apartment.id);
          setStartDate(dayjs(bookingData.startDate));
          setEndDate(dayjs(bookingData.endDate));
          setGuestData(bookingData.guest);
          setIsNewGuest(false);
          setStatus(bookingData.status);
        }

        // Fetch available apartments
        const apartmentsResponse = await callApi({
          url: "/apartments/mixed-up/",
          method: "GET",
        });

        if (apartmentsResponse?.status === 200) {
          setApartments(apartmentsResponse.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoadingApartments(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Search for guests
  useEffect(() => {
    if (!showGuestSearchDialog) return;

    const searchGuests = async () => {
      try {
        setIsLoadingGuests(true);
        const response = await callApi({
          url: `/guests/search?q=${searchQuery}`,
          method: "GET",
        });
        if (response?.status === 200) {
          setGuestOptions(response.data);
        }
      } catch (err) {
        console.error("Error searching guests:", err);
      } finally {
        setIsLoadingGuests(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        searchGuests();
      } else {
        setGuestOptions([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, showGuestSearchDialog]);

  // Calculate booking details
  const calculateBookingDetails = () => {
    if (!startDate || !endDate || !selectedApartment) return null;

    const apartment = apartments.find((a) => a.id === selectedApartment);
    if (!apartment) return null;

    const durationHours = endDate.diff(startDate, "hour");
    const durationDays = Math.ceil(durationHours / 24);
    const totalPrice = durationDays * apartment.price;

    return {
      durationHours,
      durationDays,
      totalPrice,
      apartment,
    };
  };

  const bookingDetails = calculateBookingDetails();

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!selectedApartment) errors.apartment = "Apartment is required";
    if (!startDate) errors.startDate = "Start date is required";
    if (!endDate) errors.endDate = "End date is required";
    if (startDate && endDate && startDate.isAfter(endDate)) {
      errors.dateRange = "End date must be after start date";
    }
    // if (startDate && startDate.isBefore(dayjs())) {
    //   errors.startDate = "Start date cannot be in the past";
    // }
    if (!guestData.user.first_name)
      errors.first_name = "First name is required";
    if (!guestData.user.last_name) errors.last_name = "Last name is required";
    if (!guestData.user.phone) errors.phone = "Phone number is required";
    if (!guestData.user.email) errors.email = "Email address is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUpload = (uploadedImages: any) => {
    if (uploadedImages && uploadedImages.length > 0) {
      setGuestData((prev) => ({
        ...prev,
        idCard: uploadedImages[0],
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    if (!validateForm()) return;
    if (!guestData.idCard && isNewGuest) {
      return toast.error("ID card is required for new guests");
    }

    try {
      const bookingData = {
        apartment: selectedApartment,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        first_name: guestData.user.first_name,
        last_name: guestData.user.last_name,
        phone: guestData.user.phone,
        email: guestData.user.email,
        idCard: guestData.idCard,
        guest_id: !isNewGuest ? guestData.id : undefined,
        status: status,
      };

      const response = await callApi({
        url: `/apartments/bookings/${id}/`,
        method: "PUT",
        body: bookingData,
      });

      if (response?.status === 200) {
        toast.success("Booking updated successfully!");
        navigate("/bookings");
      }
    } catch (err) {
      console.error("Error updating booking:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGuest = (guest: Guest) => {
    setGuestData({
      id: guest.id,
      user: {
        first_name: guest.user.first_name,
        last_name: guest.user.last_name,
        phone: guest.user.phone,
        email: guest.user.email,
      },
      idCard: guest.idCard || null,
    });
    setIsNewGuest(false);
    setShowGuestSearchDialog(false);
    setSearchQuery("");
  };

  const handleNewGuest = () => {
    setGuestData({
      id: "",
      user: {
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
      },
      idCard: null,
    });
    setIsNewGuest(true);
    setShowGuestSearchDialog(false);
    setSearchQuery("");
  };

  const getFullName = (user: User) => {
    return `${user.first_name} ${user.last_name}`;
  };

  const hasChanges = () => {
    if (!originalBooking) return false;

    return (
      selectedApartment !== originalBooking.apartment.id ||
      !startDate?.isSame(dayjs(originalBooking.startDate)) ||
      !endDate?.isSame(dayjs(originalBooking.endDate)) ||
      guestData.user.first_name !== originalBooking.guest.user.first_name ||
      guestData.user.last_name !== originalBooking.guest.user.last_name ||
      guestData.user.phone !== originalBooking.guest.user.phone ||
      guestData.user.email !== originalBooking.guest.user.email ||
      guestData.idCard !== originalBooking.guest.idCard ||
      status !== originalBooking.status
    );
  };

  if (isLoadingApartments) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="Edit Booking" />
      <Box
        component="main"
        sx={{
          backgroundColor: theme.palette.background.default,
          flexGrow: 1,
          overflow: "auto",
        }}
      >
        <Toolbar />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* Header Section */}
            <Box
              sx={{
                mb: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Edit Booking #{id}
                </Typography>
                <Typography color="text.secondary">
                  Update booking details and guest information
                </Typography>
              </Box>
              <Button
                onClick={() => navigate(-1)}
                color="inherit"
                variant="outlined"
              >
                Cancel
              </Button>
            </Box>

            {/* Main Form Card */}
            <Card elevation={2}>
              <CardHeader
                title="Booking Details"
                sx={{
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  py: 1.5,
                }}
              />
              <CardContent>
                <Grid container spacing={3}>
                  {/* Apartment Selection */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!validationErrors.apartment}>
                      <InputLabel id="apartment-select-label">
                        Apartment
                      </InputLabel>
                      <Select
                        labelId="apartment-select-label"
                        id="apartment-select"
                        value={selectedApartment}
                        label="Apartment"
                        onChange={(e) => setSelectedApartment(e.target.value)}
                        disabled={isLoadingApartments}
                        startAdornment={
                          selectedApartment && (
                            <Chip
                              label="Available"
                              color={
                                apartments.find(
                                  (a) => a.id === selectedApartment
                                )?.inService === false
                                  ? "success"
                                  : "error"
                              }
                              size="small"
                              sx={{ mr: 1 }}
                            />
                          )
                        }
                      >
                        {isLoadingApartments ? (
                          <MenuItem disabled>
                            <CircularProgress size={24} />
                            Loading apartments...
                          </MenuItem>
                        ) : (
                          apartments.map((apartment) => (
                            <MenuItem key={apartment.id} value={apartment.id}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  alignItems: "center",
                                }}
                              >
                                <Box>
                                  <Typography
                                    fontWeight="bold"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {apartment.number} - {apartment.name}
                                    {renderApartmentType(
                                      apartment.apartmentType
                                    )}{" "}
                                    {/* Render the type chip here */}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {apartment.property_assigned_name}-
                                    {apartment.property_address}
                                  </Typography>
                                </Box>
                                <Typography>
                                  {apartment.currency}
                                  {apartment.price}/night
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {validationErrors.apartment && (
                        <Typography variant="caption" color="error">
                          {validationErrors.apartment}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={status}
                        label="Status"
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={status === "checked_out"} // Disable if checked out
                      >
                        {availableStatusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Date Time Pickers */}
                  <Grid item xs={12} md={6}>
                    <DateTimePicker
                      label="Start Date & Time"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      //   minDateTime={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!validationErrors.startDate,
                          helperText: validationErrors.startDate,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DateTimePicker
                      label="End Date & Time"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      minDateTime={startDate || dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error:
                            !!validationErrors.endDate ||
                            !!validationErrors.dateRange,
                          helperText:
                            validationErrors.endDate ||
                            validationErrors.dateRange,
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Guest Details Section */}
                <Box sx={{ mt: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="text"
                      startIcon={
                        showGuestDetails ? <ExpandLess /> : <ExpandMore />
                      }
                      endIcon={<Person />}
                      onClick={() => setShowGuestDetails(!showGuestDetails)}
                      sx={{ mb: 1 }}
                    >
                      Guest Details
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Search />}
                      onClick={() => setShowGuestSearchDialog(true)}
                      sx={{ mb: 1 }}
                    >
                      {isNewGuest ? "Find Existing Guest" : "Change Guest"}
                    </Button>
                  </Box>

                  <Collapse in={showGuestDetails}>
                    <Paper
                      elevation={0}
                      sx={{ p: 3, backgroundColor: theme.palette.grey[50] }}
                    >
                      {!isNewGuest && (
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          gutterBottom
                        >
                          Using existing guest profile
                        </Typography>
                      )}
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="First Name"
                            value={guestData.user.first_name}
                            onChange={(e) =>
                              setGuestData({
                                ...guestData,
                                user: {
                                  ...guestData.user,
                                  first_name: e.target.value,
                                },
                              })
                            }
                            error={!!validationErrors.first_name}
                            helperText={validationErrors.first_name}
                            InputProps={{
                              startAdornment: (
                                <ContactMail color="action" sx={{ mr: 1 }} />
                              ),
                            }}
                            disabled={!isNewGuest}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Last Name"
                            value={guestData.user.last_name}
                            onChange={(e) =>
                              setGuestData({
                                ...guestData,
                                user: {
                                  ...guestData.user,
                                  last_name: e.target.value,
                                },
                              })
                            }
                            error={!!validationErrors.last_name}
                            helperText={validationErrors.last_name}
                            disabled={!isNewGuest}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Phone Number"
                            value={guestData.user.phone}
                            onChange={(e) =>
                              setGuestData({
                                ...guestData,
                                user: {
                                  ...guestData.user,
                                  phone: e.target.value,
                                },
                              })
                            }
                            error={!!validationErrors.phone}
                            helperText={validationErrors.phone}
                            InputProps={{
                              startAdornment: (
                                <Phone color="action" sx={{ mr: 1 }} />
                              ),
                            }}
                            disabled={!isNewGuest}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Email Address"
                            fullWidth
                            variant="outlined"
                            type="email"
                            value={guestData.user.email}
                            placeholder="ex: test@test.com"
                            onChange={(e) =>
                              setGuestData({
                                ...guestData,
                                user: {
                                  ...guestData.user,
                                  email: e.target.value,
                                },
                              })
                            }
                            error={!!validationErrors.email}
                            helperText={validationErrors.email}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email fontSize="small" color="action" />
                                </InputAdornment>
                              ),
                            }}
                            disabled={!isNewGuest}
                          />
                        </Grid>
                        {/* {isNewGuest && ( */}
                        <Grid item xs={12}>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              ID Card Upload
                            </Typography>
                            <ImageUpload
                              onUpload={handleImageUpload}
                              multiple={true}
                              maxFiles={1}
                              maxFileSize={10}
                              allowedTypes={[
                                "image/jpeg",
                                "image/png",
                                "image/webp",
                                "image/gif",
                              ]}
                              initialFiles={
                                guestData.idCard ? [guestData.idCard] : []
                              }
                            />
                          </Box>
                        </Grid>
                        {/* )} */}
                      </Grid>
                    </Paper>
                  </Collapse>
                </Box>

                {/* Action Buttons */}
                <Box
                  sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}
                >
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => navigate("/bookings")}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={!hasChanges()}
                      startIcon={
                        loading ? <CircularProgress size={20} /> : <Save />
                      }
                    >
                      {loading ? "Updating..." : "Update Booking"}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            {/* Guest Search Dialog */}
            <Dialog
              open={showGuestSearchDialog}
              onClose={() => setShowGuestSearchDialog(false)}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>Find Existing Guest</DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <Autocomplete
                    options={guestOptions}
                    getOptionLabel={(option) =>
                      `${getFullName(option.user)} (${option.user.email})`
                    }
                    loading={isLoadingGuests}
                    onInputChange={(_, value) => setSearchQuery(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search by name, email, or phone"
                        variant="outlined"
                        fullWidth
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <Search sx={{ mr: 1, color: "action.active" }} />
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box>
                          <Typography>{getFullName(option.user)}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.user.email} • {option.user.phone}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    onChange={(_, value) => {
                      if (value) {
                        handleSelectGuest(value);
                      }
                    }}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowGuestSearchDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleNewGuest} color="primary">
                  New Guest
                </Button>
              </DialogActions>
            </Dialog>

            {/* Summary Card */}
            {bookingDetails && (
              <Card elevation={2} sx={{ mt: 3 }}>
                <CardHeader
                  title="Booking Summary"
                  avatar={<CalendarMonth />}
                  sx={{
                    backgroundColor: theme.palette.info.light,
                    color: theme.palette.info.contrastText,
                    py: 1.5,
                  }}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Apartment:</strong>{" "}
                        {bookingDetails.apartment.number} -{" "}
                        {bookingDetails.apartment.name}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Property:</strong>{" "}
                        {bookingDetails.apartment.property_assigned_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Check-in:</strong>{" "}
                        {startDate?.format("MMM D, YYYY h:mm A")}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Check-out:</strong>{" "}
                        {endDate?.format("MMM D, YYYY h:mm A")}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Duration:</strong>{" "}
                        {bookingDetails.durationHours} hours (
                        {bookingDetails.durationDays} nights)
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Total Price:</strong>
                        <Chip
                          label={`${
                            bookingDetails.apartment.currency
                          }${bookingDetails.totalPrice.toFixed(2)}`}
                          color="primary"
                          variant="outlined"
                          size="medium"
                          sx={{ ml: 1, fontWeight: "bold" }}
                        />
                      </Typography>
                    </Grid>
                    {guestData.user.first_name && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle1">
                          <strong>Guest:</strong> {getFullName(guestData.user)}
                          {!isNewGuest && (
                            <Chip
                              label="Existing Guest"
                              color="info"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Container>
        </LocalizationProvider>
      </Box>
    </Box>
  );
}
