import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  IconButton,
  Toolbar,
  Button,
  Dialog,
  DialogContent,
  Typography,
  Paper,
  Switch,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Edit,
  Delete,
  BarChart,
  CalendarMonth,
  ReceiptLong as ReceiptLongIcon,
} from "@mui/icons-material";
import Appbar from "../../components/Appbar";
import useApi from "../../hooks/APIHandler";
import { useNavigate, useParams } from "react-router-dom";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import { PropertyDialog } from "../../components/PropertyDialog";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { toast } from "react-toastify";
import DeleteConfirmationDialog from "../../components/DeleteConfirmationDialog";
import AddUserDialog from "../UserInfo/AddUserDialog/AddUserDialog";

interface Property {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  properties_assigned: Property[];
  created_at: string;
  updated_at: string;
}

interface Ordering {
  field: keyof User;
  sort: "asc" | "desc";
}

type CustomPaginationModel = {
  page: number;
  pageSize: number;
};

const PropertyUsers = () => {
  const { callApi, loading } = useApi();
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  console.log("users", users);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [jsonData, setJsonData] = useState([]);
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState<CustomPaginationModel>(
    {
      page: 0,
      pageSize: 5,
    }
  );
  const [ordering, setOrdering] = useState<Ordering[]>([
    { field: "id", sort: "desc" },
  ]);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSchedules, setUserSchedules] = useState<any[]>([]);
  const [calendarView, setCalendarView] = useState("dayGridMonth");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [property, setProperty] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = async () => {
    let order = "-id";
    if (ordering.length > 0) {
      order =
        ordering[0].sort === "asc"
          ? ordering[0].field
          : "-" + ordering[0].field;
    }

    const res = await callApi({
      url: `/properties/${id}/users/`,
      params: {
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        search: debounceSearch,
        ordering: order,
      },
    });

    if (res) {
      const resultData = res.data.data;
      setUsers(resultData.data);
      setTotalItems(resultData.totalItems);
      generateColumns(resultData.data);
    }
  };
  const fetchProperty = async () => {
    const result = await callApi({
      url: `/properties/${id}/`,
    });
    if (result) {
      setProperty([result.data]);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchUsers();
    fetchProperty();
  }, [paginationModel, debounceSearch, ordering, id]);

  const handleDeleteClick = (params: any) => {
    setSelectedUser(params);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedUser) return;
    setDeleteLoading(true);
    try {
      const response = await callApi({
        url: `/user/${selectedUser.id}/`,
        method: "DELETE",
      });

      if (response?.status === 204) {
        toast.success("User deleted successfully!");
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteDialog = (): void => {
    if (!deleteLoading) {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleEdit = (params: any) => {
    navigate(`/users/edit/${params.id}`);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const showJSONData = (item: any, title: any) => {
    setModalTitle(title);
    setJsonData(item);
    setOpen(true);
  };

  const handleShedule = async (params: any) => {
    try {
      const response = await callApi({ url: `/user/schedules/${params.id}/` });
      if (response?.status === 200) {
        if (response.data.length === 0) {
          toast.info("There is no schedule for this user");
          return;
        }
        setUserSchedules(response.data);
        setSelectedUser(params);
        setOpenCalendar(true);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };
  const handleViewChange = (viewInfo: any) => {
    setCalendarView(viewInfo.view.type);
  };

  const toggleStatus = async (id: any, status: boolean) => {
    const result = await callApi({
      url: `/user/update/${id}/`,
      method: "PATCH",
      body: { is_active: status },
    });
    if (result) {
      await fetchUsers();
    }
  };

  const generateColumns = (data: any[]) => {
    if (data.length === 0) return;
    const sample = data[0];
    const fields: GridColDef[] = Object.keys(sample)
      .filter((key) => key !== "id")
      .map((key) => ({
        field: key,
        headerName:
          key.charAt(0).toUpperCase() + key.slice(1).replaceAll("_", " "),
        width: 180,
        sortable: true,
      }));

    let columns = [
      {
        field: "",
        width: 80,
        sortable: false,
        renderCell: (params: any) => (
          <img
            src={`https://ui-avatars.com/api/?name=${params.row.first_name}+${params.row.last_name}&background=random&rounded=true`}
            alt="avatar"
            style={{ width: 40, height: 40, borderRadius: "50%" }}
          />
        ),
      },
      {
        field: "action",
        headerName: "Actions",
        width: 230,
        sortable: false,
        renderCell: (params: any) => (
          <>
            <IconButton onClick={() => handleEdit(params.row)}>
              <Edit color="secondary" />
            </IconButton>
            <IconButton>
              <BarChart color="warning" />
            </IconButton>
            <IconButton onClick={() => handleShedule(params.row)}>
              <CalendarMonth color="info" />
            </IconButton>
            <IconButton
              onClick={() =>
                navigate(
                  `/tasks/${params.row.id}/${params.row.first_name}/${params.row.last_name}`
                )
              }
            >
              <ReceiptLongIcon color="inherit" />
            </IconButton>
            <IconButton onClick={() => handleDeleteClick(params.row)}>
              <Delete color="error" />
            </IconButton>
          </>
        ),
      },
      ...fields,
    ];

    columns = columns.map((column) => {
      if (column.field === "is_active") {
        return {
          field: column.field,
          headerName: "Status",
          width: 150,
          renderCell: (params) => {
            return params.row.is_active === true ? (
              <Switch
                checked={true}
                onClick={() => toggleStatus(params.row.id, false)}
              />
            ) : (
              <Switch
                checked={false}
                onClick={() => toggleStatus(params.row.id, true)}
              />
            );
          },
        };
      }
      if (column.field === "properties_assigned") {
        return {
          field: column.field,
          headerName:
            column.field.charAt(0).toUpperCase() +
            column.field.slice(1).replaceAll("_", " "),
          width: 150,
          sortable: false,
          renderCell: (params: any) => {
            return (
              <Button
                onClick={() =>
                  showJSONData(
                    params.row[column.field],
                    column.field.charAt(0).toUpperCase() +
                      column.field.slice(1).replaceAll("_", " ")
                  )
                }
                startIcon={<ViewCompactIcon />}
                variant="contained"
              >
                View
              </Button>
            );
          },
        };
      }
      return column;
    });

    setColumns(columns);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar
        appBarTitle={`${property[0]?.name} - ${property[0]?.address}: Users`}
      />
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
          <AddUserDialog
            handleChange={fetchUsers}
            searchQuery={searchQuery}
            searchChange={(e) => setSearchQuery(e.target.value)}
            propertyId={`${id}`}
          />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <DataGrid
                  rows={users}
                  columns={columns}
                  getRowId={(row) => row.id}
                  rowHeight={75}
                  autoHeight={true}
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
          <PropertyDialog
            open={open}
            handleClose={handleClose}
            modalTitle="Property"
            maxWidth="xs"
            jsonData={jsonData}
            enableAnimations={true}
          />

          {/* Calendar Dialog */}
          <Dialog
            open={openCalendar}
            onClose={() => setOpenCalendar(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogContent>
              {selectedUser && (
                <Typography variant="h6" gutterBottom>
                  Schedule for {selectedUser.first_name}{" "}
                  {selectedUser.last_name} (
                  {selectedUser.role.charAt(0).toUpperCase() +
                    selectedUser.role.slice(1)}{" "}
                  --- {selectedUser.department})
                </Typography>
              )}
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                timeZone={"UTC"}
                themeSystem="bootstrap3"
                allDaySlot={false}
                initialView="dayGridMonth"
                slotDuration={"01:00:00"}
                editable={true}
                selectable={true}
                selectMirror={true}
                weekNumbers={true}
                dayMaxEvents={true}
                weekends={true}
                nowIndicator={true}
                initialEvents={userSchedules.map((schedule) => ({
                  id: schedule.id,
                  title: `${schedule.hours} hours`,
                  start: schedule.date,
                  allDay: true,
                  extendedProps: {
                    day: schedule.day,
                    weekNumber: schedule.week_number,
                  },
                }))}
                eventsSet={(events) => setUserSchedules(events)}
                viewDidMount={handleViewChange}
                eventContent={(arg) => (
                  <div>
                    <strong>{arg.timeText}</strong>
                    <div>{arg.event.title}</div>
                    {calendarView === "dayGridMonth" && (
                      <small>{arg.event.extendedProps.day}</small>
                    )}
                  </div>
                )}
              />
            </DialogContent>
          </Dialog>
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleDeleteConfirm}
            loading={deleteLoading}
            title="Delete User"
            description="Are you sure you want to delete this user? This action cannot be undone."
            itemName={selectedUser ? `User #${selectedUser.username}` : ""}
            confirmText="Delete User"
            cancelText="Cancel"
          />
        </Container>
      </Box>
    </Box>
  );
};

export default PropertyUsers;
