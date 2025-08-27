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
  Divider,
  Button,
  Switch,
  Stack,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Edit, Delete, PanoramaRounded, Close } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import Appbar from "../../components/Appbar";
import useApi from "../../hooks/APIHandler";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import {
  convertMinutesToHours,
  formatUtcToDatetimeLocal,
  getPriorityColor,
  getStatusColor,
} from "../../constant";
import RenderImage from "../../components/RenderImage";
import { TaskDialog } from "../../components/TaskDialog";
import { isVideoUrl } from "../../utils/Helper";
import { toast } from "react-toastify";
import DeleteConfirmationDialog from "../../components/DeleteConfirmationDialog";
import AddTaskDialog from "../TaskInfo/AddTaskDialog";

export interface GalleryImage {
  image: string[];
  order: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  duration: number; // Changed to number for proper calculation
  assigned_to: string;
  property_assigned: string;
  apartment_assigned: string;
  status: string;
  added_by_user_id: number;
  priority: string;
  created_at: string;
  updated_at: string;
  gallery_images: GalleryImage[];
}

interface Ordering {
  field: keyof Task;
  sort: "asc" | "desc";
}

type CustomPaginationModel = {
  page: number;
  pageSize: number;
};

function TaskUserList() {
  const { id, first_name, last_name } = useParams();
  const { callApi, loading } = useApi();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [paginationModel, setPaginationModel] = useState<CustomPaginationModel>(
    {
      page: 0,
      pageSize: 5, // Set default page size to 5
    }
  );
  const [showImages, setShowImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [ordering, setOrdering] = useState<Ordering[]>([
    { field: "id", sort: "desc" },
  ]);
  const [jsonData, setJsonData] = useState([]);
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    getTasks();
  }, [paginationModel, debounceSearch]);

  const getTasks = async () => {
    const order =
      ordering.length > 0 && ordering[0].sort === "asc"
        ? ordering[0].field
        : "-" + ordering[0].field;

    const result = await callApi({
      url: `/tasks/?assigned_to=${id}`,
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
      url: `/tasks/${id}/`,
      method: "PATCH",
      body: { active: status },
    });
    if (result) {
      await getTasks();
    }
  };

  const handleDeleteClick = (params: GridRenderCellParams) => {
    setSelectedTask(params.row);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedTask) return;
    setDeleteLoading(true);
    try {
      const response = await callApi({
        url: `/tasks/${selectedTask.id}/`,
        method: "DELETE",
      });

      if (response?.status === 204) {
        toast.success("Task deleted successfully!");
        setDeleteDialogOpen(false);
        setSelectedTask(null);
        getTasks();
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
      setSelectedTask(null);
    }
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
      {
        field: "is_active",
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
      },
    ];

    const taskFields: GridColDef[] = Object.keys(data[0])
      .filter(
        (key) =>
          ![
            "assigned_to",
            "property_assigned",
            "property_info",
            "template",
            "apartment_assigned",
            "apartment_info",
            "added_by_user_id",
            "created_at",
            "updated_at",
            "active",
            "id",
          ].includes(key)
      )
      .map((key) => {
        if (key === "gallery_images") {
          return {
            field: key,
            headerName: "Gallery",
            width: 150,
            sortable: false,
            renderCell: (params) => {
              const galleryImages = params.row.gallery_images || [];
              const firstImage = galleryImages[0]?.image;
              return (
                <Box display="flex" alignItems="center">
                  {firstImage ? (
                    <>
                      <RenderImage
                        data={firstImage}
                        name={`Task ${params.row.id} image`}
                      />
                      {galleryImages.length > 1 && (
                        <Typography variant="caption" ml={1}>
                          +{galleryImages.length - 1}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <PanoramaRounded color="disabled" />
                  )}
                  <IconButton
                    onClick={() => {
                      const allImages = galleryImages.flatMap(
                        (img: any) => img.image || []
                      );
                      setSelectedImages(allImages);
                      setShowImages(true);
                    }}
                    size="small"
                  >
                    <PanoramaRounded />
                  </IconButton>
                </Box>
              );
            },
          };
        }
        if (key === "assigned_to_names") {
          return {
            field: key,
            headerName: "Assigned to",
            width: 150,
            sortable: false,
            renderCell: (params: any) => {
              return (
                <Button
                  onClick={() =>
                    showJSONData(
                      params.row.assigned_to_names,
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
        // if (key === "id") {
        //   return {
        //     field: key,
        //     headerName: "Id",
        //     width: 80,
        //     sortable: true,
        //   };
        // }
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
        if (key === "due_date") {
          return {
            field: key,
            headerName: "Due date",
            width: 150,
            renderCell: (params: GridRenderCellParams) =>
              formatUtcToDatetimeLocal(params.value),
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
        if (key === "apartment_assigned_name") {
          return {
            field: key,
            headerName: "Apartment",
            width: 140,
            renderCell: (params: GridRenderCellParams) => (
              <Typography>{params.value}</Typography>
            ),
          };
        }
        if (key === "property_assigned_name") {
          return {
            field: key,
            headerName: "Property",
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
              <Typography>{params.value}</Typography>
            ),
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

  const onEditClick = (params: GridRenderCellParams) => {
    navigate(`/tasks/edit/${params.row.id}`);
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
      <Appbar appBarTitle={`Tasks of ${first_name} ${last_name}`} />
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
          <AddTaskDialog
            handleChange={getTasks}
            searchQuery={searchQuery}
            searchChange={(e) => setSearchQuery(e.target.value)}
            userId={`${id}`}
            handleRefresh={getTasks}
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
          {showImages && (
            <Grid
              item
              xs={12}
              sm={4}
              lg={3}
              sx={{
                position: "fixed",
                right: 0,
                top: 64,
                bottom: 0,
                width: { xs: "100%", sm: "600px" },
                backgroundColor: "background.paper",
                boxShadow: 3,
                zIndex: 1200,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="h6">Task Media</Typography>
                <IconButton onClick={() => setShowImages(false)}>
                  <Close />
                </IconButton>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  p: 2,
                }}
              >
                {selectedImages.length > 0 ? (
                  selectedImages.map((media, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 3,
                        "&:last-child": { mb: 0 },
                      }}
                    >
                      {isVideoUrl(media) ? (
                        <video
                          controls
                          style={{
                            width: "100%",
                            maxHeight: "400px",
                            borderRadius: 1,
                            display: "block",
                          }}
                        >
                          <source src={media} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img
                          src={media}
                          style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: "400px",
                            objectFit: "contain",
                            borderRadius: 1,
                            display: "block",
                          }}
                          alt={`Task image ${index + 1}`}
                        />
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 1,
                          textAlign: "center",
                          color: "text.secondary",
                        }}
                      >
                        {isVideoUrl(media)
                          ? `Video ${index + 1}`
                          : `Image ${index + 1}`}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No media available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          )}
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
            title="Delete Task"
            description="Are you sure you want to delete this task? This action cannot be undone."
            itemName={selectedTask ? `Task #${selectedTask.title}` : ""}
            confirmText="Delete Task"
            cancelText="Cancel"
          />
        </Container>
      </Box>
    </Box>
  );
}

export default TaskUserList;
