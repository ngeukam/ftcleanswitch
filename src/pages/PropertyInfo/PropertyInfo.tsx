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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, useParams, useNavigate } from "react-router-dom";
import Appbar from "../../components/Appbar";
import useApi from "../../hooks/APIHandler";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LocationAutocomplete from "../../components/LocationAutocomplete";
import GoogleMapsProvider from "../../provider/googleMapProvider";

const PropertyInfoSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  address: Yup.string().required("Required"),
  latitude: Yup.number().required("Required"),
  longitude: Yup.number().required("Required"),
  formatDistance: Yup.number().required("Required"),
});

interface PropertyData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
}

const PropertyInfo = () => {
  const { id } = useParams<{ id: string }>();
  const { callApi, loading } = useApi();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const navigate = useNavigate();

  const initialValues: PropertyData = {
    name: property?.name || "",
    address: property?.address || "",
    latitude: property?.latitude || 0,
    longitude: property?.longitude || 0,
    distance: property?.distance || 0,
  };

  useEffect(() => {
    if (!id) return;
    getPropertyInfo();
  }, [id]);

  const getPropertyInfo = async () => {
    const response = await callApi({
      url: `/properties/${id}/`,
      method: "GET",
    });
    if (response?.status === 200) {
      setProperty(response.data);
    }
  };

  const handleSubmit = async (values: PropertyData) => {
    try {
      const response = await callApi({
        url: `/properties/${id}/`,
        method: "PUT",
        body: values,
      });
      if (response?.status === 200) {
        toast.success("Property updated successfully!");
        navigate(-1);
        getPropertyInfo();
      }
    } catch (error) {
      console.error("Error saving property:", error);
    }
  };

  const handleLocationSelect = (
    locationData: {
      address: string;
      latitude: number;
      longitude: number;
      distance: number;
    },
    setFieldValue: (field: string, value: any) => void
  ) => {
    setFieldValue("address", locationData.address);
    setFieldValue("latitude", locationData.latitude);
    setFieldValue("longitude", locationData.longitude);
    setFieldValue("distance", locationData.distance);
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
      <Appbar appBarTitle="Edit Property" />
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          // height: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Container sx={{ mt: 4, mb: 4 }}>
          <GoogleMapsProvider>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <IconButton
                    onClick={() => navigate(-1)}
                    color="inherit"
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Grid>
                <Grid item>
                  <Typography variant="h6">Edit Property Info</Typography>
                </Grid>
              </Grid>

              <Formik
                initialValues={initialValues}
                validationSchema={PropertyInfoSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ errors, touched, setFieldValue, values }) => (
                  <Form>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          name="name"
                          label="Property Name"
                          fullWidth
                          error={touched.name && !!errors.name}
                          helperText={touched.name && errors.name}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocationAutocomplete
                          onSelect={(location) =>
                            handleLocationSelect(location, setFieldValue)
                          }
                          label="Property Address"
                          defaultValue={values.address}
                        />
                        {touched.address && errors.address && (
                          <Typography color="error" variant="caption">
                            {errors.address}
                          </Typography>
                        )}
                      </Grid>
                       <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          name="distance"
                          label="Min distance Clock In/Out (Meters)"
                          fullWidth
                          type="number"
                          error={touched.distance && !!errors.distance}
                          InputLabelProps={{ shrink: true }}
                          helperText={touched.distance && errors.distance}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          name="latitude"
                          label="Latitude"
                          fullWidth
                          type="number"
                          error={touched.latitude && !!errors.latitude}
                          InputLabelProps={{ shrink: true }}
                          helperText={touched.latitude && errors.latitude}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          name="longitude"
                          label="Longitude"
                          fullWidth
                          type="number"
                          error={touched.longitude && !!errors.longitude}
                          InputLabelProps={{ shrink: true }}
                          helperText={touched.longitude && errors.longitude}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Grid
                      container
                      justifyContent="flex-end"
                      spacing={2}
                      sx={{ mt: 3 }}
                    >
                      <Grid item>
                        <Button
                          onClick={() => navigate(-1)}
                          color="inherit"
                          variant="outlined"
                        >
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
          </GoogleMapsProvider>
        </Container>
      </Box>
    </Box>
  );
};

export default PropertyInfo;
