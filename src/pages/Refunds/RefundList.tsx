import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  IconButton,
  Toolbar,
  Button,
  Typography,
  Stack,
  Paper,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
  Refresh,
  LocationOn,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Appbar from "../../components/Appbar";
import useApi from "../../hooks/APIHandler";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import DeleteConfirmationDialog from "../../components/DeleteConfirmationDialog";
import SearchInput from "../../components/SearchInput";
import StatusChip from "../../components/StatusChip";

interface Refund {
  id: number;
  guest: {
    id: number;
    user: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    };
  };
  reservation: {
    id: number;
    apartment: {
      name: string;
      number: number;
      property_assigned_name: string;
      property_address: string;
      currency: string;
    };
    totalPrice: number;
  };
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  processed_by_name: string;
}

export default function RefundList() {
  const { callApi, loading } = useApi();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  console.log("refunds", refunds);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    getRefunds();
  }, [paginationModel, debounceSearch]);

  const getRefunds = async () => {
    try {
      const result = await callApi({
        url: "/refunds/",
        params: {
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
          search: debounceSearch,
        },
      });

      if (result) {
        const resultData = result.data.data;
        setRefunds(resultData.data);
        setTotalItems(resultData.totalItems);
        generateColumns();
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
    }
  };

  const handleStatusUpdate = async (refundId: number, newStatus: string) => {
    try {
      const response = await callApi({
        url: `/refunds/${refundId}/`,
        method: "PATCH",
        body: { status: newStatus },
      });

      if (response?.status === 200) {
        toast.success(`Refund ${newStatus} successfully!`);
        getRefunds(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating refund status:", error);
    }
  };

  const handleDeleteClick = (params: GridRenderCellParams) => {
    setSelectedRefund(params.row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedRefund) return;
    setDeleteLoading(true);
    try {
      const response = await callApi({
        url: `/refunds/${selectedRefund.id}/`,
        method: "DELETE",
      });

      if (response?.status === 204) {
        toast.success("Refund request deleted successfully!");
        setDeleteDialogOpen(false);
        setSelectedRefund(null);
        getRefunds();
      }
    } catch (error) {
      console.error("Error deleting refund:", error);
      toast.error("Failed to delete refund request");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseDeleteDialog = (): void => {
    if (!deleteLoading) {
      setDeleteDialogOpen(false);
      setSelectedRefund(null);
    }
  };

  const generateColumns = () => {
    const columns: GridColDef[] = [
      {
        field: "actions",
        headerName: "Actions",
        width: 150,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box>
            <IconButton
              onClick={() => navigate(`/refunds/${params.row.id}`)}
              size="small"
            >
              <Visibility color="primary" />
            </IconButton>
            <IconButton
              onClick={() => navigate(`/refunds/${params.row.id}/edit`)}
              size="small"
              disabled={params.row.status !== "pending"}
            >
              <Edit
                color={params.row.status === "pending" ? "primary" : "disabled"}
              />
            </IconButton>
            <IconButton onClick={() => handleDeleteClick(params)} size="small">
              <Delete color="error" />
            </IconButton>
          </Box>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        renderCell: (params) => (
          <StatusChip
            status={params.value}
            labels={{
              pending: "Pending",
              approved: "Approved",
              rejected: "Rejected",
            }}
            colors={{
              pending: "warning",
              approved: "success",
              rejected: "error",
            }}
          />
        ),
      },
      {
        field: "id",
        headerName: "Refund ID",
        width: 120,
        renderCell: (params) => (
          <Typography variant="body2" fontWeight="bold">
            #{params.value}
          </Typography>
        ),
      },
      {
        field: "guest",
        headerName: "Guest",
        width: 220,
        renderCell: (params) => (
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {params.row.guest.user?.first_name}{" "}
              {params.row.guest.user?.last_name}
            </Typography>
            <Typography variant="caption" display="block">
              {params.row.guest.user?.email}
            </Typography>
            <Typography variant="caption">
              {params.row.guest.user?.phone}
            </Typography>
          </Box>
        ),
      },
      {
        field: "reservation",
        headerName: "Reservation Details",
        width: 220,
        renderCell: (params) => (
          <Box>
            <Typography variant="body2" fontWeight="bold">
              Apt {params.row.reservation.apartment.number} -{" "}
              {params.row.reservation.apartment.name}
            </Typography>
            <Box  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LocationOn
                fontSize="small"
                color="action"
                sx={{ fontSize: 14 }}
              />
              <Typography variant="caption" display="block">
                {params.row.reservation.apartment.property_assigned_name} -{" "}
                {params.row.reservation.apartment.property_address}
              </Typography>
            </Box>
            <Typography variant="caption">
              Total: {params.row.reservation.apartment.currency}{" "}
              {params.row.reservation.totalPrice?.toLocaleString()}
            </Typography>
          </Box>
        ),
      },
      {
        field: "amount",
        headerName: "Refund Amount",
        width: 150,
        renderCell: (params) => (
          <Typography variant="body2" fontWeight="bold" color="primary">
            {params.row.reservation.apartment.currency}{" "}
            {params.value?.toLocaleString()}
          </Typography>
        ),
      },
      {
        field: "reason",
        headerName: "Reason",
        width: 200,
        renderCell: (params) => (
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {params.value}
          </Typography>
        ),
      },
      {
        field: "created_at",
        headerName: "Requested On",
        width: 150,
        valueFormatter: (params) => dayjs(params.value).format("MMM D, YYYY"),
      },
      {
        field: "processed_at",
        headerName: "Processed On",
        width: 150,
        valueFormatter: (params) =>
          params.value ? dayjs(params.value).format("MMM D, YYYY") : "-",
      },
      {
        field: "processed_by_name",
        headerName: "Processed By",
        width: 160,
        renderCell: (params) => (
          <Typography variant="body2">
            {params.value ? `${params.value}` : "-"}
          </Typography>
        ),
      },
      {
        field: "quick_actions",
        headerName: "Quick Actions",
        width: 180,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box>
            {params.row.status === "pending" && (
              <Box sx={{display: "flex", flexDirection:"column"}}>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => handleStatusUpdate(params.row.id, "approved")}
                  sx={{ mr: 1, mb: 1, fontSize: "0.7rem" }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={() => handleStatusUpdate(params.row.id, "rejected")}
                  sx={{ fontSize: "0.7rem" }}
                >
                  Reject
                </Button>
              </Box>
            )}
            {params.row.status !== "pending" && (
              <Typography variant="caption" color="text.secondary">
                Processed
              </Typography>
            )}
          </Box>
        ),
      },
    ];
    setColumns(columns);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="Refund Management" />
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
              variant="outlined"
              startIcon={<Refresh />}
              onClick={getRefunds}
              sx={{ mr: 2, borderRadius: 1 }}
            >
              Refresh
            </Button>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <DataGrid
                  rows={refunds}
                  columns={columns}
                  rowHeight={75}
                  autoHeight={true}
                  rowsPerPageOptions={[5, 10, 25]}
                  paginationMode="server"
                  rowCount={totalItems}
                  loading={loading}
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
            title="Delete Refund Request"
            description="Are you sure you want to delete this refund request? This action cannot be undone."
            itemName={selectedRefund ? `Refund #${selectedRefund.id}` : ""}
            confirmText="Delete Request"
            cancelText="Cancel"
          />
        </Container>
      </Box>
    </Box>
  );
}
