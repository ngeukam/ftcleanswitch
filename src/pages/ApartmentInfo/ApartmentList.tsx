import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  IconButton,
  Toolbar,
  Paper,
  Switch,
  Chip,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Edit, Delete, Bed, People, Hotel } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Appbar from "../../components/Appbar";
import useApi from "../../hooks/APIHandler";
import AddApartmentDialog from "./AddApartmentDialog";
import { getUser } from "../../utils/Helper";
import { toast } from "react-toastify";
import DeleteConfirmationDialog from "../../components/DeleteConfirmationDialog";

export interface Apartment {
  number: number;
  name: string;
  property_assigned: {
    id: number;
    name: string;
    addrress:string;
  } | null;
  capacity: number;
  numberOfBeds: number;
  apartmentType: string;
  inService: boolean;
  cleaned: boolean;
  price: number;
  currency: string;
  image: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Ordering {
  field: keyof Apartment;
  sort: "asc" | "desc";
}

type CustomPaginationModel = {
  page: number;
  pageSize: number;
};

function ApartmentList() {
  const { callApi, loading } = useApi();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [paginationModel, setPaginationModel] = useState<CustomPaginationModel>(
    {
      page: 0,
      pageSize: 10,
    }
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [ordering, setOrdering] = useState<Ordering[]>([
    { field: "number", sort: "desc" },
  ]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    getApartments();
    fetchProperties();
  }, [paginationModel, debounceSearch, ordering]);

  const fetchProperties = async () => {
    const result = await callApi({
      url: "/properties/",
      params: { page: 1, pageSize: 100, ordering: "-id" }, // Get all properties for dropdown
    });
    if (result) {
      setProperties(result.data.data.data);
    }
  };

  const getApartments = async () => {
    const order =
      ordering.length > 0 && ordering[0].sort === "asc"
        ? ordering[0].field
        : "-" + ordering[0].field;

    const result = await callApi({
      url: "/apartments/",
      params: {
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        search: debounceSearch,
        ordering: order,
      },
    });

    if (result) {
      const resultData = result.data.data;
      setApartments(resultData.data);
      setTotalItems(resultData.totalItems);
      generateColumns(resultData.data);
    }
  };

  const handleDeleteClick = (params: GridRenderCellParams) => {
    setSelectedApartment(params.row);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedApartment) return;
    setDeleteLoading(true);
    try {
      const response = await callApi({
        url: `/apartments/${selectedApartment.id}/`,
        method: "DELETE",
      });

      if (response?.status === 204) {
        toast.success("Apartment deleted successfully!");
        setDeleteDialogOpen(false);
        setSelectedApartment(null);
        getApartments();
      }
    } catch (err) {
      console.error("Error deleting apartment:", err);
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteDialog = (): void => {
    if (!deleteLoading) {
      setDeleteDialogOpen(false);
      setSelectedApartment(null);
    }
  };

  const onEditClick = (params: GridRenderCellParams) => {
    navigate(`/apartments/edit/${params.row.id}/${params.row.number}`);
  };

  const toggleStatus = async (id: number, status: boolean) => {
    const result = await callApi({
      url: `/apartments/${id}/`,
      method: "PATCH",
      body: { is_active: status },
    });
    if (result) {
      await getApartments();
    }
  };

  const renderApartmentType = (type: string) => {
    const colorMap: Record<string, any> = {
      king: "primary",
      luxury: "secondary",
      normal: "info",
      economic: "warning",
    };

    return (
      <Chip
        label={type.charAt(0).toUpperCase() + type.slice(1)}
        color={colorMap[type] || "default"}
        size="small"
      />
    );
  };

  const renderStatusChips = (params: GridRenderCellParams) => {
    return (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Chip
          icon={<Hotel fontSize="small" />}
          label={params.row.inService ? "In Service" : "Out of Service"}
          color={params.row.inService ? "success" : "error"}
          size="small"
        />
        <Chip
          icon={<Bed fontSize="small" />}
          label={params.row.cleaned ? "Cleaned" : "Needs Cleaning"}
          color={params.row.cleaned ? "success" : "warning"}
          size="small"
        />
      </Box>
    );
  };

  const generateColumns = (data: Apartment[]) => {
    if (data.length === 0) return;

    const baseColumns: GridColDef[] = [
      {
        field: "action",
        headerName: "Actions",
        width: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <>
            <IconButton onClick={() => onEditClick(params)} size="small">
              <Edit color="secondary" fontSize="small" />
            </IconButton>
            <IconButton onClick={() => handleDeleteClick(params)} size="small">
              <Delete color="error" fontSize="small" />
            </IconButton>
          </>
        ),
      },
      {
        field: "number",
        headerName: "Apartment #",
        width: 120,
        sortable: true,
      },
      {
        field: "name",
        headerName: "Name",
        width: 180,
        sortable: true,
      },
      {
        field: "property_assigned",
        headerName: "Property",
        width: 180,
        sortable: true,
        valueGetter: (params) => params.row.property_assigned_name || "None",
      },
      {
        field: "property_address",
        headerName: "Address",
        width: 180,
        sortable: true,
        valueGetter: (params) => params.row.property_address || "None",
      },
      {
        field: "apartmentType",
        headerName: "Type",
        width: 120,
        renderCell: (params: GridRenderCellParams) =>
          renderApartmentType(params.row.apartmentType),
      },
      {
        field: "capacity",
        headerName: "Capacity",
        width: 100,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <People fontSize="small" color="action" />
            {params.row.capacity}
          </Box>
        ),
      },
      {
        field: "numberOfBeds",
        headerName: "Beds",
        width: 100,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Bed fontSize="small" color="action" />
            {params.row.numberOfBeds}
          </Box>
        ),
      },
      {
        field: "price",
        headerName: "Price",
        width: 120,
        renderCell: (params: GridRenderCellParams) =>
          `${params.row.currency}${" "}${params.row.price?.toLocaleString() || "0.00"}`,
      },
      {
        field: "status",
        headerName: "Status",
        width: 250,
        renderCell: renderStatusChips,
      },
    ];
    // Conditionally add admin column
    if (getUser()?.role === "admin") {
      baseColumns.push({
        field: "is_active",
        headerName: "Active",
        width: 100,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Switch
            checked={params.row.is_active}
            onChange={(event) =>
              toggleStatus(params.row.id, event.target.checked)
            }
            color="primary"
            size="small"
          />
        ),
      });
    }

    setColumns(baseColumns);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="Apartments Management" />
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <AddApartmentDialog
            properties={properties}
            apartments={apartments}
            setApartments={setApartments}
            handleChange={getApartments}
            searchQuery={searchQuery}
            searchChange={(e) => setSearchQuery(e.target.value)}
          />
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <DataGrid
                  rows={apartments}
                  columns={columns}
                  getRowId={(row) => row.number}
                  rowHeight={70}
                  autoHeight
                  page={paginationModel.page}
                  pageSize={paginationModel.pageSize}
                  onPageChange={(newPage) =>
                    setPaginationModel((prev) => ({ ...prev, page: newPage }))
                  }
                  onPageSizeChange={(newPageSize) =>
                    setPaginationModel((prev) => ({
                      ...prev,
                      pageSize: newPageSize,
                    }))
                  }
                  rowsPerPageOptions={[5, 10, 25]}
                  rowCount={totalItems}
                  paginationMode="server"
                  loading={loading}
                  sx={{
                    "& .MuiDataGrid-cell": {
                      borderBottom: `1px solid #f0f0f0`,
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#f5f5f5",
                      borderBottom: "2px solid #e0e0e0",
                    },
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleDeleteConfirm}
            loading={deleteLoading}
            title="Delete Apartment"
            description="Are you sure you want to delete this apartment? This action cannot be undone."
            itemName={selectedApartment ? `Apartment #${selectedApartment.number}` : ""}
            confirmText="Delete Apartment"
            cancelText="Cancel"
          />
        </Container>
      </Box>
    </Box>
  );
}

export default ApartmentList;
