import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  IconButton,
  Toolbar,
  Button,
  Chip,
  Typography,
  Stack,
  Paper,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Edit,
  Delete,
  Visibility,
  Add,
  Bed,
  LocationOn,
  Business,
  CheckCircle,
  Warning,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Appbar from "../../components/Appbar";
import useApi from "../../hooks/APIHandler";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import DeleteConfirmationDialog from "../../components/DeleteConfirmationDialog";
import SearchInput from "../../components/SearchInput";

interface Booking {
  id: number;
  apartment: {
    id: number;
    name: string;
    number: number;
    currency: string;
    cleaned: boolean;
    property_address: string;
    property_assigned_name: string;
    apartmentType: string;
  };
  guest: {
    id: number;
    user: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    };
  };
  startDate: string;
  endDate: string;
  dateOfReservation: string;
  status: string;
  duration: number;
}
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
      sx={{ ml: 1 }}
    />
  );
};
export default function BookingList() {
  const { callApi, loading } = useApi();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    getBookings();
  }, [paginationModel, debounceSearch]);

  const getBookings = async () => {
    const result = await callApi({
      url: "/bookings/",
      params: {
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        search: debounceSearch,
      },
    });
    if (result) {
      const resultData = result.data.data;
      setBookings(resultData.data);
      setTotalItems(resultData.totalItems);
      generateColumns();
    }
  };

  const handleDeleteClick = (params: GridRenderCellParams) => {
    setSelectedBooking(params.row);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedBooking) return;
    setDeleteLoading(true);
    try {
      const response = await callApi({
        url: `/apartments/bookings/${selectedBooking.id}/`,
        method: "DELETE",
      });

      if (response?.status === 204) {
        toast.success("Booking deleted successfully!");
        setDeleteDialogOpen(false);
        setSelectedBooking(null);
        getBookings();
      }
    } catch (err) {
      console.error("Error deleting booking:", err);
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteDialog = (): void => {
    if (!deleteLoading) {
      setDeleteDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  const generateColumns = () => {
    const columns: GridColDef[] = [
      {
        field: "actions",
        headerName: "Actions",
        width: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <>
            <IconButton onClick={() => navigate(`/bookings/${params.row.id}`)}>
              <Visibility color="primary" />
            </IconButton>
            <IconButton onClick={() => handleDeleteClick(params)}>
              <Delete color="error" />
            </IconButton>
          </>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        renderCell: (params) => (
          <Chip
            label={params.value.toUpperCase().replaceAll("_", " ")}
            color={
              params.value === "active"
                ? "secondary"
                : params.value === "upcoming"
                ? "warning"
                : params.value === "checked_out"
                ? "error"
                : params.value === "checked_in"
                ? "success"
                : "default"
            }
            size="small"
          />
        ),
      },
      {
        field: "apartment",
        headerName: "Apartment",
        width: 220,
        renderCell: (params) => (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              width: "100%",
            }}
          >
            {/* Apartment Number and Name */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Business fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight="bold" noWrap>
                {params.row.apartment?.number} - {params.row.apartment?.name}
              </Typography>
            </Box>

            {/* Property and Address */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LocationOn
                fontSize="small"
                color="action"
                sx={{ fontSize: 14 }}
              />
              <Typography variant="caption" color="text.secondary" noWrap>
                {params.row.apartment?.property_assigned_name} -{" "}
                {params.row.apartment.property_address}
              </Typography>
            </Box>

            {/* Cleaning Status */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}
            >
              <Chip
                icon={
                  params.row.apartment.cleaned ? (
                    <CheckCircle fontSize="small" />
                  ) : (
                    <Warning fontSize="small" />
                  )
                }
                label={
                  params.row.apartment.cleaned ? "Cleaned" : "Needs Cleaning"
                }
                color={params.row.apartment.cleaned ? "success" : "warning"}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  "& .MuiChip-icon": { fontSize: 14 },
                }}
              />
              {renderApartmentType(params.row.apartment.apartmentType)}
            </Box>
          </Box>
        ),
      },
      {
        field: "guest",
        headerName: "Guest",
        width: 220,
        renderCell: (params) => (
          <div>
            <Typography variant="body2" fontWeight="bold">
              {params.row.guest.user?.first_name}{" "}
              {params.row.guest.user?.last_name}
            </Typography>
            <Typography variant="caption">
              {params.row.guest.user?.email}
            </Typography>
            <br />
            <Typography variant="caption">
              {params.row.guest.user?.phone}
            </Typography>
          </div>
        ),
      },
      {
        field: "dates",
        headerName: "Booking Dates",
        width: 220,
        renderCell: (params) => (
          <div>
            <Typography variant="body2">
              {dayjs(params.row.startDate).format("MMM D, YYYY")} -{" "}
              {dayjs(params.row.endDate).format("MMM D, YYYY")}
            </Typography>
            <Typography variant="caption">
              {params.row.duration} nights
            </Typography>
          </div>
        ),
      },
      {
        field: "totalPrice",
        headerName: "Total Price",
        width: 180,
        renderCell: (params) => (
          <div>
            <Typography variant="caption" fontWeight="bold">
              {params.row.apartment.currency}{" "}
              {params.row.totalPrice?.toLocaleString()}
            </Typography>
          </div>
        ),
      },
      {
        field: "dateOfReservation",
        headerName: "Booked On",
        width: 150,
        valueFormatter: (params) => dayjs(params.value).format("MMM D, YYYY"),
      },
    ];
    setColumns(columns);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="Bookings Management" />
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
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <SearchInput
                  value={searchQuery}
                  handleChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate("/bookings/new")}
                  sx={{
                    borderRadius: 1,
                    textTransform: "none",
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                  }}
                >
                  New Booking
                </Button>
              </Stack>
              <Paper elevation={3} sx={{ p: 2 }}>
                <DataGrid
                  rows={bookings}
                  columns={columns}
                  rowHeight={85}
                  // getRowId={(row) => row.id}
                  autoHeight
                  pageSize={paginationModel.pageSize}
                  page={paginationModel.page}
                  paginationMode="server"
                  rowCount={totalItems}
                  loading={loading}
                  rowsPerPageOptions={[5, 10, 25]}
                  onPageChange={(newPage) =>
                    setPaginationModel((prev) => ({ ...prev, page: newPage }))
                  }
                  onPageSizeChange={(newPageSize) =>
                    setPaginationModel((prev) => ({
                      ...prev,
                      pageSize: newPageSize,
                    }))
                  }
                  sx={{
                    "& .MuiDataGrid-cell": {
                      borderBottom: "1px solid #f0f0f0",
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
            title="Delete Booking"
            description="Are you sure you want to delete this booking? This action cannot be undone."
            itemName={selectedBooking ? `Booking #${selectedBooking.id}` : ""}
            confirmText="Delete Booking"
            cancelText="Cancel"
          />
        </Container>
      </Box>
    </Box>
  );
}
