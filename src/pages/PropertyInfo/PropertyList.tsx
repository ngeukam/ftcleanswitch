import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  IconButton,
  Toolbar,
  Paper,
  Switch,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Appbar from "../../components/Appbar";
import useApi from "../../hooks/APIHandler";
import AddPropertyDialog from "./AddPropertyDialog";
import { toast } from "react-toastify";
import DeleteConfirmationDialog from "../../components/DeleteConfirmationDialog";

export interface Property {
  id: number;
  name: string;
  address: string;
  country: string;
  town: string;
  latitude: number;
  longitude: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface Ordering {
  field: keyof Property;
  sort: "asc" | "desc";
}
type CustomPaginationModel = {
  page: number;
  pageSize: number;
};
function PropertyList() {
  const { callApi, loading } = useApi();
  const [properties, setProperties] = useState<Property[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [paginationModel, setPaginationModel] = useState<CustomPaginationModel>(
    {
      page: 0,
      pageSize: 5,
    }
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [ordering, setOrdering] = useState<Ordering[]>([
    { field: "id", sort: "desc" },
  ]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    getProperties();
  }, [paginationModel, debounceSearch, ordering]);

  const getProperties = async () => {
    const order =
      ordering.length > 0 && ordering[0].sort === "asc"
        ? ordering[0].field
        : "-" + ordering[0].field;

    const result = await callApi({
      url: "/properties/",
      params: {
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        search: debounceSearch,
        ordering: order,
      },
    });

    if (result) {
      const resultData = result.data.data;
      setProperties(resultData.data);
      setTotalItems(resultData.totalItems);
      generateColumns(resultData.data);
    }
  };

  const handleDeleteClick = (params: GridRenderCellParams) => {
    setSelectedProperty(params.row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedProperty) return;
    setDeleteLoading(true);
    try {
      const response = await callApi({
        url: `/properties/${selectedProperty.id}/`,
        method: "DELETE",
      });

      if (response?.status === 204) {
        toast.success("Property deleted successfully!");
        setDeleteDialogOpen(false);
        setSelectedProperty(null);
        getProperties();
      }
    } catch (err) {
      console.error("Error deleting property:", err);
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteDialog = (): void => {
    if (!deleteLoading) {
      setDeleteDialogOpen(false);
      setSelectedProperty(null);
    }
  };

  const onEditClick = (params: GridRenderCellParams) => {
    navigate(`/properties/edit/${params.row.id}`);
  };
  const toggleStatus = async (id: any, status: boolean) => {
    const result = await callApi({
      url: `/properties/${id}/`,
      method: "PATCH",
      body: { is_active: status },
    });
    if (result) {
      await getProperties();
    }
  };

  const generateColumns = (data: Property[]) => {
    if (data.length === 0) return;

    const baseColumns: GridColDef[] = [
      {
        field: "action",
        headerName: "Actions",
        width: 150,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <>
            {" "}
            <IconButton onClick={() => navigate(`/properties/${params.row.id}`)}>
              <Visibility color="primary" />
            </IconButton>
            <IconButton onClick={() => onEditClick(params)}>
              <Edit color="secondary" />
            </IconButton>
            <IconButton onClick={() => handleDeleteClick(params)}>
              <Delete color="error" />
            </IconButton>
          </>
        ),
      },
      {
        field: "is_active",
        headerName: "Is active",
        width: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Switch
            checked={params.row.is_active}
            onChange={(event) =>
              toggleStatus(params.row.id, event.target.checked)
            }
            color="primary"
          />
        ),
      },
    ];

    const propertyFields: GridColDef[] = Object.keys(data[0])
      .filter((key) => key !== "id" && key !== "is_active") // Exclude is_active since we have custom column
      .map((key) => ({
        field: key,
        headerName:
          key.charAt(0).toUpperCase() + key.slice(1).replaceAll("_", " "),
        width: 200,
        sortable: true,
      }));

    setColumns([...baseColumns, ...propertyFields]);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="Properties Management" />
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
        <Container sx={{ mt: 4, mb: 4 }}>
          <AddPropertyDialog
            properties={properties}
            setProperties={setProperties}
            handleChange={getProperties}
            searchQuery={searchQuery}
            searchChange={(e) => setSearchQuery(e.target.value)}
          />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                {" "}
                {/* Ajout d'un Paper pour le fond blanc */}
                <DataGrid
                  rows={properties}
                  columns={columns}
                  rowHeight={75}
                  autoHeight={true}
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
                    backgroundColor: "white", // Fond blanc du tableau
                    "& .MuiDataGrid-cell": {
                      borderBottom: `1px solid #f0f0f0`, // Lignes de séparation légères
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#f5f5f5", // En-têtes légèrement gris
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
            title="Delete Property"
            description="Are you sure you want to delete this property? This action cannot be undone."
            itemName={
              selectedProperty ? `Property #${selectedProperty.name}` : ""
            }
            confirmText="Delete Property"
            cancelText="Cancel"
          />
        </Container>
      </Box>
    </Box>
  );
}

export default PropertyList;
