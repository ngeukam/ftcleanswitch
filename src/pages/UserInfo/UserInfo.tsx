import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import {
  TextField,
  Button,
  Grid,
  Box,
  Paper,
  IconButton,
  Toolbar,
  Container,
  Typography,
  CircularProgress,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Checkbox,
  ListItemText,
  FormControlLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, useParams, useNavigate } from "react-router-dom";
import Appbar from "../../components/Appbar";
import useApi from "../../hooks/APIHandler";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { Property } from "../PropertyInfo/PropertyList";

const UserInfoSchema = Yup.object().shape({
  first_name: Yup.string().required("Required"),
  last_name: Yup.string().required("Required"),
  email: Yup.string().required("Required"),
  phone: Yup.string().required("Required"),
  username: Yup.string().required("Required"),
  password: Yup.string().required("Required"),
  role: Yup.string().required("Required"),
  properties_assigned: Yup.array().of(Yup.string()).required("Required"),
  is_active: Yup.boolean(),
});

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  role: string;
  department:string;
  properties_assigned: string[];
  is_active: boolean;
}

const roles = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "receptionist", label: "Receptionist" },
  { value: "cleaning", label: "Cleaning Staff" },
  { value: "technical", label: "Technical Staff" },
  { value: "guest", label: "Guest" },
];
const departments = [
  { value: "HK", label: "HK" },
  { value: "FO", label: "FO" },
  { value: "SALE", label: "SALE" },
  { value: "HR", label: "HR" },
  { value: "TECHNICAL", label: "TECHNICAL" },
  { value: "DG", label: "DG" },
  { value: "FINANCE", label: "FINANCE" },
];

const UserInfo = () => {
  const { id } = useParams<{ id: string }>();
  const { callApi, loading } = useApi();
  const navigate = useNavigate();
  const [user, setUser] = React.useState<UserData | null>(null);
  const [properties, setProperties] = React.useState<Property[]>([]);
  const initialValues: UserData = {
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    username: user?.username || "",
    password: user?.password || "",
    role: user?.role || "",
    department: user?.department || "",
    properties_assigned: user?.properties_assigned || [],
    is_active: user?.is_active !== undefined ? user.is_active : true,
  };

  useEffect(() => {
    if (!id) return;
    getUserInfo();
    fetchProperties();
  }, [id]);

  const getUserInfo = async () => {
    const response = await callApi({ url: `/user/${id}/`, method: "GET" });
    if (response?.status === 200) {
      const assigned = response.data.properties_assigned || [];
      const assignedIds = assigned.map((prop: any) =>
        typeof prop === "object" ? prop.id.toString() : prop.toString()
      );
      setUser({
        ...response.data,
        properties_assigned: assignedIds,
        is_active: response.data.is_active,
      });
    }
  };

  const fetchProperties = async () => {
    const response = await callApi({
      url: "/properties/",
      params: { page: 1, pageSize: 100, ordering: "-id" },
    });
    if (response) {
      setProperties(response.data.data.data);
    }
  };

  const handleSubmit = async (values: UserData) => {
    try {
      const response = await callApi({
        url: `/user/update/${id}/`,
        method: "PUT",
        body: {
          ...values,
          is_active: values.is_active,
        },
      });
      if (response?.status === 200) {
        toast.success("User updated successfully!");
        navigate(-1);
        getUserInfo();
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  if (loading || (id && !user)) {
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
      <Appbar appBarTitle="User Edit" />
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Container sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <IconButton component={Link} to="/users-list" color="inherit">
                  <ArrowBackIcon />
                </IconButton>
              </Grid>
              <Grid item>
                <Typography variant="h6">
                  Edit User Info
                  <Box
                    component="span"
                    ml={2}
                    color={user?.is_active ? "success.main" : "error.main"}
                  >
                    ({user?.is_active ? "Active" : "Inactive"})
                  </Box>
                </Typography>
              </Grid>
            </Grid>

            <Formik
              initialValues={initialValues}
              validationSchema={UserInfoSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ errors, touched, values, handleChange }) => (
                <Form>
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="first_name"
                        label="First Name"
                        fullWidth
                        error={touched.first_name && !!errors.first_name}
                        helperText={touched.first_name && errors.first_name}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="last_name"
                        label="Last Name"
                        fullWidth
                        error={touched.last_name && !!errors.last_name}
                        helperText={touched.last_name && errors.last_name}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="phone"
                        label="Phone"
                        fullWidth
                        error={touched.phone && !!errors.phone}
                        helperText={touched.phone && errors.phone}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="email"
                        label="Email"
                        fullWidth
                        error={touched.email && !!errors.email}
                        helperText={touched.email && errors.email}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="username"
                        label="Username"
                        fullWidth
                        error={touched.username && !!errors.username}
                        helperText={touched.username && errors.username}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="password"
                        label="Password"
                        fullWidth
                        error={touched.password && !!errors.password}
                        helperText={touched.password && errors.password}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl
                        fullWidth
                        error={touched.role && !!errors.role}
                      >
                        <InputLabel>Role</InputLabel>
                        <Select
                          name="role"
                          value={values.role}
                          onChange={handleChange}
                          label="Role"
                        >
                          {roles.map((role) => (
                            <MenuItem key={role.value} value={role.value}>
                              {role.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.role && errors.role && (
                          <div style={{ color: "red", fontSize: 12 }}>
                            {errors.role}
                          </div>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl
                        fullWidth
                        error={touched.department && !!errors.department}
                      >
                        <InputLabel>Department</InputLabel>
                        <Select
                          name="department"
                          value={values.department}
                          onChange={handleChange}
                          label="Department"
                        >
                          {departments.map((department) => (
                            <MenuItem key={department.value} value={department.value}>
                              {department.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.department && errors.department && (
                          <div style={{ color: "red", fontSize: 12 }}>
                            {errors.department}
                          </div>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Field
                            as={Checkbox}
                            name="is_active"
                            checked={values.is_active}
                            onChange={handleChange}
                            color="primary"
                          />
                        }
                        label={
                          values.is_active ? "Active User" : "Inactive User"
                        }
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        error={
                          touched.properties_assigned &&
                          !!errors.properties_assigned
                        }
                      >
                        <InputLabel>Properties Assigned</InputLabel>
                        <Select
                          name="properties_assigned"
                          label="properties_assigned"
                          multiple
                          value={values.properties_assigned}
                          onChange={handleChange}
                          renderValue={(selected) =>
                            properties
                              .filter((p) => selected.includes(p.id.toString()))
                              .map((p) => p.name +' - '+ p.address)
                              .join(", ")
                          }
                        >
                          {properties.map((prop) => (
                            <MenuItem key={prop.id} value={prop.id.toString()}>
                              <Checkbox
                                checked={values.properties_assigned.includes(
                                  prop.id.toString()
                                )}
                              />
                              <ListItemText primary={prop.name +' - '+prop.address} />
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.properties_assigned &&
                          errors.properties_assigned && (
                            <div style={{ color: "red", fontSize: 12 }}>
                              {errors.properties_assigned}
                            </div>
                          )}
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    justifyContent="flex-end"
                    spacing={2}
                    sx={{ mt: 3 }}
                  >
                    <Grid item>
                      <Button variant="outlined" onClick={() => navigate(-1)} color="inherit">
                        Cancel
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button type="submit" variant="contained">
                        Save
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default UserInfo;
