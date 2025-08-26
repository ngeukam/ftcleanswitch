import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  IconButton,
  Toolbar,
  Paper,
  Chip,
  Typography,
  Button,
  Switch,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Edit, Delete, PanoramaRounded, Close } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import Appbar from "../../components/Appbar";
import useApi from "../../hooks/APIHandler";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import {
  convertMinutesToHours,
  getPriorityColor,
  getStatusColor,
} from "../../constant";
import { TaskDialog } from "../../components/TaskDialog";
import { toast } from "react-toastify";
import DeleteConfirmationDialog from "../../components/DeleteConfirmationDialog";
import TaskTemplateDialog from "../TaskInfo/AddTaskTemplateDialog";

export interface GalleryImage {
  image: string[];
  order: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  duration: number; // Changed to number for proper calculation
  assigned_to: string;
  status: string;
  added_by_user_id: number;
  priority: string;
  default_property: string;
  default_property_name: string;
  default_apartment: string;
}

interface Ordering {
  field: keyof Task;
  sort: "asc" | "desc";
}

type CustomPaginationModel = {
  page: number;
  pageSize: number;
};

function PropertyTasksTemplate() {
  const { callApi, loading } = useApi();
  const { id } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [paginationModel, setPaginationModel] = useState<CustomPaginationModel>(
    {
      page: 0,
      pageSize: 5, // Set default page size to 5
    }
  );
  const [open, setOpen] = useState(false);
  const [jsonData, setJsonData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [ordering, setOrdering] = useState<Ordering[]>([
    { field: "id", sort: "desc" },
  ]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTaskTemplate, setSelectedTaskTemplate] = useState<any>(null);
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
    if (!id) return
    fetchTemplates();
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

  const fetchTemplates = async () => {
    const order =
      ordering.length > 0 && ordering[0].sort === "asc"
        ? ordering[0].field
        : "-" + ordering[0].field;

    const result = await callApi({
      url: `/properties/${id}/tasks-template/`,
      params: {
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        search: debounceSearch,
        ordering: order,
      },
    });

    if (result) {
      const resultData = result.data.data;
      setTasks(resultData.data);
      setTotalItems(resultData.totalItems);
      generateColumns(resultData.data);
    }
  };
  const toggleStatus = async (id: any, status: boolean) => {
    const result = await callApi({
      url: `/tasks-templates/${id}/`,
      method: "PATCH",
      body: { active: status },
    });
    if (result) {
      await fetchTemplates();
    }
  };

  const handleDeleteClick = (params: GridRenderCellParams) => {
    setSelectedTaskTemplate(params.row);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedTaskTemplate) return;
    setDeleteLoading(true);
    try {
      const response = await callApi({
        url: `/tasks-templates/${selectedTaskTemplate.id}/`,
        method: "DELETE",
      });

      if (response?.status === 204) {
        toast.success("Task Template deleted successfully!");
        setDeleteDialogOpen(false);
        setSelectedTaskTemplate(null);
        fetchTemplates();
      }
    } catch (err) {
      console.error("Error deleting task template:", err);
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteDialog = (): void => {
    if (!deleteLoading) {
      setDeleteDialogOpen(false);
      setSelectedTaskTemplate(null);
    }
  };

  const onEditClick = (params: GridRenderCellParams) => {
    navigate(`/tasks-templates/edit/${params.row.id}`);
  };

  const generateColumns = (data: Task[]) => {
    if (data.length === 0) return;

    const baseColumns: GridColDef[] = [
      {
        field: "action",
        headerName: "Actions",
        width: 100,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <>
            <IconButton onClick={() => onEditClick(params)}>
              <Edit color="secondary" />
            </IconButton>
            <IconButton onClick={() => handleDeleteClick(params)}>
              <Delete color="error" />
            </IconButton>
          </>
        ),
      },
    ];

    const taskFields: GridColDef[] = Object.keys(data[0])
      .filter(
        (key) =>
          ![
            "assigned_to",
            "property_assigned",
            "property_info",
            "default_property",
            "default_apartment",
            "id",
          ].includes(key)
      )
      .map((key) => {
        // if (key === "id") {
        //   return {
        //     field: key,
        //     headerName: "Id",
        //     width: 80,
        //     sortable: true,
        //   };
        // }
        if (key === "default_assignees") {
          return {
            field: key,
            headerName: "Default Assignees",
            width: 150,
            sortable: false,
            renderCell: (params: any) => {
              return (
                <Button
                  onClick={() =>
                    showJSONData(
                      params.row.default_assignees,
                      key.charAt(0).toUpperCase() +
                        key.slice(1).replaceAll("_", " ")
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
        if (key === "status") {
          return {
            field: key,
            headerName: "Status",
            width: 130,
            renderCell: (params: GridRenderCellParams) => (
              <Chip
                label={
                  params.value.charAt(0).toUpperCase() +
                  params.value.slice(1).replaceAll("_", " ")
                }
                style={{
                  backgroundColor: getStatusColor(params.value),
                  color: "#fff",
                }}
              />
            ),
          };
        }
        if (key === "priority") {
          return {
            field: key,
            headerName: "Priority",
            width: 140,
            renderCell: (params: GridRenderCellParams) => (
              <Chip
                label={
                  params.value.charAt(0).toUpperCase() + params.value.slice(1)
                }
                style={{
                  backgroundColor: getPriorityColor(params.value),
                  color: "#fff",
                }}
              />
            ),
          };
        }
        if (key === "duration") {
          return {
            field: key,
            headerName: "Duration",
            width: 140,
            renderCell: (params: GridRenderCellParams) => (
              <Typography>{convertMinutesToHours(params.value)}</Typography>
            ),
          };
        }
        if (key === "active") {
          return {
            field: key,
            headerName: "Is Active",
            width: 150,
            renderCell: (params) => {
              return params.row.active === true ? (
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

        return {
          field: key,
          headerName:
            key.charAt(0).toUpperCase() + key.slice(1).replaceAll("_", " "),
          width: 200,
          sortable: true,
        };
      });

    setColumns([...baseColumns, ...taskFields]);
  };

  const showJSONData = (item: any, title: any) => {
    setModalTitle(title);
    setJsonData(item);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Box sx={{ display: "flex" }}>
      <Appbar 
        appBarTitle={`${property[0]?.name} - ${property[0]?.address}: Tasks Templates`}
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
          <TaskTemplateDialog
            refreshTemplates={fetchTemplates}
            propertyId={`${id}`}
          />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <DataGrid
                  rows={tasks}
                  columns={columns}
                  getRowId={(row) => row.id}
                  rowHeight={75}
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
          <TaskDialog
            open={open}
            handleClose={handleClose}
            modalTitle="Assigned Users"
            maxWidth="xs"
            jsonData={jsonData}
            enableAnimations={true}
          />
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleDeleteConfirm}
            loading={deleteLoading}
            title="Delete Task Template"
            description="Are you sure you want to delete this task? This action cannot be undone."
            itemName={
              selectedTaskTemplate
                ? `Task Template #${selectedTaskTemplate.title}`
                : ""
            }
            confirmText="Delete Task"
            cancelText="Cancel"
          />
        </Container>
      </Box>
    </Box>
  );
}

export default PropertyTasksTemplate;
