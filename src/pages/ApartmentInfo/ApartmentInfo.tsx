import React, { useEffect, useState } from "react";
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
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, useParams, useNavigate } from "react-router-dom";
import Appbar from "../../components/Appbar";
import useApi from "../../hooks/APIHandler";
import { toast } from "react-toastify";
import ImageUpload from "../../components/ImageUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { currencyData } from "../../constant";

const ApartmentSchema = Yup.object().shape({
  number: Yup.number().required("Apartment number is required").positive(),
  name: Yup.string().nullable(),
  property_assigned: Yup.number().nullable(),
  capacity: Yup.number().nullable().positive(),
  numberOfBeds: Yup.number().nullable().positive(),
  apartmentType: Yup.string().required("Apartment type is required"),
  price: Yup.number().nullable().min(0),
  currency: Yup.string().required("Currency is required"),
});

interface ApartmentData {
  number: number;
  name: string;
  property_assigned: number | null;
  capacity: number | null;
  numberOfBeds: number | null;
  apartmentType: string;
  inService: boolean;
  cleaned: boolean;
  price: number | null;
  currency: string;
  image: any[];
  is_active: boolean;
}

interface Property {
  id: number;
  name: string;
  address: string;
}

const ApartmentInfo = () => {
  const { id, number } = useParams<{ id: string; number: string }>();
  const { callApi, loading } = useApi();
  const [apartment, setApartment] = useState<ApartmentData | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentImages, setCurrentImages] = useState<any[]>([]);
  const navigate = useNavigate();

  const initialValues: ApartmentData = {
    number: apartment?.number || 0,
    name: apartment?.name || "",
    property_assigned: apartment?.property_assigned || null,
    capacity: apartment?.capacity || null,
    numberOfBeds: apartment?.numberOfBeds || null,
    apartmentType: apartment?.apartmentType || "normal",
    inService: apartment?.inService || false,
    cleaned: apartment?.cleaned || false,
    price: apartment?.price || null,
    currency: apartment?.currency || "EUR",
    image: apartment?.image || [],
    is_active: apartment?.is_active || true,
  };

  useEffect(() => {
    if (!id) return;
    getApartmentInfo();
    getProperties();
  }, [id]);

  const getApartmentInfo = async () => {
    const response = await callApi({
      url: `/apartments/${id}/`,
      method: "GET",
    });
    if (response?.status === 200) {
      setApartment(response.data);
      setCurrentImages(response.data.image || []);
    }
  };

  const getProperties = async () => {
    const response = await callApi({
      url: "/properties/",
      method: "GET",
      params: { pageSize: 100 },
    });
    if (response?.status === 200) {
      setProperties(response.data.data.data);
    }
  };

  const handleSubmit = async (values: ApartmentData) => {
    try {
      const updateData = {
        ...values,
        image: currentImages,
      };

      const response = await callApi({
        url: `/apartments/${id}/`,
        method: "PUT",
        body: updateData,
      });

      if (response?.status === 200) {
        toast.success("Apartment updated successfully!");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error saving apartment:", error);
      toast.error("Failed to update apartment");
    }
  };

  const handleImageUpload = (uploadedImages: any[]) => {
    setCurrentImages((prev) => [...prev, ...uploadedImages]);
  };

  const removeImage = (index: number) => {
    setCurrentImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading || (id && !apartment)) {
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
      <Appbar appBarTitle="Edit Apartment" />
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
                <IconButton
                  color="inherit"
                  onClick={() => navigate("/apartments-list")}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Grid>
              <Grid item>
                <Typography variant="h6">Edit Apartment #{number}</Typography>
              </Grid>
            </Grid>

            <Formik
              initialValues={initialValues}
              validationSchema={ApartmentSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ errors, touched, setFieldValue, values }) => (
                <Form>
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="number"
                        label="Apartment Number"
                        fullWidth
                        type="number"
                        error={touched.number && !!errors.number}
                        helperText={touched.number && errors.number}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="name"
                        label="Apartment Name"
                        fullWidth
                        error={touched.name && !!errors.name}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Field
                        as={Select}
                        name="property_assigned"
                        label="Property"
                        fullWidth
                        error={
                          touched.property_assigned &&
                          !!errors.property_assigned
                        }
                        helperText={
                          touched.property_assigned && errors.property_assigned
                        }
                      >
                        {properties.map((property) => (
                          <MenuItem key={property.id} value={property.id}>
                            {property.name} - {property.address}
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Field
                        as={Select}
                        name="apartmentType"
                        label="Apartment Type"
                        fullWidth
                        error={touched.apartmentType && !!errors.apartmentType}
                        helperText={
                          touched.apartmentType && errors.apartmentType
                        }
                      >
                        <MenuItem value="king">King</MenuItem>
                        <MenuItem value="luxury">Luxury</MenuItem>
                        <MenuItem value="normal">Normal</MenuItem>
                        <MenuItem value="economic">Economic</MenuItem>
                      </Field>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="capacity"
                        label="Capacity"
                        fullWidth
                        type="number"
                        error={touched.capacity && !!errors.capacity}
                        helperText={touched.capacity && errors.capacity}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="numberOfBeds"
                        label="Number of Beds"
                        fullWidth
                        type="number"
                        error={touched.numberOfBeds && !!errors.numberOfBeds}
                        helperText={touched.numberOfBeds && errors.numberOfBeds}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Field
                        as={Select}
                        name="currency"
                        label="Currency"
                        fullWidth
                        error={touched.currency && !!errors.currency}
                        helperText={touched.currency && errors.currency}
                      >
                        {currencyData.map((currency) => (
                          <MenuItem key={currency.code} value={currency.code}>
                            {currency.name} ({currency.symbol})
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="price"
                        label="Price"
                        fullWidth
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ pr: 1 }}>
                              {currencyData.find(
                                (c) => c.code === values.currency
                              )?.symbol || ""}
                            </Box>
                          ),
                        }}
                        error={touched.price && !!errors.price}
                        helperText={touched.price && errors.price}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Field
                            as={Checkbox}
                            name="inService"
                            checked={values.inService}
                          />
                        }
                        label="In Service"
                      />
                      <FormControlLabel
                        control={
                          <Field
                            as={Checkbox}
                            name="cleaned"
                            checked={values.cleaned}
                          />
                        }
                        label="Cleaned"
                      />
                      <FormControlLabel
                        control={
                          <Field
                            as={Checkbox}
                            name="is_active"
                            checked={values.is_active}
                          />
                        }
                        label="Active"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Current Images
                      </Typography>
                      <Grid container spacing={1}>
                        {currentImages.map((img, index) => (
                          <Grid item key={index} xs={6} sm={4} md={3}>
                            <Box
                              sx={{
                                position: "relative",
                                height: 100,
                                borderRadius: 1,
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={img.url || img}
                                alt={`Apartment ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <IconButton
                                size="small"
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  backgroundColor: "rgba(0,0,0,0.5)",
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: "rgba(0,0,0,0.7)",
                                  },
                                }}
                                onClick={() => removeImage(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Add More Images
                      </Typography>
                      <ImageUpload
                        onUpload={handleImageUpload}
                        maxFiles={10 - currentImages.length}
                        maxFileSize={5}
                        allowedTypes={["image/jpeg", "image/png", "image/webp"]}
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
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Save"
                        )}
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

export default ApartmentInfo;
