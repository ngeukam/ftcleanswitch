import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Grid,
  Typography,
  Button,
  Switch,
  Toolbar,
  Container,
  Chip,
  Divider,
  useTheme,
  Card,
  CardHeader,
  CardContent,
  IconButton,
} from "@mui/material";
import useApi from "../../hooks/APIHandler";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import SearchInput from "../../components/SearchInput";
import Appbar from "../../components/Appbar";
import { Delete, Paid, Pending } from "@mui/icons-material";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import DeleteConfirmationDialog from "../../components/DeleteConfirmationDialog";

interface SalaryPeriod {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

interface SalaryRow {
  id: number;
  user_fullName: string;
  user_property: string;
  user_role: string;
  total_salary: number;
  status: "paid" | "pending";
  user_currency: string;
}

interface Ordering {
  field: keyof SalaryRow;
  sort: "asc" | "desc";
}

type CustomPaginationModel = {
  page: number;
  pageSize: number;
};

export default function SalaryList() {
  const theme = useTheme();
  const { callApi, loading, error } = useApi();
  const [periods, setPeriods] = useState<SalaryPeriod[]>([]);
  const [selectedStartDate, setSelectedStartDate] = useState<Dayjs | null>(
    null
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Dayjs | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number | "">("");
  const [salaries, setSalaries] = useState<SalaryRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [debounceSearch, setDebounceSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<CustomPaginationModel>(
    {
      page: 0,
      pageSize: 10,
    }
  );
  const [ordering, setOrdering] = useState<Ordering[]>([
    { field: "id", sort: "desc" },
  ]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<any>(null);
  console.log('selectedSalary',selectedSalary)
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchSalaryPeriods();
  }, []);

  const fetchSalaryPeriods = async () => {
    const res = await callApi({ url: "/salary/periods/" });
    if (res?.status === 200) {
      setPeriods(res.data);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSalariesByDates = async () => {
    if (!selectedStartDate || !selectedEndDate) return;

    let order = "-id";
    if (ordering.length > 0) {
      order =
        ordering[0].sort === "asc"
          ? ordering[0].field
          : "-" + ordering[0].field;
    }

    const startDate = selectedStartDate.format("YYYY-MM-DD");
    const endDate = selectedEndDate.format("YYYY-MM-DD");

    try {
      const res = await callApi({
        url: `/salaries/by-period/?start_date=${startDate}&end_date=${endDate}`,
        params: {
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
          search: debounceSearch,
          ordering: order,
        },
      });

      if (res?.status === 200) {
        setSalaries(res.data.data.data);
        setTotalItems(res.data.data.totalItems);
      }
    } catch (err) {
      console.error("Error fetching salaries:", err);
    }
  };

  useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      fetchSalariesByDates();
    }
  }, [paginationModel, debounceSearch, selectedStartDate, selectedEndDate]);

  const handlePeriodSelect = (periodId: number) => {
    const period = periods.find((p) => p.id === periodId);
    setSelectedPeriod(periodId);
    if (period) {
      setSelectedStartDate(dayjs(period.start_date));
      setSelectedEndDate(dayjs(period.end_date));
      setUseCustomDates(false);
    }
  };

  const toggleStatus = async (id: number, status: boolean) => {
    try {
      await callApi({
        url: `/salary/${id}/`,
        method: "PATCH",
        body: { status: status ? "paid" : "pending" },
      });
      fetchSalariesByDates();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDeleteClick = (params: any) => {
    setSelectedSalary(params);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedSalary) return;
    setDeleteLoading(true);
    try {
      const response = await callApi({
        url: `/salary/${selectedSalary.id}/`,
        method: "DELETE",
      });

      if (response?.status === 204) {
        toast.success("User salary deleted successfully!");
        setDeleteDialogOpen(false);
        setSelectedSalary(null);
        fetchSalariesByDates();
      }
    } catch (err) {
      console.error("Error deleting salary:", err);
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteDialog = (): void => {
    if (!deleteLoading) {
      setDeleteDialogOpen(false);
      setSelectedSalary(null);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "user_fullName",
      headerName: "EMPLOYEE",
      flex: 1,
      renderCell: (params) => (
        <Typography fontWeight="medium">{params.value}</Typography>
      ),
    },
    {
      field: "user_role",
      headerName: "POSITION",
      flex: 1,
      valueFormatter: (params) =>
        params.value.charAt(0).toUpperCase() +
        params.value.slice(1).replaceAll("_", " "),
    },
    {
      field: "user_property",
      headerName: "PROPERTY",
      flex: 1,
    },
    {
      field: "total_salary",
      headerName: "AMOUNT",
      width: 150,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <Typography fontWeight="bold">
          {params.row.user_currency}
          {params.row.total_salary?.toFixed(2) || "0.00"}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "STATUS",
      width: 150,
      renderCell: (params) => (
        <Chip
          icon={params.value === "paid" ? <Paid /> : <Pending />}
          label={params.value.toUpperCase()}
          color={params.value === "paid" ? "success" : "warning"}
          variant="outlined"
          sx={{
            width: 100,
            fontWeight: 600,
            borderWidth: 2,
            ".MuiChip-icon": { marginLeft: "8px" },
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "ACTIONS",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <Switch
            checked={params.row.status === "paid"}
            onChange={(e) => toggleStatus(params.row.id, e.target.checked)}
            color="success"
            size="medium"
          />
          <IconButton onClick={() => handleDeleteClick(params.row)}>
            <Delete color="error" />
          </IconButton>
        </>
      ),
    },
  ];

  const totalAmount = salaries.reduce(
    (sum, item) => sum + item.total_salary,
    0
  );
  const paidCount = salaries.filter((item) => item.status === "paid").length;

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="Salary Management" />
      <Box
        component="main"
        sx={{
          backgroundColor: theme.palette.background.default,
          flexGrow: 1,
          overflow: "auto",
        }}
      >
        <Toolbar />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Salary Reports
              </Typography>
              <Typography color="text.secondary">
                View and manage employee salary payments
              </Typography>
            </Box>

            {/* Filter Section */}
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardHeader
                title="Filter Options"
                sx={{
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  py: 1.5,
                }}
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Payroll Period</InputLabel>
                      <Select
                        label="Select Payroll Period"
                        value={selectedPeriod || ""}
                        onChange={(e) =>
                          handlePeriodSelect(e.target.value as number)
                        }
                        disabled={loading}
                      >
                        {periods.map((p, index) => (
                          <MenuItem key={index} value={p.id}>
                            {p.name} ({dayjs(p.start_date).format("MMM D")} -{" "}
                            {dayjs(p.end_date).format("MMM D, YYYY")})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }}>OR</Divider>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                      label="Start Date"
                      value={selectedStartDate}
                      onChange={setSelectedStartDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          variant: "outlined",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                      label="End Date"
                      value={selectedEndDate}
                      onChange={setSelectedEndDate}
                      //   minDate={selectedStartDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          variant: "outlined",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Button
                      variant="contained"
                      onClick={fetchSalariesByDates}
                      disabled={
                        !selectedStartDate || !selectedEndDate || loading
                      }
                      fullWidth
                      sx={{ height: "40px" }}
                    >
                      {loading ? <CircularProgress size={24} /> : "Apply"}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography color="text.secondary">
                      Total Employees
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {salaries.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography color="text.secondary">Total Amount</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {salaries[0]?.user_currency || "$"}
                      {totalAmount.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography color="text.secondary">Paid</Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {paidCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography color="text.secondary">Pending</Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {salaries.length - paidCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Data Grid Section */}
            <Card elevation={2}>
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Salary Records
                </Typography>
                <SearchInput
                  value={searchQuery}
                  handleChange={(e) => setSearchQuery(e.target.value)}
                />
              </Box>
              <Divider />
              <Box sx={{ height: 600, width: "100%" }}>
                <DataGrid
                  rows={salaries}
                  columns={columns}
                  getRowId={(row) => row.id}
                  rowHeight={70}
                  rowCount={totalItems}
                  page={paginationModel.page}
                  pageSize={paginationModel.pageSize}
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
                  paginationMode="server"
                  loading={loading}
                  sx={{
                    border: "none",
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: theme.palette.grey[100],
                      borderBottom: `2px solid ${theme.palette.divider}`,
                    },
                    "& .MuiDataGrid-cell": {
                      borderBottom: `1px solid ${theme.palette.grey[100]}`,
                    },
                    "& .MuiDataGrid-row:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                />
              </Box>
            </Card>

            {!loading && salaries.length === 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 300,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {useCustomDates
                    ? "No salary records found for the selected period"
                    : "Select a payroll period or date range to view salary data"}
                </Typography>
                <Typography color="text.secondary">
                  {!useCustomDates && "Choose from the filter options above"}
                </Typography>
              </Box>
            )}

            <DeleteConfirmationDialog
              open={deleteDialogOpen}
              onClose={handleCloseDeleteDialog}
              onConfirm={handleDeleteConfirm}
              loading={deleteLoading}
              title="Delete User Salary"
              description="Are you sure you want to delete this salary? This action cannot be undone."
              itemName={
                selectedSalary
                  ? `Salary of user #${selectedSalary.user_fullName}`
                  : ""
              }
              confirmText="Delete Salary"
              cancelText="Cancel"
            />
          </Container>
        </LocalizationProvider>
      </Box>
    </Box>
  );
}
