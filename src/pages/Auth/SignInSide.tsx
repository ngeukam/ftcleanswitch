import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { LinearProgress } from "@mui/material";
import { useForm } from "react-hook-form";
import useApi from "../../hooks/APIHandler";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { login } from "../../redux/reducer/IsLoggedInReducer";
import { getUser } from "../../utils/Helper";
type FormValues = {
  username: string;
  password: string;
};

export default function SignInSide() {
  const { callApi, loading } = useApi();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!getUser()?.username) navigate(`/login`);
    else navigate(`/dashboard`);
  }, [navigate]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    const response = await callApi({
      url: "/auth/login/",
      method: "POST",
      body: data,
    });
    if (response?.data?.access) {
      localStorage.setItem("token", response.data.access);
      setTimeout(() => {
        navigate(`/dashboard`);
      }, 2000);
      toast.success("Login successfully!");
      window.location.reload();
      dispatch(login());
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <>
      {/* <HeartRateLoader message={"Get well soon!"} /> */}
      <Grid container component="main" sx={{ height: "100vh" }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: "url(../../../doctor.jpg)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box sx={{ mt: 1 }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  margin="normal"
                  // required
                  fullWidth
                  id="username"
                  label="Username"
                  // name="username"
                  InputLabelProps={{ shrink: true }}
                  autoComplete="username"
                  autoFocus
                  // value="admin"
                  {...register("username", {
                    required: "Username is required",
                  })}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                />
                <TextField
                  margin="normal"
                  // required
                  fullWidth
                  //name="password"
                  label="Password"
                  InputLabelProps={{ shrink: true }}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  // value="1234"
                  autoComplete="current-password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <Button onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? "Hide" : "Show"}
                      </Button>
                    ),
                  }}
                />
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
                />
                {loading ? (
                  <LinearProgress sx={{ width: "100%" }} />
                ) : (
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Sign In
                  </Button>
                )}
              </form>
              {/* <Grid container>
                <Grid item xs>
                  <Link
                    to={"/forgot"}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    to={"/signup"}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
              <Divider sx={{ mt: 2 }} light variant="middle">
                OR
              </Divider>
              <Button
                fullWidth
                startIcon={<GoogleIcon />}
                variant="outlined"
                sx={{
                  mt: 2,
                }}
              >
                Continue with google
              </Button>

              <Button
                fullWidth
                startIcon={<FacebookIcon />}
                variant="outlined"
                sx={{
                  mt: 2,
                }}
              >
                Continue with facebook
              </Button>

              <Typography align="center" variant="subtitle2" sx={{ mt: 2 }}>
                By continuing, you agree to{" "}
                <span style={{ color: "green" }}>Terms of Service</span> and
                <span style={{ color: "green" }}> Privacy Policy</span>.
              </Typography> */}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
