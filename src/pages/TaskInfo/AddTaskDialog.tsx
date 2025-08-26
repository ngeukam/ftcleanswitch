// AddTaskDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Stack,
  Grid,
  Chip,
  Box,
  Tabs,
  Tab,
  Autocomplete,
} from "@mui/material";
import useApi from "../../hooks/APIHandler";
import SearchInput from "../../components/SearchInput";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
// import TaskTemplateDialog from "./TaskTemplateDialog";
import { getUser } from "../../utils/Helper";
import { Link, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

interface AddTaskDialogProps {
  handleChange: () => void;
  searchQuery: string;
  searchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  userId?: string;
  propertyId?: string;
}
interface User {
  id: number;
  first_name: string;
  last_name: string;
  department: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
}

interface TaskTemplate {
  id: number;
  title: string;
  description: string;
  duration: number | null;
  priority: string;
  default_property: string;
  default_assignees: User[];
  default_apartment: string;
}

// Improved form state type
interface TaskFormData {
  title: string;
  description: string;
  due_date: string;
  duration: string;
  assigned_to: string[];
  apartment_assigned: string;
  property_assigned: string;
  status: string;
  priority: string;
  template_id: string;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  handleChange,
  searchQuery,
  searchChange,
  userId,
  propertyId,
}) => {
  const { callApi } = useApi();
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    due_date: "",
    duration: "",
    assigned_to: [] as string[],
    apartment_assigned: "",
    property_assigned: "",
    status: "pending",
    priority: "medium",
    template_id: "",
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [filteredApartments, setFilteredApartments] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchProperties();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const res = await callApi({
      url: "/tasks-templates/",
      params: { page: 1, pageSize: 100, ordering: "-id" },
    });
    if (res) {
      setTemplates(res.data.data.data);
    }
  };

  const fetchUsers = async () => {
    const res = await callApi({
      url: "/users/",
      params: { page: 1, pageSize: 100, ordering: "-id" },
    });
    if (res) {
      const allUsers = res.data.data.data;
      if (userId) {
        const filteredUser = allUsers.filter(
          (prop: any) => prop.id === parseInt(userId)
        );
        setAllUsers(filteredUser);
        setFilteredUsers(filteredUser);
      } else {
        setAllUsers(allUsers);
        setFilteredUsers(allUsers);
      }
    }
  };

  const fetchProperties = async () => {
    const res = await callApi({
      url: "/properties/",
      params: { page: 1, pageSize: 100, ordering: "-id" },
    });
    if (res) {
      const allProperties = res.data.data.data;
      if (propertyId) {
        const filteredProperty = allProperties.filter(
          (prop: any) => prop.id === parseInt(propertyId)
        );
        setProperties(filteredProperty);
      } else {
        setProperties(allProperties);
      }
    }
  };

  const fetchUsersByProperty = async (propertyId: string) => {
    if (!propertyId) {
      setFilteredUsers(allUsers);
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
      return;
    }

    const res = await callApi({
      url: `/properties/${propertyId}/apartments/`,
      params: {
        page: 1,
        pageSize: 100,
      },
    });
    if (res) {
      setFilteredApartments(res.data.data.data);
    }
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: "",
      description: "",
      due_date: "",
      duration: "",
      assigned_to: [],
      property_assigned: "",
      apartment_assigned: "",
      status: "pending",
      priority: "medium",
      template_id: "",
    } as TaskFormData);
    setTabValue(0);
  };

  const handleChangeField = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (!name) return;

    // Convert numeric values to strings to match the form data type
    const processedValue = typeof value === "number" ? value.toString() : value;

    setFormData((prev: TaskFormData) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (name === "property_assigned") {
      setFormData((prev) => ({
        ...prev,
        assigned_to: [],
        apartment_assigned: "",
      }));
      fetchUsersByProperty(processedValue as string);
      fetchApartmentsByProperty(processedValue as string);
    }

    // When handling template selection, ensure property ID is a string
    const selectedTemplate = templates.find((t) => t.id.toString() === value);

    if (selectedTemplate) {
      setFormData((prev) => ({
        ...prev,
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        duration: selectedTemplate.duration?.toString() || "",
        priority: selectedTemplate.priority,
        property_assigned: selectedTemplate.default_property?.toString() || "",
        apartment_assigned: selectedTemplate.default_apartment || "",
        template_id: value as string,
        assigned_to:
          selectedTemplate.default_assignees?.map((u: any) =>
            u.id.toString()
          ) || [],
      }));
      // Fetch apartments for the property from the template
      if (selectedTemplate.default_property) {
        fetchApartmentsByProperty(selectedTemplate.default_property);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      duration: formData.duration ? parseFloat(formData.duration) : null,
      template_id: formData.template_id || null,
    };

    const res = await callApi({
      url: "/tasks/",
      method: "POST",
      body: payload,
    });
    if (res) {
      handleClose();
      toast.success("Task added successfully!");
      handleChange();
    }
  };

  return (
    <div>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <SearchInput value={searchQuery} handleChange={searchChange} />
        <Stack direction="row" spacing={2}>
          {/* <TaskTemplateDialog refreshTemplates={fetchTemplates} /> */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleClickOpen}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              px: 3,
              py: 1,
              fontWeight: 600,
            }}
          >
            Add Task
          </Button>
        </Stack>
      </Stack>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Create from Template" />
              {(getUser()?.role === "admin" ||
                getUser()?.role === "manager") && (
                <Tab label="Create Custom Task" />
              )}
            </Tabs>
          </Box>

          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {tabValue === 0 && (
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Select Template"
                    name="template_id"
                    value={formData.template_id}
                    onChange={handleChangeField}
                  >
                    {templates.map((template) => (
                      <MenuItem
                        key={template.id}
                        value={template.id.toString()}
                      >
                        {template.title} ({template.priority})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChangeField}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  name="due_date"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={formData.due_date}
                  onChange={handleChangeField}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChangeField}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estimated duration in minutes"
                  name="duration"
                  type="number"
                  required
                  disabled={getUser()?.role === "receptionist"}
                  inputProps={{ step: "0.1" }}
                  value={formData.duration}
                  onChange={handleChangeField}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Property Assigned"
                  name="property_assigned"
                  value={formData.property_assigned}
                  onChange={handleChangeField}
                  required
                >
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id.toString()}>
                      {property.name} - {property.address}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChangeField}
                  required
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChangeField}
                  required
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* FormControl to Select Apartments assigned */}
                <TextField
                  select
                  fullWidth
                  label="Apartment Assigned"
                  name="apartment_assigned"
                  value={formData.apartment_assigned}
                  onChange={handleChangeField}
                  disabled={!formData.property_assigned}
                >
                  {filteredApartments.map((apartment) => (
                    <MenuItem key={apartment.id} value={apartment.id}>
                      {apartment.number} - {apartment.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={filteredUsers}
                  getOptionLabel={(option) =>
                    `${option.first_name} ${option.last_name} (${option.department})`
                  }
                  value={filteredUsers.filter((u) =>
                    formData.assigned_to.includes(u.id.toString())
                  )}
                  onChange={(_, newValue) => {
                    setFormData({
                      ...formData,
                      assigned_to: newValue.map((u) => u.id.toString()),
                    });
                  }}
                  disabled={!formData.property_assigned}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
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
                      label="Assigned To"
                      placeholder="Select users"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddTaskDialog;
