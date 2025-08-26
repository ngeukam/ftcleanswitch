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
  Chip,
  useTheme,
  Toolbar,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  Edit,
  Delete,
  Person,
  Phone,
  Email,
  CalendarMonth,
  ArrowBack,
  CheckCircle,
  Cancel,
  Timer,
} from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import useApi from "../../hooks/APIHandler";
import Appbar from "../../components/Appbar";
import { useNavigate, useParams } from "react-router-dom";
import DeleteConfirmationDialog from "../../components/DeleteConfirmationDialog";
import ErrorPage from "../../components/ErrorPage";

interface Apartment {
  id: string;
  name: string;
  number: number;
  price: number;
  property_assigned_name: string;
  property_address: string;
  currency: string;
  cleaned: boolean;
  apartmentType:string;
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
  dateOfReservation: string;
  updatedAt: string;
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
export default function BookingDetails() {
  const theme = useTheme();
  const { callApi, loading, error } = useApi();
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoadingBooking(true);
        const response = await callApi({
          url: `/apartments/bookings/${id}/`,
          method: "GET",
        });
        if (response?.status === 200) {
          setBooking(response.data);
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
      } finally {
        setLoadingBooking(false);
      }
    };

    if (id) {
      fetchBooking();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await callApi({
        url: `/apartments/bookings/${id}/`,
        method: "DELETE",
      });

      if (response?.status === 204) {
        toast.success("Booking deleted successfully!");
        navigate("/bookings");
      }
    } catch (err) {
      console.error("Error deleting booking:", err);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    console.log("color", status);
    switch (status) {
      case "confirmed":
        return "primary";
      case "checked_in":
        return "success";
      case "checked_out":
        return "error";
      case "cancelled":
        return "error";
      case "upcoming":
        return "warning";
      case "active":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    console.log("first status", status);
    switch (status) {
      case "confirmed":
        return <CheckCircle />;
      case "checked_in":
        return <CheckCircle />;
      case "checked_out":
        return <CheckCircle />;
      case "cancelled":
        return <Cancel />;
      case "upcoming":
        return <Timer />;
      case "active":
        return <CheckCircle />;
      default:
        return <CheckCircle />;
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM D, YYYY h:mm A");
  };

  if (loadingBooking) {
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

  if (!booking) {
    return (
      <ErrorPage/>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="Booking Details" />
      <Box
        component="main"
        sx={{
          backgroundColor: theme.palette.background.default,
          flexGrow: 1,
          overflow: "auto",
        }}
      >
        <Toolbar />
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
                Booking #{booking.id}
              </Typography>
              <Typography color="text.secondary">
                Created on {formatDate(booking.dateOfReservation)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => navigate(`/bookings/edit/${booking.id}`)}
              >
                Edit Booking
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </Stack>
          </Box>

          <Grid container spacing={3}>
            {/* Booking Details Card */}
            <Grid item xs={12} md={8}>
              <Card elevation={2}>
                <CardHeader
                  title="Booking Information"
                  sx={{
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    py: 1.5,
                  }}
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Status
                      </Typography>
                      <Chip
                        icon={getStatusIcon(booking.status)}
                        label={booking.status.replace("_", " ").toUpperCase()}
                        color={getStatusColor(booking.status)}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Total Price
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {booking.apartment.currency}
                        {booking.totalPrice}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Check-in Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(booking.startDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Check-out Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(booking.endDate)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Duration
                      </Typography>
                      <Typography variant="body1">
                        {dayjs(booking.endDate).diff(
                          dayjs(booking.startDate),
                          "hour"
                        )}{" "}
                        hours (
                        {Math.ceil(
                          dayjs(booking.endDate).diff(
                            dayjs(booking.startDate),
                            "hour"
                          ) / 24
                        )}{" "}
                        nights)
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Apartment Details Card */}
              <Card elevation={2} sx={{ mt: 3 }}>
                <CardHeader
                  title="Apartment Details"
                  sx={{
                    backgroundColor: theme.palette.info.light,
                    color: theme.palette.info.contrastText,
                    py: 1.5,
                  }}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Apartment Number
                      </Typography>
                      <Typography variant="body1">
                        {booking.apartment.number}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Apartment Name
                      </Typography>
                      <Typography variant="body1">
                        {booking.apartment.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Property
                      </Typography>
                      <Typography variant="body1">
                        {booking.apartment.property_assigned_name}-{booking.apartment.property_address}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Price per Night
                      </Typography>
                      <Typography variant="body1">
                        {booking.apartment.currency}
                        {booking.apartment.price}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Apartment Type
                      </Typography>
                      <Typography variant="body1">
                        {renderApartmentType(booking.apartment.apartmentType)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Guest Details Card */}
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardHeader
                  title="Guest Information"
                  avatar={<Person />}
                  sx={{
                    backgroundColor: theme.palette.success.light,
                    color: theme.palette.success.contrastText,
                    py: 1.5,
                  }}
                />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Full Name
                    </Typography>
                    <Typography variant="body1">
                      {booking.guest?.user.first_name}{" "}
                      {booking.guest?.user.last_name}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Phone Number
                    </Typography>
                    <Typography variant="body1">
                      <Phone
                        sx={{ fontSize: 16, mr: 1, verticalAlign: "middle" }}
                      />
                      {booking.guest?.user.phone}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Email Address
                    </Typography>
                    <Typography variant="body1">
                      <Email
                        sx={{ fontSize: 16, mr: 1, verticalAlign: "middle" }}
                      />
                      {booking.guest?.user.email}
                    </Typography>
                  </Box>

                  {booking.guest?.idCard && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        ID Card
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          window.open(booking.guest?.idCard.url, "_blank")
                        }
                      >
                        View ID Card
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Timeline Card */}
              <Card elevation={2} sx={{ mt: 3 }}>
                <CardHeader
                  title="Booking Timeline"
                  avatar={<CalendarMonth />}
                  sx={{
                    backgroundColor: theme.palette.warning.light,
                    color: theme.palette.warning.contrastText,
                    py: 1.5,
                  }}
                />
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(booking.dateOfReservation)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(booking.updatedAt)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Delete Confirmation Dialog */}
          {/* <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this booking? This action cannot
                be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleDelete}
                color="error"
                variant="contained"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Booking"}
              </Button>
            </DialogActions>
          </Dialog> */}
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleDelete}
            loading={loading}
            title="Confirm Delete Booking"
            description="Are you sure you want to delete this booking? This action cannot be undone."
            confirmText="Delete Booking"
            cancelText="Cancel"
          />
        </Container>
      </Box>
    </Box>
  );
}
