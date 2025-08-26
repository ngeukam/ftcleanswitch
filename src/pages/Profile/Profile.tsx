import * as React from "react";
import {
  Paper,
  IconButton,
  Toolbar,
  Container,
  Avatar,
  Typography,
  Grid,
  Box,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import Appbar from "../../components/Appbar";
import {
  Email,
  Phone,
  AccountCircle,
  Business,
  Edit,
  LocationCity,
  Badge,
  CalendarToday,
  Work,
} from "@mui/icons-material";
import { getUser } from "../../utils/Helper";
import useApi from "../../hooks/APIHandler";
import Swal from "sweetalert2";
import { useTheme } from "@mui/material/styles";

interface UserInfo {
  email?: string;
  department?: string;
  phone?: string;
  properties_assigned?: any[];
  created_at?: string;
}

export default function Profile() {
  const theme = useTheme();
  const { callApi, loading } = useApi();
  const [userInfo, setUserInfo] = React.useState<UserInfo>({});
  const [editMode, setEditMode] = React.useState(false);
  const fetchUserInfo = async () => {
    try {
      const response = await callApi({ url: `/user/${getUser()?.user_id}/` });
      if (response?.status === 200) {
        setUserInfo(response.data);
      }
    } catch (error) {}
  };

  React.useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleEdit = () => {
    setEditMode(!editMode);
    // In a real implementation, you would have form fields and save functionality
  };

  const infoData = [
    {
      icon: <Email color="primary" />,
      title: "Email",
      value: userInfo?.email || getUser()?.email || "N/A",
    },
    {
      icon: <Phone color="primary" />,
      title: "Contact",
      value: userInfo?.phone || getUser()?.phone || "N/A",
    },
    {
      icon: <Badge color="primary" />,
      title: "Employee ID",
      value: getUser()?.username || "N/A",
    },
    {
      icon: <Business color="primary" />,
      title: "Department",
      value: userInfo?.department || getUser()?.department || "N/A",
    },
    {
      icon: <Work color="primary" />,
      title: "Position",
      value: getUser()?.role
        ? `${(getUser()?.role || "").charAt(0).toUpperCase()}${(
            getUser()?.role || ""
          ).slice(1)}`
        : "N/A",
    },
    {
      icon: <CalendarToday color="primary" />,
      title: "Member Since",
      value: userInfo?.created_at
        ? new Date(userInfo.created_at).toLocaleDateString()
        : "N/A",
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="My Profile" />
      <Box
        component="main"
        sx={{
          backgroundColor: theme.palette.background.default,
          flexGrow: 1,
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Profile Card */}
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                    position: "relative",
                    borderRadius: 3,
                    boxShadow: theme.shadows[4],
                  }}
                >
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      backgroundColor: theme.palette.action.hover,
                    }}
                    onClick={handleEdit}
                  >
                    <Edit fontSize="small" />
                  </IconButton>

                  <Avatar
                    src={`https://ui-avatars.com/api/?name=${
                      getUser()?.first_name
                    }+${getUser()?.last_name}&background=${
                      theme.palette.primary.light
                    }&color=fff&size=128&rounded=true&font-size=0.4`}
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 3,
                      border: `4px solid ${theme.palette.primary.light}`,
                    }}
                  />

                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {getUser()?.first_name} {getUser()?.last_name}
                  </Typography>

                  <Chip
                    label={
                      getUser()?.role
                        ? `${(getUser()?.role || "").charAt(0).toUpperCase()}${(
                            getUser()?.role || ""
                          ).slice(1)}`
                        : "N/A"
                    }
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 3 }}
                  />

                  <Divider sx={{ width: "100%", my: 2 }} />

                  <Stack spacing={1} width="100%">
                    <Typography variant="body2" color="text.secondary">
                      <LocationCity
                        fontSize="small"
                        sx={{ mr: 1, verticalAlign: "middle" }}
                      />
                      {userInfo?.properties_assigned?.length || 0}{" "}
                      {userInfo?.properties_assigned?.length === 1
                        ? "Property"
                        : "Properties"}{" "}
                      Assigned
                    </Typography>
                    {userInfo.properties_assigned?.length ? (
                      <List sx={{ width: "100%" }}>
                        {userInfo.properties_assigned.map((property) => (
                          <ListItem
                            key={property.id}
                            sx={{
                              borderBottom: `1px solid ${theme.palette.divider}`,
                              "&:last-child": { borderBottom: "none" },
                            }}
                          >
                            <LocationCity
                              fontSize="medium"
                              sx={{ mr: 1, verticalAlign: "middle" }}
                            />
                            <ListItemText
                              primary={property.name}
                              primaryTypographyProps={{ fontWeight: "medium" }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <></>
                    )}
                  </Stack>
                </Paper>
              </Grid>

              {/* Info Grid */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  {infoData.map((item, index) => (
                    <Grid key={index} item xs={12} sm={6}>
                      <Paper
                        sx={{
                          p: 3,
                          height: "100%",
                          borderRadius: 3,
                          boxShadow: theme.shadows[2],
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: theme.shadows[4],
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            sx={{
                              p: 1.5,
                              backgroundColor: theme.palette.primary.light,
                              borderRadius: "50%",
                              color: theme.palette.primary.contrastText,
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              sx={{ textTransform: "uppercase", fontSize: 12 }}
                            >
                              {item.title}
                            </Typography>
                            <Typography variant="h6" fontWeight="medium">
                              {item.value}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {/* Additional Info Section */}
                <Paper
                  sx={{
                    p: 3,
                    mt: 3,
                    borderRadius: 3,
                    boxShadow: theme.shadows[2],
                  }}
                >
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    About
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {getUser()?.first_name} is a {getUser()?.role} in the{" "}
                    {getUser()?.department} department. Joined on{" "}
                    {userInfo?.created_at
                      ? new Date(userInfo.created_at).toLocaleDateString()
                      : "N/A"}
                    .
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
}
