import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  CircularProgress,
  Stack,
  useTheme,
  useMediaQuery,
  Toolbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  IconButton,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  Chip,
} from "@mui/material";
import useApi from "../../hooks/APIHandler";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import Appbar from "../../components/Appbar";
import { useReactToPrint } from "react-to-print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import { Paid, AttachMoney } from "@mui/icons-material";

interface Property {
  id: string;
  name: string;
  address: string;
}

interface SalaryData {
  user_id: number;
  fullName: string;
  total_salary: number;
  currency: string;
  period: string;
  propertyInfo: string;
  role: string;
  status?: "paid" | "pending";
}

const SalaryCalculator: React.FC = () => {
  const theme = useTheme();
  const { callApi, loading, error } = useApi();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [previewData, setPreviewData] = useState<SalaryData[]>([]);
  console.log('previewData',previewData)
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);

  const getProperties = async () => {
    try {
      setIsLoadingProperties(true);
      const response = await callApi({
        url: "/properties/",
        method: "GET",
        params: { pageSize: 100 },
      });
      if (response?.status === 200) {
        setProperties(response.data.data.data);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  useEffect(() => {
    getProperties();
  }, []);

  const handlePreview = async () => {
    if (!startDate || !endDate) {
      toast.info("Please select start and end dates");
      return;
    }
    try {
      const params = {
        start: startDate,
        end: endDate,
        ...(selectedProperty && { property_id: selectedProperty }),
      };

      const queryString = new URLSearchParams(params).toString();
      const res = await callApi({
        url: `/salaries/completed-tasks/preview/?${queryString}`,
      });
      if (res?.data) setPreviewData(res.data);
    } catch (err) {
      console.error("Error fetching preview data:", err);
    }
  };

  const handleSave = async () => {
    if (!previewData.length) {
      toast.error("No preview data to save");
      return;
    }

    try {
      const res = await callApi({
        url: `/salaries/completed-tasks/save/`,
        method: "POST",
        body: {
          start_date: startDate,
          end_date: endDate,
          property_id: selectedProperty || undefined,
          salaries: previewData.map((item) => ({
            user_id: item.user_id,
            total_salary: item.total_salary,
          })),
        },
      });
      if (res?.status === 201) {
        toast.success("Salaries saved successfully!");
        setPreviewData([]);
        setStartDate("");
        setEndDate("");
        setSelectedProperty("");
      }
    } catch (err) {
      toast.error("Failed to save salaries");
      console.error("Error saving salaries:", err);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: tableRef,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
        }
        th {
          background-color: #f2f2f2 !important;
        }
        .total-row {
          background-color: #f9f9f9 !important;
          font-weight: bold;
        }
      }
    `,
  });

  const totalSalary = previewData.reduce(
    (sum, item) => sum + item.total_salary,
    0
  );

  const paidCount = previewData.filter(item => item.status === "paid").length;

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="Salary Calculation" />
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
          <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* Header Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Salary Calculator
              </Typography>
              <Typography color="text.secondary">
                Calculate and manage employee salaries for completed tasks
              </Typography>
            </Box>

            {/* Filter Card */}
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardHeader 
                title="Filter Options"
                sx={{
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  py: 1.5
                }}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Start Date"
                      value={startDate ? dayjs(startDate) : null}
                      onChange={(newValue) =>
                        setStartDate(newValue?.format("YYYY-MM-DD") || "")
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                          InputLabelProps: { shrink: true },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="End Date"
                      value={endDate ? dayjs(endDate) : null}
                      onChange={(newValue) =>
                        setEndDate(newValue?.format("YYYY-MM-DD") || "")
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                          InputLabelProps: { shrink: true },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="property-select-label">Property</InputLabel>
                      <Select
                        labelId="property-select-label"
                        id="property-select"
                        value={selectedProperty}
                        label="Property"
                        onChange={(e) => setSelectedProperty(e.target.value)}
                        disabled={isLoadingProperties}
                      >
                        <MenuItem value="">
                          <em>All Properties</em>
                        </MenuItem>
                        {properties.map((property) => (
                          <MenuItem key={property.id} value={property.id}>
                            {property.name} - {property.address}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {isLoadingProperties && <LinearProgress sx={{ mt: 1 }} />}
                  </Grid>
                </Grid>

                <Stack
                  direction={isMobile ? "column" : "row"}
                  spacing={2}
                  sx={{ mt: 3 }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePreview}
                    disabled={loading || !startDate || !endDate}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                    fullWidth={isMobile}
                    size="large"
                  >
                    {loading ? "Processing..." : "Preview Salaries"}
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleSave}
                    disabled={!previewData.length || loading}
                    fullWidth={isMobile}
                    size="large"
                  >
                    Save All Salaries
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            {previewData.length > 0 && (
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={2}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AttachMoney color="primary" />
                        <Typography color="text.secondary">Total Amount</Typography>
                      </Stack>
                      <Typography variant="h5" fontWeight="bold">
                        {previewData[0]?.currency || "$"}{totalSalary.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={2}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Paid color="success" />
                        <Typography color="text.secondary">Employees</Typography>
                      </Stack>
                      <Typography variant="h5" fontWeight="bold">
                        {previewData.length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Results Section */}
            {previewData.length > 0 && (
              <Card elevation={2} sx={{ mb: 3 }}>
                <Box sx={{ 
                  p: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography variant="h6" fontWeight="bold">
                    Salary Preview
                  </Typography>
                  <Box>
                    <Tooltip title="Print Report">
                      <IconButton onClick={handlePrint} color="primary" size="large">
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export to PDF">
                      <IconButton onClick={handlePrint} color="error" size="large">
                        <PictureAsPdfIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Period: {previewData[0]?.period || ""}
                    {selectedProperty && properties.find(p => p.id === selectedProperty) && (
                      <> • Property: {properties.find(p => p.id === selectedProperty)?.name} - {properties.find(p => p.id === selectedProperty)?.address}</>
                    )}
                  </Typography>
                </Box>
                <Box ref={tableRef}>
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Property</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Salary</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {previewData.map((row) => (
                          <TableRow
                            key={`${row.user_id}-${row.propertyInfo}`}
                            hover
                            sx={{ '&:last-child td': { borderBottom: 0 } }}
                          >
                            <TableCell>
                              <Typography fontWeight="medium">
                                {row.fullName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {row.role.charAt(0).toUpperCase() + row.role.slice(1).replaceAll("_", " ")}
                            </TableCell>
                            <TableCell>{row.propertyInfo}</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="bold">
                                {row.currency}{row.total_salary.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={row.status?.toUpperCase() || "PENDING"}
                                color={row.status === "paid" ? "success" : "warning"}
                                variant="outlined"
                                size="small"
                                sx={{ 
                                  width: 100,
                                  fontWeight: 600,
                                  borderWidth: 2
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow
                          sx={{ backgroundColor: theme.palette.grey[50] }}
                          className="total-row"
                        >
                          <TableCell colSpan={3} sx={{ fontWeight: 600 }}>
                            Total
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {previewData[0]?.currency || "EUR"}
                            {totalSalary.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${paidCount}/${previewData.length} PAID`}
                              color="info"
                              variant="outlined"
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Card>
            )}

            {!loading && previewData.length === 0 && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: 300,
                textAlign: 'center'
              }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No salary data to display
                </Typography>
                <Typography color="text.secondary">
                  Select date range and properties to preview salary calculations
                </Typography>
              </Box>
            )}
          </Container>
        </LocalizationProvider>
      </Box>
    </Box>
  );
};

export default SalaryCalculator;