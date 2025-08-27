// AddUserDialog.tsx (main component)
import * as React from "react";
import { Box, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import UserFormDialog from "./UserFormDialog";
import UserFormHeader from "./UserFormHeader";
import UserFormContent from "./UserFormContent";
import UserFormActions from "./UserFormActions";
import { FormValues } from "./types";
import useApi from "../../../hooks/APIHandler";
import SearchInput from "../../../components/SearchInput";
import { Property } from "../../PropertyInfo/PropertyList";
import { Refresh } from "@mui/icons-material";

interface AddUserDialogProps {
  handleChange: () => void;
  searchQuery: string;
  searchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  propertyId?: string;
  handleRefresh?:() => void;
}

export default function AddUserDialog({
  handleChange,
  searchQuery,
  searchChange,
  propertyId,
  handleRefresh,
}: AddUserDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { callApi, loading } = useApi();
  const [properties, setProperties] = React.useState<Property[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      properties: [],
    },
  });

  React.useEffect(() => {
    if (open) {
      const fetchProperties = async () => {
        const response = await callApi({
          url: "/properties/",
          params: {
            page: 1,
            pageSize: 100,
            ordering: "-id",
          },
        });
        if (response) {
          const allProperties = response.data.data.data;
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
      fetchProperties();
    }
  }, [open]);

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const onSubmit = async (data: FormValues) => {
    const response = await callApi({
      url: "/user/create/",
      method: "POST",
      body: {
        ...data,
        properties_assigned: data.properties.map((id) => parseInt(id)),
      },
    });

    if (response?.status === 201) {
      handleChange();
      toast.success("User added successfully!");
      handleClose();
    }
  };

  return (
    <div>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: "background.paper",
          borderRadius: 1,
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
        }}
      >
        <SearchInput value={searchQuery} handleChange={searchChange} />
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => handleRefresh}
            sx={{ mr: 2, borderRadius: 1, textTransform: "none" }}
          >
            Refresh
          </Button>
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
            Add User
          </Button>
        </Box>
      </Stack>

      <UserFormDialog
        open={open}
        handleClose={handleClose}
        onSubmit={handleSubmit(onSubmit)}
        loading={loading}
      >
        <UserFormHeader title="Add New User" />
        <UserFormContent
          properties={properties}
          control={control}
          register={register}
          errors={errors}
          watch={watch}
        />
        <UserFormActions handleClose={handleClose} loading={loading} />
      </UserFormDialog>
    </div>
  );
}
