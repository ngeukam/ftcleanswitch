import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Toolbar,
  Container,
} from "@mui/material";
import {
  Phone,
  Email,
  Bookmark,
  CalendarToday,
  NightsStay,
  ArrowBack,
  Edit,
  Person,
} from "@mui/icons-material";
import { Guest, Booking } from "./types";
import useApi from "../../hooks/APIHandler";
import Appbar from "../../components/Appbar";
import ErrorPage from "../../components/ErrorPage";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`guest-tabpanel-${index}`}
      aria-labelledby={`guest-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const GuestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { callApi, loading } = useApi();
  const navigate = useNavigate();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  console.log("guest", guest);
  useEffect(() => {
    if (id) {
      fetchGuestDetail();
    }
  }, [id]);

  const fetchGuestDetail = async () => {
    try {
      const response = await callApi({
        url: `/guests/${id}/`,
        method: "GET",
      });

      if (response?.status === 200) {
        setGuest(response.data);
      }
    } catch (error) {
      console.error("Error fetching guest details:", error);
    }
  };

  const handleEditClick = () => {
    navigate(`/guests/edit/${id}`);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!guest) {
    return <ErrorPage />;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="Guest Details" />
      <Box
        component="main"
        sx={{
          //  backgroundColor: theme.palette.background.default,
          flexGrow: 1,
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              color="inherit"
              variant="outlined"
            >
              Back to Guests
            </Button>
            <Button
              startIcon={<Edit />}
              onClick={handleEditClick}
              variant="contained"
            >
              Edit Guest
            </Button>
          </Box>

          {/* Profile Header */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box display="flex" alignItems="center" gap={3}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: "primary.main",
                        fontSize: "2rem",
                      }}
                    >
                      {guest.user.first_name[0].toUpperCase()}
                      {guest.user.last_name[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" gutterBottom>
                        {guest.user.first_name} {guest.user.last_name}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        gutterBottom
                      >
                        Guest #{guest.id}
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip label={guest.user.role} size="small" />
                        {guest.booking_stats && (
                          <Chip
                            icon={<Bookmark />}
                            label={`${guest.booking_stats.total_bookings} bookings`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Contact Information
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">
                        {guest.user.email}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">
                        {guest.user.phone}
                      </Typography>
                    </Box>
                    {guest.id_card_url && (
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <Person fontSize="small" color="action" />
                        <Button
                          size="small"
                          href={guest.id_card_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View ID Card
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
            >
              <Tab label="Overview" />
              <Tab label="Booking History" />
              <Tab label="Statistics" />
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Current Stay */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Current Status
                    </Typography>
                    {guest.current_apartment ? (
                      <Box>
                        <Chip
                          label="Currently Checked In"
                          color="success"
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="body2">
                          Apartment: {guest.current_apartment}
                        </Typography>
                        {/* <Typography variant="body2" color="text.secondary">
                      {guest.current_apartment}
                    </Typography> */}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not currently checked in
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Stats */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quick Stats
                    </Typography>
                    {guest.booking_stats && (
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Bookmark />
                          </ListItemIcon>
                          <ListItemText
                            primary="Total Bookings"
                            secondary={guest.booking_stats.total_bookings}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <NightsStay />
                          </ListItemIcon>
                          <ListItemText
                            primary="Total Nights Stayed"
                            secondary={guest.booking_stats.total_days_stayed}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CalendarToday />
                          </ListItemIcon>
                          <ListItemText
                            primary="Last Stay Duration"
                            secondary={`${guest.booking_stats.last_booking_duration} nights`}
                          />
                        </ListItem>
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Booking History Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Recent Bookings
            </Typography>
            {guest.recent_bookings && guest.recent_bookings.length > 0 ? (
              <Grid container spacing={2}>
                {guest.recent_bookings.map((booking) => (
                  <Grid item xs={12} key={booking.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="start"
                        >
                          <Box>
                            <Typography variant="subtitle1" gutterBottom>
                              Apartment {booking.apartment.number} -{" "}
                              {booking.apartment.name} (
                              {booking.apartment.property_assigned_name}-
                              {booking.apartment.property_address})
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(booking.startDate).toLocaleDateString()}{" "}
                              - {new Date(booking.endDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2">
                              Duration: {booking.duration} nights •{" "}
                              {booking.apartment.currency}{" "}
                              {booking.totalPrice?.toLocaleString()}
                            </Typography>
                          </Box>
                          <Chip
                            label={booking.status
                              .toUpperCase()
                              .replaceAll("_", " ")}
                            color={
                              booking.status === "checked_out"
                                ? "error"
                                : booking.status === "checked_in"
                                ? "success"
                                : booking.status === "upcoming"
                                ? "warning"
                                : "default"
                            }
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">No booking history</Typography>
            )}
          </TabPanel>

          {/* Statistics Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Detailed Statistics
            </Typography>
            <Typography color="text.secondary">
              Detailed analytics and charts would be displayed here...
            </Typography>
          </TabPanel>
        </Container>
      </Box>
    </Box>
  );
};

export default GuestDetail;
