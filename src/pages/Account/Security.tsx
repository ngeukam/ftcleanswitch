import * as React from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Typography, Stack, Paper, InputAdornment } from "@mui/material";
import Divider from "@mui/material/Divider";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockIcon from "@mui/icons-material/Lock";
import TimelineDot from "@mui/lab/TimelineDot";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import useApi from "../../hooks/APIHandler";
import { toast } from "react-toastify";

const loginData = [
  {
    loginType: "Credential login",
    dateAndTime: "10:07 AM 06/28/2023",
    ipAddress: "95.130.17.84",
    client: "Chrome, Mac OS 10.15.7",
  },
  {
    loginType: "Credential login",
    dateAndTime: "07:47 AM 06/28/2023",
    ipAddress: "95.130.17.84",
    client: "Chrome, Mac OS 10.15.7",
  },
];

export default function Security() {
  const { callApi, loading } = useApi();
  const [isEditing, setIsEditing] = React.useState(false);
  const [passwordData, setPasswordData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showcurrentPassword, setShowcurrentPassword] = React.useState(false);
  const [shownewPassword, setShownewPassword] = React.useState(false);
  const [showconfirmPassword, setShowconfirmPassword] = React.useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitPasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      const response = await callApi({
        url: `/auth/change-password/`,
        body: {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_password: passwordData.confirmPassword,
        },
        method: "PATCH",
      });

      if (response?.status === 200) {
        toast.success("Password changed successfully!");
        setIsEditing(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error(
        "Failed to change password. Please check your current password."
      );
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            Change password
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Stack spacing={2}>
            {!isEditing ? (
              <Button
                variant="outlined"
                onClick={() => setIsEditing(true)}
                sx={{ width: "fit-content" }}
              >
                Change Password
              </Button>
            ) : (
              <>
                <TextField
                  name="currentPassword"
                  fullWidth
                  type={showcurrentPassword ? "text" : "password"}
                  label="Current Password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <Button
                        onClick={() =>
                          setShowcurrentPassword(!showcurrentPassword)
                        }
                      >
                        {showcurrentPassword ? "Hide" : "Show"}
                      </Button>
                    ),
                  }}
                />
                <TextField
                  name="newPassword"
                  fullWidth
                  type={shownewPassword ? "text" : "password"}
                  label="New Password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <Button
                        onClick={() => setShownewPassword(!shownewPassword)}
                      >
                        {shownewPassword ? "Hide" : "Show"}
                      </Button>
                    ),
                  }}
                />
                <TextField
                  name="confirmPassword"
                  fullWidth
                  type={showconfirmPassword ? "text" : "password"}
                  label="Confirm New Password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <Button
                        onClick={() =>
                          setShowconfirmPassword(!showconfirmPassword)
                        }
                      >
                        {showconfirmPassword ? "Hide" : "Show"}
                      </Button>
                    ),
                  }}
                />
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={handleSubmitPasswordChange}
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsEditing(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Divider light sx={{ mt: 4, mb: 4 }} />

      <Typography variant="body1" gutterBottom sx={{ fontWeight: "bold" }}>
        Multi Factor Authentication
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Paper elevation={0} sx={{ p: 2 }}>
            <Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <TimelineDot color="error" />
                <Typography variant="body1" color="error" gutterBottom>
                  Off
                </Typography>
              </Stack>

              <Typography
                variant="body1"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                Authenticator App
              </Typography>
              <Typography
                gutterBottom
                variant="subtitle2"
                color="text.secondary"
              >
                Use an authenticator app to generate one time security codes.
              </Typography>
              <Button
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                sx={{ width: "25%", mt: 4 }}
              >
                Set Up
              </Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={0} sx={{ p: 2 }}>
            <Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <TimelineDot color="error" />
                <Typography variant="body1" color="error" gutterBottom>
                  Off
                </Typography>
              </Stack>
              <Typography
                variant="body1"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                Text Message
              </Typography>
              <Typography
                gutterBottom
                variant="subtitle2"
                color="text.secondary"
              >
                Use your mobile phone to receive security codes via SMS.
              </Typography>
              <Button
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                sx={{ width: "25%", mt: 4 }}
              >
                Set Up
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Divider light sx={{ mt: 4, mb: 4 }} />

      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
        Login history
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Your recent login activity
      </Typography>

      <TableContainer component={Paper} elevation={0}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead
            sx={{
              textTransform: "uppercase",
            }}
          >
            <TableRow>
              <TableCell>Login Type</TableCell>
              <TableCell>IP address</TableCell>
              <TableCell>Client</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loginData.map((row: any, index: any) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row.loginType}
                  <Typography variant="body2" color="text.secondary">
                    {row.dateAndTime}
                  </Typography>
                </TableCell>
                <TableCell>{row.ipAddress}</TableCell>
                <TableCell>{row.client}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
