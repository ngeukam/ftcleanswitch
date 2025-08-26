import * as React from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Stack,
  CircularProgress,
  Grid,
  LinearProgress,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import useApi from "../hooks/APIHandler";
import { toast } from "react-toastify";

// Helper function to convert bytes to megabytes
const bytesToMB = (bytes: number) => bytes / (1024 * 1024);

interface FileWithPreview extends File {
  preview: string;
}

interface InitialFile {
  url: string;
  name?: string;
  type?: string;
  size?: number;
}
interface ImageUploadProps {
  onUpload: (uploadedImages: InitialFile[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  initialFiles?: InitialFile[];
}

export default function ImageUpload({
  onUpload,
  multiple = true,
  maxFiles = 5,
  maxFileSize = 5, // 5MB default
  allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  initialFiles = [],
}: ImageUploadProps) {
  const { callApi } = useApi();
  const [newFiles, setNewFiles] = React.useState<FileWithPreview[]>([]);
  const [initialUrls, setInitialUrls] = React.useState<InitialFile[]>(initialFiles);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [errors, setErrors] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Use useEffect to handle changes to initialFiles prop
  React.useEffect(() => {
    setInitialUrls(initialFiles);
  }, [initialFiles]);

  // Cleanup function for object URLs
  React.useEffect(() => {
    return () => {
      newFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [newFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const newErrors: string[] = [];
    const totalFilesCount = newFiles.length + initialUrls.length + selectedFiles.length;

    // Check maximum files
    if (totalFilesCount > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed. You have selected ${totalFilesCount}.`);
      setErrors(newErrors);
      e.target.value = ''; // Reset input value to allow re-selection of the same file
      return;
    }

    const validFilesWithPreviews: FileWithPreview[] = [];
    selectedFiles.forEach((file) => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        newErrors.push(`${file.name}: Invalid file type (${file.type})`);
        return;
      }

      // Check file size
      if (bytesToMB(file.size) > maxFileSize) {
        newErrors.push(`${file.name}: File too large (max ${maxFileSize}MB)`);
        return;
      }

      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
      validFilesWithPreviews.push(fileWithPreview);
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setTimeout(() => setErrors([]), 5000);
    }

    if (validFilesWithPreviews.length > 0) {
      setNewFiles((prev) => [...prev, ...validFilesWithPreviews]);
      setErrors([]); // Clear errors if valid files were added
    }
    e.target.value = ''; // Reset input value
  };

  const handleRemoveNewFile = (index: number) => {
    const fileToRemove = newFiles[index];
    URL.revokeObjectURL(fileToRemove.preview);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setErrors([]);
  };

  const handleRemoveInitialFile = (index: number) => {
    setInitialUrls((prev) => prev.filter((_, i) => i !== index));
    // Immediately trigger onUpload with the updated list
    onUpload(initialUrls.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (newFiles.length === 0) {
      toast.info("No new images to upload.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setErrors([]);

    try {
      const formData = new FormData();
      newFiles.forEach((file) => {
        formData.append("files", file);
      });

      const config = {
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      };

      const response = await callApi({
        url: "/uploads/",
        method: "POST",
        body: formData,
        header: {
          "Content-Type": "multipart/form-data",
        },
        ...config,
      });

      if (response?.data.urls) {
        const uploadedUrls = response.data.urls.map((url: string, idx: number) => ({
          url,
          name: newFiles[idx].name,
          type: newFiles[idx].type,
          size: newFiles[idx].size,
        }));
        
        const allImages = [...initialUrls, ...uploadedUrls];
        onUpload(allImages);

        // Reset component state for new uploads
        setNewFiles([]);
        toast.success("Upload completed successfully!");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setErrors(["Upload failed. Please try again."]);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const totalFiles = initialUrls.length + newFiles.length;
  const showUploadButton = totalFiles > 0 && newFiles.length > 0;
  const showSelectButton = totalFiles < maxFiles && !uploading;

  return (
    <Box sx={{ width: "100%" }}>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept={allowedTypes.join(",")}
        multiple={multiple}
        style={{ display: "none" }}
      />
      <Stack spacing={2}>
        {errors.length > 0 && (
          <Alert severity="error" onClose={() => setErrors([])}>
            {errors.map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </Alert>
        )}
        {showSelectButton && (
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            fullWidth
            sx={{ py: 2 }}
          >
            Select Images
            <Typography variant="caption" sx={{ ml: 1 }}>
              ({totalFiles}/{maxFiles} files selected)
            </Typography>
          </Button>
        )}
        <Grid container spacing={2}>
          {initialUrls.map((file, index) => (
            <Grid item xs={6} sm={4} md={3} key={`initial-${index}`}>
              <Box
                sx={{
                  position: "relative",
                  height: 120,
                  border: "1px dashed #ccc",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <img
                  src={file.url}
                  alt={file.name || `Initial Preview ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                  }}
                  onClick={() => handleRemoveInitialFile(index)}
                  disabled={uploading}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="caption" noWrap sx={{ display: "block", width: "100%" }}>
                {file.name} ({file.size ? `${bytesToMB(file.size).toFixed(2)}MB` : ""})
              </Typography>
            </Grid>
          ))}
          {newFiles.map((file, index) => (
            <Grid item xs={6} sm={4} md={3} key={`new-${index}`}>
              <Box
                sx={{
                  position: "relative",
                  height: 120,
                  border: "1px dashed #ccc",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <img
                  src={file.preview}
                  alt={`Preview ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.7)",
                    },
                  }}
                  onClick={() => handleRemoveNewFile(index)}
                  disabled={uploading}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="caption" noWrap sx={{ display: "block", width: "100%" }}>
                {file.name} ({bytesToMB(file.size).toFixed(2)}MB)
              </Typography>
            </Grid>
          ))}
        </Grid>
        {uploading && (
          <Box sx={{ width: "100%" }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
              Uploading: {progress}%
            </Typography>
          </Box>
        )}
        {showUploadButton && (
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading || newFiles.length === 0}
              startIcon={
                uploading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <ImageIcon />
                )
              }
              fullWidth
            >
              {uploading ? "Uploading..." : "Upload Images"}
            </Button>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}