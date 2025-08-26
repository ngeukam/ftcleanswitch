import * as React from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Title from "../../components/Title";

export default function HealthCard(props: {
  icon: any;
  title: any;
  value: any;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        textAlign: "center",
        p: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Stack>
          <IconButton
            size="large"
            aria-label="icon"
            color="secondary"
            sx={{
              fontSize: 40,
              mb: 1,
            }}
          >
            {props.icon}
          </IconButton>
          <Typography variant="body2" color="text.secondary" noWrap>
            {props.title}
          </Typography>
          <Typography
            variant="h4"
            component="div"
            fontWeight="bold"
            color="text.primary"
            sx={{ mt: 1 }}
          >
            {props.value}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
