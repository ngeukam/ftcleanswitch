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
  Chip,
  SelectChangeEvent,
  Autocomplete,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, useNavigate, useParams } from "react-router-dom";
import Appbar from "../../components/Appbar";
import useApi from "../../hooks/APIHandler";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Validation Schema
const TaskTemplateSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  duration: Yup.number()
    .min(0, "Duration cannot be negative")
    .required("Estimated duration is required"),
  default_assignees: Yup.array()
    .of(Yup.string())
    .min(1, "At least one assignee is required"),
  priority: Yup.string().required("Priority is required"),
});

interface TaskTemplateData {
  id?: number;
  title: string;
  description: string;
  duration: number;
  default_assignees: string[];
  priority: string;
  default_property?: string;
  default_apartment?: string;
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  department: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
}

interface Apartment {
  id: number;
  number: string;
  name: string;
}

const getInitialValues = (): TaskTemplateData => ({
  title: "",
  description: "",
  duration: 0,
  default_assignees: [],
  priority: "medium",
  default_property: "",
  default_apartment: "",
});

const TaskTemplateInfo = () => {
  const { id } = useParams<{ id: string }>();
  const { callApi, loading } = useApi();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<TaskTemplateData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [allProperties, setProperties] = useState<Property[]>([]);
  const [filteredApartments, setFilteredApartments] = useState<Apartment[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<TaskTemplateData>(
    getInitialValues()
  );
  const getProperties = async () => {
    const response = await callApi({
      url: "/properties/",
      params: { page: 1, pageSize: 100, ordering: "-id" },
    });
    if (response && response.status === 200) {
      setProperties(response.data.data.data);
    }
  };

  const fetchUsersByProperty = async (propertyId: string) => {
    if (!propertyId) {
      setFilteredUsers(users);
      return;
    }

    const res = await callApi({
      url: `/properties/${propertyId}/users/`,
      method: "GET",
      params: { page: 1, pageSize: 100, ordering: "-id" },
    });

    if (res) {
      setFilteredUsers(res.data.data.data);
    }
  };

  const fetchApartmentsByProperty = async (propertyId: string) => {
    if (!propertyId) {
      setFilteredApartments([]);
      return;
    }
    const response = await callApi({
      url: `/properties/${propertyId}/apartments/`,
      params: {
        page: 1,
        pageSize: 100,
      },
    });
    if (response && response.status === 200) {
      setFilteredApartments(response.data.data.data);
    }
  };

  const handlePropertyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const value = e.target.value;
    setFieldValue("default_property", value);
    setFieldValue("default_apartment", "");
    setFieldValue("default_assignees", []);
    fetchApartmentsByProperty(value);
    fetchUsersByProperty(value);
  };

  useEffect(() => {
    if (template?.default_property) {
      fetchUsersByProperty(template.default_property);
      fetchApartmentsByProperty(template.default_property);
    }
  }, [template]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await callApi({
          url: "/users/",
          params: { page: 1, pageSize: 100, ordering: "-id" },
        });

        if (isMounted && usersResponse?.status === 200) {
          setUsers(usersResponse.data.data.data);
          setFilteredUsers(usersResponse.data.data.data);
        }

        // Fetch template if editing
        if (id) {
          const templateResponse = await callApi({
            url: `/tasks-templates/${id}/`,
          });

          if (isMounted && templateResponse?.status === 200) {
            const templateData = templateResponse.data;
            console.log("templateData", templateData);
            setTemplate({
              ...templateData,
              default_assignees:
                templateData.default_assignees?.map((u: any) =>
                  u.id.toString()
                ) || [],
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to load data");
        }
      }
    };

    fetchData();
    getProperties();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSubmit = async (values: TaskTemplateData) => {
    try {
      const payload = {
        ...values,
        default_assignees: values.default_assignees.map((id) => parseInt(id)),
      };

      const response = await callApi({
        url: `/tasks-templates/${id}/`,
        method: "PUT",
        body: payload,
      });

      if (response && response.status === 200) {
        toast.success("Template updated successfully!");
        navigate("/tasks-templates-list");
      }
    } catch (error) {
      toast.error("Failed to update template");
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle={"Edit Task Template"} />
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) => theme.palette.grey[100],
          flexGrow: 1,
        }}
      >
        <Toolbar />
        <Container sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <IconButton
                  component={Link}
                  to="/tasks-templates-list"
                  color="inherit"
                >
                  <ArrowBackIcon />
                </IconButton>
              </Grid>
              <Grid item>
                <Typography variant="h6">Edit Task Template</Typography>
              </Grid>
            </Grid>

            <Formik
              enableReinitialize
              initialValues={template || formData}
              validationSchema={TaskTemplateSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, values, setFieldValue, isSubmitting }) => (
                <Form>
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="title"
                        label="Title"
                        fullWidth
                        error={touched.title && !!errors.title}
                        helperText={touched.title && errors.title}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="description"
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        error={touched.description && !!errors.description}
                        helperText={touched.description && errors.description}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="duration"
                        label="Duration in minutes"
                        type="number"
                        fullWidth
                        inputProps={{ step: "0.5", min: "0" }}
                        error={touched.duration && !!errors.duration}
                        helperText={touched.duration && errors.duration}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="priority"
                        label="Priority"
                        select
                        fullWidth
                        error={touched.priority && !!errors.priority}
                        helperText={touched.priority && errors.priority}
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Field>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="default_property"
                        label="Default Property"
                        select
                        fullWidth
                        value={values.default_property || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handlePropertyChange(e, setFieldValue)
                        }
                        error={
                          touched.default_property && !!errors.default_property
                        }
                        helperText={
                          touched.default_property && errors.default_property
                        }
                      >
                        <MenuItem value="">None</MenuItem>
                        {allProperties.map((property) => (
                          <MenuItem
                            key={property.id}
                            value={property.id.toString()}
                          >
                            {property.name} - {property.address}
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="default_apartment"
                        label="Default Apartment"
                        select
                        fullWidth
                        value={values.default_apartment || ""}
                        onChange={(e: SelectChangeEvent<string>) => {
                          setFieldValue("default_apartment", e.target.value);
                        }}
                        error={
                          touched.default_apartment &&
                          !!errors.default_apartment
                        }
                        helperText={
                          touched.default_apartment && errors.default_apartment
                        }
                        disabled={!values.default_property}
                      >
                        <MenuItem value="">None</MenuItem>
                        {filteredApartments.map((apartment) => (
                          <MenuItem
                            key={apartment.id}
                            value={apartment.id.toString()}
                          >
                            {apartment.number} - {apartment.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>

                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={filteredUsers}
                        getOptionLabel={(option) =>
                          `${option.first_name} ${option.last_name} (${option.department})`
                        }
                        value={filteredUsers.filter((u) =>
                          values.default_assignees.includes(u.id.toString())
                        )}
                        onChange={(_, newValue) => {
                          setFieldValue(
                            "default_assignees",
                            newValue.map((u) => u.id.toString())
                          );
                        }}
                        disabled={!values.default_property}
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option.id}
                              label={`${option.first_name} ${option.last_name} (${option.department})`}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Default Assignees"
                            placeholder="Select users"
                            error={
                              touched.default_assignees &&
                              Boolean(errors.default_assignees)
                            }
                            helperText={
                              touched.default_assignees &&
                              errors.default_assignees
                                ? String(errors.default_assignees)
                                : undefined
                            }
                          />
                        )}
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
                        variant="outlined"
                        component={Link}
                        to="/tasks-templates-list"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Update Template"
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

export default TaskTemplateInfo;
