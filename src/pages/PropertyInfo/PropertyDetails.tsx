import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  IconButton,
  Toolbar,
  Container,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  Grid,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import {
  ArrowBack,
  LocationOn,
  SquareFoot,
  Apartment,
  Task,
  FormatListBulleted,
  People,
  BookOnline,
  Person,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import Appbar from "../../components/Appbar";
import useApi from "../../hooks/APIHandler";

interface PropertyData {
  id: number;
  name: string;
  address: string;
  distance: number;
  is_active?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
interface DashboardStats {
  total_pending_tasks: number;
  total_register_guests: number;
  total_reservations: number;
}

const initialStats: DashboardStats = {
  total_pending_tasks: 0,
  total_register_guests: 0,
  total_reservations: 0,
};
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { callApi, loading } = useApi();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = React.useState({
    stats: initialStats,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getPropertyInfo();
    fetchStats();
  }, [id]);

  const fetchStats = async () => {
    try {
      const response = await callApi({
        url: `/properties/stats/?property_id=${id}`,
        method: "GET",
      });
      if (response?.data) {
        setData((prev) => ({
          ...prev,
          stats: response.data,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  const getPropertyInfo = async () => {
    const response = await callApi({
      url: `/properties/${id}/`,
      method: "GET",
    });
    if (response?.status === 200) {
      setProperty(response.data);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading || (id && !property)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="Property Information" />
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          //   height: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Header with back button and title */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <IconButton
              onClick={() => navigate("/properties-list")}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Property #{id}
            </Typography>
          </Box>

          {property && (
            <>
              {/* Property summary card */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {property.name}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <LocationOn color="action" sx={{ mr: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                          {property.address}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                        <Chip
                          icon={<SquareFoot />}
                          label={`${(property.distance / 1000).toFixed(
                            2
                          )} km for Clock In/Out`}
                          variant="outlined"
                        />
                        <Chip
                          label={property.is_active ? "Active" : "Inactive"}
                          color={
                            property.is_active === true ? "success" : "default"
                          }
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Navigation tabs */}
              <Paper sx={{ width: "100%", mb: 2, p: 2 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="property management tabs"
                >
                  <Tab icon={<Apartment />} label="Apartments" />
                  <Tab icon={<Task />} label="Tasks" />
                  <Tab icon={<FormatListBulleted />} label="Task Templates" />
                  <Tab icon={<People />} label="Users" />
                  <Tab icon={<BookOnline />} label="Bookings" />
                  <Tab icon={<Person />} label="Guests" />
                </Tabs>
                <Divider />

                <TabPanel value={tabValue} index={0}>
                  <Typography variant="h6" gutterBottom>
                    Apartment Management
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    View and manage all apartments in this property.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/properties/${id}/apartments`)}
                  >
                    View Apartments
                  </Button>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Typography variant="h6" gutterBottom>
                    Task Management
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    Manage maintenance and operational tasks for this property.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/properties/${id}/tasks`)}
                  >
                    View Tasks
                  </Button>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Typography variant="h6" gutterBottom>
                    Task Templates
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    Create and manage task templates for efficient property
                    operations.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/properties/${id}/tasks-template`)}
                  >
                    Manage Templates
                  </Button>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <Typography variant="h6" gutterBottom>
                    User Management
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    Manage staff and user permissions for this property.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/properties/${id}/users`)}
                  >
                    View Users
                  </Button>
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                  <Typography variant="h6" gutterBottom>
                    Booking Management
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    View and manage all bookings for this property.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/properties/${id}/bookings`)}
                  >
                    View Bookings
                  </Button>
                </TabPanel>

                <TabPanel value={tabValue} index={5}>
                  <Typography variant="h6" gutterBottom>
                    Guest Management
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    View and manage guest information and stays.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/properties/${id}/guests`)}
                  >
                    View Guests
                  </Button>
                </TabPanel>
              </Paper>

              {/* Quick Stats Section */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={3}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4" color="secondary" gutterBottom>
                      {data.stats.total_pending_tasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Tasks
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4" color="success.main" gutterBottom>
                      {data.stats.total_reservations}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Bookings
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4" color="warning.main" gutterBottom>
                      {data.stats.total_register_guests}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Registered Guests
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default PropertyDetails;
