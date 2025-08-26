import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  IconButton,
  Toolbar,
  Paper,
  Avatar,
  Chip,
  Typography,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Edit,
  Delete,
  Person,
  Email,
  Phone,
  Apartment,
  Bookmark,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import Appbar from "../../components/Appbar";
import useApi from "../../hooks/APIHandler";
import { toast } from "react-toastify";
import DeleteConfirmationDialog from "../../components/DeleteConfirmationDialog";
import { Guest } from "../GuestInfo/types";
import AddGuestDialog from "../GuestInfo/AddGuestDialog";

interface Ordering {
  field: keyof Guest;
  sort: "asc" | "desc";
}

type CustomPaginationModel = {
  page: number;
  pageSize: number;
};

function PropertyGuests() {
  const { callApi, loading } = useApi();
  const { id } = useParams();
  const [guests, setGuests] = useState<Guest[]>([]);
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
    { field: "id", sort: "desc" },
  ]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [property, setProperty] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    getGuests();
    fetchProperty();
  }, [paginationModel, debounceSearch, ordering, id]);

  const fetchProperty = async () => {
    const result = await callApi({
      url: `/properties/${id}/`,
    });
    if (result) {
      setProperty([result.data]);
    }
  };

  const getGuests = async () => {
    const order =
      ordering.length > 0 && ordering[0].sort === "asc"
        ? ordering[0].field
        : "-" + ordering[0].field;

    const result = await callApi({
      url: `/properties/${id}/guests/`,
      params: {
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        search: debounceSearch,
        ordering: order,
      },
    });
    if (result) {
      const resultData = result.data.data;
      setGuests(resultData.data || resultData);
      setTotalItems(resultData.totalItems || resultData.length);
      generateColumns(resultData.data || resultData);
    }
  };

  const handleDeleteClick = (params: GridRenderCellParams) => {
    setSelectedGuest(params.row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedGuest) return;
    setDeleteLoading(true);
    try {
      const response = await callApi({
        url: `/guests/${selectedGuest.id}/`,
        method: "DELETE",
      });

      if (response?.status === 204) {
        toast.success("Guest deleted successfully!");
        setDeleteDialogOpen(false);
        setSelectedGuest(null);
        getGuests();
      }
    } catch (err) {
      console.error("Error deleting guest:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseDeleteDialog = (): void => {
    if (!deleteLoading) {
      setDeleteDialogOpen(false);
      setSelectedGuest(null);
    }
  };

  const onEditClick = (params: GridRenderCellParams) => {
    navigate(`/guests/edit/${params.row.id}`);
  };

  const onViewClick = (params: GridRenderCellParams) => {
    navigate(`/guests/${params.row.id}`);
  };

  const generateColumns = (data: Guest[]) => {
    if (data.length === 0) return;

    const baseColumns: GridColDef[] = [
      {
        field: "action",
        headerName: "Actions",
        width: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box>
            <IconButton onClick={() => onViewClick(params)} size="small">
              <Person color="primary" />
            </IconButton>
            <IconButton onClick={() => onEditClick(params)} size="small">
              <Edit color="secondary" />
            </IconButton>
            <IconButton onClick={() => handleDeleteClick(params)} size="small">
              <Delete color="error" />
            </IconButton>
          </Box>
        ),
      },
      {
        field: "avatar",
        headerName: "Guest",
        width: 250,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
             <img
              src={`https://ui-avatars.com/api/?name=${params.row.user?.first_name?.[0]}+${params.row.user?.last_name?.[0]}&background=random&rounded=true`}
              alt="avatar"
              style={{ width: 40, height: 40, borderRadius: "50%" }}
            />
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {params.row.user?.first_name} {params.row.user?.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Guest #{params.row.id}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: "contact",
        headerName: "Contact Info",
        width: 250,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Email fontSize="small" color="action" />
              <Typography variant="body2">{params.row.user?.email}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Phone fontSize="small" color="action" />
              <Typography variant="body2">{params.row.user?.phone}</Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: "current_apartment",
        headerName: "Current Stay",
        width: 200,
        sortable: false,
        renderCell: (params: GridRenderCellParams) =>
          params.row.current_apartment ? (
            <Tooltip title={`Apt ${params.row.current_apartment}`}>
              <Chip
                icon={<Apartment />}
                label={`Apt ${params.row.current_apartment}`}
                color="success"
                size="small"
                variant="filled"
              />
            </Tooltip>
          ) : (
            <Tooltip title="Not Checked In">
              <Chip
                label="Not Checked In"
                color="default"
                size="small"
                variant="outlined"
              />
            </Tooltip>
          ),
      },
      {
        field: "booking_count",
        headerName: "Bookings",
        width: 120,
        sortable: true,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            icon={<Bookmark />}
            label={params.row.booking_count || 0}
            size="small"
            variant="outlined"
          />
        ),
      },
    ];

    setColumns(baseColumns);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle={`${property[0]?.name} - ${property[0]?.address}: Guests`}/>
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
          {/* Search and Add Button */}
          <AddGuestDialog
            handleChange={getGuests}
            searchQuery={searchQuery}
            searchChange={(e) => setSearchQuery(e.target.value)}
            hideButtonAdd={true}
          />
          {/* Data Grid */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <DataGrid
                  rows={guests}
                  columns={columns}
                  rowHeight={80}
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
                    backgroundColor: "white",
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

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleDeleteConfirm}
            loading={deleteLoading}
            title="Delete Guest"
            description="Are you sure you want to delete this guest? This action cannot be undone and will also delete their user account."
            itemName={
              selectedGuest
                ? `${selectedGuest.user?.first_name} ${selectedGuest.user?.last_name}`
                : ""
            }
            confirmText="Delete Guest"
            cancelText="Cancel"
          />
        </Container>
      </Box>
    </Box>
  );
}

export default PropertyGuests;
