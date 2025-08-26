// TaskTemplateDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Box,
  Autocomplete,
} from "@mui/material";
import useApi from "../../hooks/APIHandler";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";

const priorityOptions = ["low", "medium", "high"];

interface TaskTemplateDialogProps {
  refreshTemplates: () => void;
  propertyId?: string;
}

const AddTaskTemplateDialog: React.FC<TaskTemplateDialogProps> = ({
  refreshTemplates,
  propertyId,
}) => {
  const { callApi } = useApi();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    priority: "medium",
    default_assignees: [] as string[],
    default_property: "",
    default_apartment: "",
  });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allProperties, setProperties] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [filteredApartments, setFilteredApartments] = useState<any[]>([]);

  useEffect(() => {
    fetchUsersByProperty(formData.default_property);
    fetchApartmentsByProperty(formData.default_property);
  }, [formData.default_property]);

  useEffect(() => {
    fetchUsers();
    fetchProperties();
  }, []);

  const fetchUsers = async () => {
    const res = await callApi({
      url: "/users/",
      params: { page: 1, pageSize: 100, ordering: "-id" },
    });
    if (res) {
      setAllUsers(res.data.data.data);
      setFilteredUsers(res.data.data.data);
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

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: "",
      description: "",
      duration: "",
      priority: "medium",
      default_assignees: [],
      default_property: "",
      default_apartment: "",
    });
  };

  function handleChangeField(
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { name?: string; value: unknown } }
  ): void {
    const { name, value } = e.target;
    if (!name) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "default_property") {
      setFormData((prev) => ({
        ...prev,
        default_assignees: [],
        default_apartment: "",
      }));
    }
  }

  const handleSubmit = async () => {
    const res = await callApi({
      url: "/tasks-templates/",
      method: "POST",
      body: {
        ...formData,
        duration: formData.duration ? parseFloat(formData.duration) : null,
      },
    });
    if (res) {
      handleClose();
      toast.success("Template created successfully!");
      refreshTemplates();
    }
  };

  return (
    <>
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
          mb: 2,
          ml: 2,
        }}
      >
        New Template
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Create New Task Template</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
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
                  inputProps={{ step: "0.1" }}
                  value={formData.duration}
                  onChange={handleChangeField}
                />
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
                  {priorityOptions.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Default Property"
                  name="default_property"
                  value={formData.default_property}
                  onChange={handleChangeField}
                  required
                >
                  {allProperties.map((property) => (
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
                  label="Default Apartment"
                  name="default_apartment"
                  value={formData.default_apartment}
                  onChange={handleChangeField}
                  required
                  disabled={!formData.default_property}
                >
                  {filteredApartments.map((apartment) => (
                    <MenuItem
                      key={apartment.id}
                      value={apartment.id.toString()}
                    >
                      {apartment.number} - {apartment.name}
                    </MenuItem>
                  ))}
                </TextField>
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
                    formData.default_assignees.includes(u.id.toString())
                  )}
                  onChange={(_, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      default_assignees: newValue.map((u) => u.id.toString()),
                    }));
                  }}
                  disabled={!formData.default_property}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={`${option.first_name} ${option.last_name}`}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Default Assignees"
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
            Create Template
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTaskTemplateDialog;
