import * as React from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import HealthCard from "./HealthCard";
import Appbar from "../../components/Appbar";
import useApi from "../../hooks/APIHandler";

import PeopleIcon from "@mui/icons-material/People";
import TodayIcon from "@mui/icons-material/Today";
import BedroomParentIcon from "@mui/icons-material/BedroomParent";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

// Assume these types are defined elsewhere
interface Property {
  id: number;
  name: string;
}

interface DashboardStats {
  currency: string[];
  number_of_guests: number;
  number_of_reservations: number;
  occupancy_rate: number;
  current_month_income: number;
  number_of_check_ins: number;
  total_check_ins: number;
  guests_registered_per_day_current_week: Record<string, number>;
}

const initialStats: DashboardStats = {
  currency: [],
  number_of_guests: 0,
  number_of_reservations: 0,
  occupancy_rate: 0,
  current_month_income: 0,
  number_of_check_ins: 0,
  total_check_ins: 0,
  guests_registered_per_day_current_week: {},
};

export default function Dashboard() {
  const [data, setData] = React.useState({
    stats: initialStats,
    properties: [] as Property[],
    selectedPropertyId: "" as number | "",
  });

  const { callApi, loading, error } = useApi();

  // Fetch properties on initial load
  React.useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await callApi({
          url: `/properties/`,
          params: { page: 1, pageSize: 100, ordering: "-id" },
        });

        if (response?.data?.data?.data) {
          const properties = response.data.data.data;
          const selectedPropertyId = properties.length > 0 ? properties[0].id : "";
          setData((prev) => ({
            ...prev,
            properties,
            selectedPropertyId,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      }
    };
    fetchProperties();
  }, []);

  // Fetch stats whenever the selected property ID changes
  React.useEffect(() => {
    if (data.selectedPropertyId) {
      const fetchStats = async () => {
        try {
          const response = await callApi({
            url: `/properties/stats/?property_id=${data.selectedPropertyId}`,
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
      fetchStats();
    }
  }, [data.selectedPropertyId]);

  const handlePropertyChange = (event: SelectChangeEvent<number>) => {
    setData((prev) => ({
      ...prev,
      selectedPropertyId: event.target.value as number,
    }));
  };

  // Memoize chart and card data to prevent re-computation on every render
  const cardData = React.useMemo(() => [
    {
      icon: <PeopleIcon />,
      title: "Guests this month",
      value: data.stats.number_of_guests,
    },
    {
      icon: <TodayIcon />,
      title: "Reservations this month",
      value: data.stats.number_of_reservations,
    },
    {
      icon: <BedroomParentIcon />,
      title: "Occupancy Rate",
      value: `${data.stats.occupancy_rate.toFixed(2)}%`,
    },
    {
      icon: <CurrencyExchangeIcon />,
      title: "Income this month",
      value: `${data.stats.currency[0] ?? ""}${" "}${data.stats.current_month_income.toLocaleString()}`,
    },
    {
      icon: <CheckBoxIcon />,
      title: "Check-ins Today",
      value: data.stats.number_of_check_ins,
    },
  ], [data.stats]);

  const pieChartData = React.useMemo(() => [
    { value: data.stats.number_of_guests, name: "Guests" },
    { value: data.stats.number_of_reservations, name: "Reservations" },
    { value: data.stats.total_check_ins, name: "Check In" },
  ], [data.stats]);

  const barChartData = React.useMemo(() => Object.keys(
    data.stats.guests_registered_per_day_current_week
  ).map((date) => ({
    name: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
    guests: data.stats.guests_registered_per_day_current_week[date],
  })), [data.stats]);

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="Dashboard" />

      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[900],
          flexGrow: 1,
          overflow: "auto",
          minHeight: "100vh", // Ensures content fills the viewport
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Header Section with Title and Property Selector */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography variant="h4" component="h1" fontWeight="bold">
              Dashboard Overview
            </Typography>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel id="property-select-label">Select Property</InputLabel>
              <Select
                labelId="property-select-label"
                id="property-select"
                value={data.selectedPropertyId}
                label="Select Property"
                onChange={handlePropertyChange}
              >
                {data.properties.map((prop) => (
                  <MenuItem key={prop.id} value={prop.id}>
                    {prop.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Loading and Error States */}
          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              Failed to load dashboard data. Please try again.
            </Alert>
          )}

          {/* Main Dashboard Grid */}
          {!loading && !error && (
            <Grid container spacing={3}>
              {/* Health Cards */}
              {cardData.map((item, index) => (
                <Grid key={index} item xs={12} sm={6} md={4} lg={2.4}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      height: 140,
                      justifyContent: "center",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 3,
                      },
                    }}
                  >
                    <HealthCard
                      icon={item.icon}
                      title={item.title}
                      value={item.value}
                    />
                  </Paper>
                </Grid>
              ))}

              {/* Charts Section */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, display: "flex", flexDirection: "column", height: 400 }}>
                  <PieChart data={pieChartData} />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, display: "flex", flexDirection: "column", height: 400 }}>
                  <Typography variant="h6" gutterBottom>
                    Guests Registered This Week
                  </Typography>
                  <BarChart data={barChartData} />
                </Paper>
              </Grid>

            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
}