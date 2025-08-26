import Grid from "@mui/material/Grid";
import { Typography, Stack } from "@mui/material";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";

export default function Notifications() {
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            Phone notifications
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Stack direction="column" spacing={0.5}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Product updates
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                News, announcements, and product updates.
              </Typography>
            </Stack>
            <Switch defaultChecked />
          </Stack>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Stack direction="column" spacing={0.5}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Security updates
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Important notifications about your account security.
              </Typography>
            </Stack>
            <Switch defaultChecked />
          </Stack>
        </Grid>
      </Grid>

      <Divider light sx={{ mt: 4, mb: 4 }} />

      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            Email
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Stack direction="column" spacing={0.5}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Security updates
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Important notifications about your account security.
              </Typography>
            </Stack>
            <Switch />
          </Stack>
        </Grid>
      </Grid>

      <Divider light sx={{ mt: 4, mb: 4 }} />
    </>
  );
}
