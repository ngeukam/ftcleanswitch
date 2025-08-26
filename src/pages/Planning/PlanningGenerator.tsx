import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Autocomplete,
  Toolbar,
  Container,
} from "@mui/material";
import {
  People,
  CalendarToday,
  Schedule,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { motion } from "framer-motion";
import useApi from "../../hooks/APIHandler";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Appbar from "../../components/Appbar";
import Slider from "@mui/material/Slider";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  username: string;
  fullName: string;
  department: string;
}

interface StaffMember {
  id: number;
  username: string;
  fullName: string;
  department: string;
}

interface BalanceSuggestion {
  adjust_weeks: string;
  adjust_staff: string;
  required_slots_per_staff?: number; // Added this field
}

interface GeneratedSchedule {
  weekNumber: number;
  days: {
    day: string;
    date: string;
    staffAssignments: {
      staff: StaffMember;
      hours: number;
    }[];
  }[];
}

interface ApiScheduleItem {
  id: number;
  staff: {
    id: number;
    username: string;
    fullName: string;
    department: string;
  };
  day: string;
  hours: number;
  week_number: number;
  date: string;
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const PlanningGenerator: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const steps = ["Staff Selection", "Schedule Parameters", "View Schedule"];
  const { callApi, loading } = useApi();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [weeksToGenerate, setWeeksToGenerate] = useState(1);
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);
  const [dailyHours, setDailyHours] = useState(8);
  const [staffPerDay, setStaffPerDay] = useState(2);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [generatedSchedule, setGeneratedSchedule] = useState<
    GeneratedSchedule[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [balanceError, setBalanceError] = useState<{
    message: string;
    suggestion: BalanceSuggestion;
  } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await callApi({ url: "/user/staff/" });
        if (response?.status === 200) {
          setAllUsers(response.data.users || []);
        }
      } catch (err) {
        setError("Failed to load users");
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };
  const downloadSchedule = () => {
    // Create CSV content
    let csvContent = "Week,Day,Date,Staff,Hours\n";

    generatedSchedule.forEach((week) => {
      week.days.forEach((day) => {
        day.staffAssignments.forEach((staff) => {
          csvContent += `${week.weekNumber},${day.day},${day.date},${staff.staff.fullName},${staff.hours}\n`;
        });
      });
    });

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `schedule_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateSchedule = async () => {
    try {
      setError(null);
      setBalanceError(null);
      setGeneratedSchedule([]);

      if (staffList.length === 0) {
        toast.error("Please select at least one staff member");
        return;
      }
      if (selectedDays.length === 0) {
        toast.error("Please select at least one working day");
        return;
      }
      if (staffPerDay > staffList.length) {
        toast.error("Staff per day cannot exceed total staff members");
        return;
      }

      const staffUsernames = staffList.map((staff) => staff.username);
      const formattedDate = startDate ? format(startDate, "yyyy-MM-dd") : null;
      const response = await callApi({
        url: "/user/generate-schedule/",
        method: "POST",
        body: {
          staff_usernames: staffUsernames,
          weeks: weeksToGenerate,
          working_days: selectedDays,
          daily_hours: dailyHours,
          staff_per_day: staffPerDay,
          start_date: formattedDate,
        },
      });
      // Handle case where perfect balance isn't possible
      if (response?.status === 200 && response.data?.error) {
        setBalanceError({
          message: response.data.message,
          suggestion: response.data.suggestion,
        });
        return;
      }

      // Handle successful schedule generation
      if (response?.status === 201) {
        const apiSchedules = response.data.schedule as ApiScheduleItem[];
        // Verify hours distribution is equal
        // const hoursDistribution = response.data.hours_distribution;
        // const hoursValues = Object.values(hoursDistribution);
        // const allEqual = hoursValues.every((val) => val === hoursValues[0]);
        // Transform API response to frontend format
        const transformedSchedule = transformApiResponse(apiSchedules);

        setGeneratedSchedule(transformedSchedule);
        setActiveStep(2);
        return;
      }

      // Handle unexpected response status
      // throw new Error("Unexpected response from server");
    } catch (err:any) {
      setError(err.message || "Failed to generate schedule");
    }
  };

  // Helper function to transform API response
  const transformApiResponse = (
    apiSchedules: ApiScheduleItem[]
  ): GeneratedSchedule[] => {
    const transformedSchedule: GeneratedSchedule[] = [];
    const weeks = Array.from(
      new Set(apiSchedules.map((s) => s.week_number))
    ).sort();

    weeks.forEach((weekNumber) => {
      const weekSchedules = apiSchedules.filter(
        (s) => s.week_number === weekNumber
      );
      const days = Array.from(new Set(weekSchedules.map((s) => s.day)));

      const weekData: GeneratedSchedule = {
        weekNumber,
        days: days.map((day) => {
          const daySchedules = weekSchedules.filter((s) => s.day === day);
          return {
            day,
            date: new Date(daySchedules[0].date).toLocaleDateString(),
            staffAssignments: daySchedules.map((s) => ({
              staff: {
                id: s.staff.id,
                username: s.staff.username,
                fullName: s.staff.fullName,
                department: s.staff.department,
              },
              hours: s.hours,
            })),
          };
        }),
      };
      transformedSchedule.push(weekData);
    });

    return transformedSchedule;
  };

  const renderBalanceError = () => {
    if (!balanceError) return null;

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: "#fff8e1" }}>
        <Typography variant="h6" color="error" gutterBottom>
          ⚠️ Schedule Balance Issue
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {balanceError.message}
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
          Suggestions to achieve balance:
        </Typography>

        <Box sx={{ ml: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            • {balanceError.suggestion.adjust_weeks}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            • {balanceError.suggestion.adjust_staff}
          </Typography>
          {balanceError.suggestion.required_slots_per_staff && (
            <Typography variant="body1" sx={{ mb: 1 }}>
              • Each staff needs ~
              {balanceError.suggestion.required_slots_per_staff.toFixed(1)}{" "}
              slots
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Auto-apply the weeks suggestion
              const suggestedWeeks = balanceError.suggestion.adjust_weeks.match(
                /\d+/
              );
              if (suggestedWeeks) {
                setWeeksToGenerate(parseInt(suggestedWeeks[0]));
              }
              setBalanceError(null);
            }}
            sx={{ mr: 2 }}
          >
            Apply Suggestion
          </Button>
          <Button variant="outlined" onClick={() => setBalanceError(null)}>
            Continue Anyway
          </Button>
        </Box>
      </Paper>
    );
  };

  const handleNext = () => {
    if (activeStep === 1) {
      generateSchedule();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const ExitSchedule = async () => {
    navigate('/calender');
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="Schedule Planning Generator" />
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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
              {/* <Typography
                variant="h5"
                gutterBottom
                sx={{ mb: 4, fontWeight: "bold" }}
              >
                Schedule Planning Generator
              </Typography> */}
              {balanceError && renderBalanceError()}

              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                  <CircularProgress />
                </Box>
              )}

              {activeStep === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        <CalendarMonthIcon
                          sx={{ verticalAlign: "middle", mr: 1 }}
                        />
                        Start Date
                      </Typography>
                      <DatePicker
                        value={startDate}
                        onChange={(newValue) =>
                          setStartDate(newValue as Date | null)
                        }
                        minDate={new Date()} // Optional: prevent selecting past dates
                        slotProps={{
                          textField: {
                            fullWidth: true,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        <People sx={{ verticalAlign: "middle", mr: 1 }} />
                        Select Staff Members
                      </Typography>
                      <Autocomplete
                        multiple
                        options={allUsers}
                        getOptionLabel={(option) =>
                          `${option.fullName} (${option.department})`
                        }
                        filterSelectedOptions
                        value={allUsers.filter((user) =>
                          staffList.some((staff) => staff.id === user.id)
                        )}
                        onChange={(_, newValue) => {
                          setStaffList(
                            newValue.map((user) => ({
                              id: user.id,
                              username: user.username,
                              fullName: user.fullName,
                              department:user.department,
                            }))
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Staff"
                            placeholder="Search staff members..."
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option.id}
                              label={`${option.fullName} (${option.department})`}
                            />
                          ))
                        }
                        disabled={loading}
                      />
                    </Grid>
                  </Grid>
                  {staffList.length > 0 ? (
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}
                    >
                      {staffList.map((staff) => (
                        <Chip
                          key={staff.id}
                          label={`${staff.fullName} (${staff.department})`}
                          onDelete={() =>
                            setStaffList(
                              staffList.filter((s) => s.id !== staff.id)
                            )
                          }
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      No staff members selected
                    </Typography>
                  )}
                </motion.div>
              )}

              {activeStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    <CalendarToday sx={{ verticalAlign: "middle", mr: 1 }} />
                    Schedule Parameters
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Weeks to Generate"
                        type="number"
                        value={weeksToGenerate}
                        onChange={(e) =>
                          setWeeksToGenerate(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        inputProps={{ min: 1 }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Working Days
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {daysOfWeek.map((day) => (
                          <Chip
                            key={day}
                            label={day}
                            clickable
                            color={
                              selectedDays.includes(day) ? "primary" : "default"
                            }
                            onClick={() => toggleDay(day)}
                          />
                        ))}
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Daily Hours"
                        type="number"
                        value={dailyHours}
                        onChange={(e) =>
                          setDailyHours(parseFloat(e.target.value) || 0)
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              hours
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{ step: 0.5, min: 1 }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Staff Required Per Day</InputLabel>
                        <Select
                          value={staffPerDay}
                          label="Staff Required Per Day"
                          onChange={(e) =>
                            setStaffPerDay(Number(e.target.value))
                          }
                        >
                          {[1, 2, 3, 4, 5].map((num) => (
                            <MenuItem
                              key={num}
                              value={num}
                              disabled={num > staffList.length}
                            >
                              {num} {num === 1 ? "person" : "people"}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    {/* <Typography variant="h6" gutterBottom>
                      <EventAvailable sx={{ verticalAlign: "middle", mr: 1 }} />
                      Generated Schedule
                    </Typography> */}

                    <Button
                      variant="contained"
                      onClick={downloadSchedule}
                      startIcon={<DownloadIcon />}
                    >
                      Download Full Schedule
                    </Button>
                  </Box>

                  {generatedSchedule.length > 1 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography gutterBottom>Week Selection</Typography>
                      <Slider
                        value={currentWeek}
                        onChange={(_, value) => setCurrentWeek(value as number)}
                        min={1}
                        max={generatedSchedule.length}
                        step={1}
                        marks={generatedSchedule.map((_, index) => ({
                          value: index + 1,
                          label: `Week ${index + 1}`,
                        }))}
                        valueLabelDisplay="auto"
                        sx={{ maxWidth: 600, }}
                      />
                    </Box>
                  )}

                  {/* Display only the selected week */}
                  <Box key={currentWeek} sx={{ mb: 4 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", mb: 2 }}
                    >
                      Week {currentWeek}
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, 1fr)",
                          md: "repeat(3, 1fr)",
                        },
                        gap: 2,
                      }}
                    >
                      {generatedSchedule[currentWeek - 1]?.days.map(
                        (daySchedule) => (
                          <Paper
                            key={`${currentWeek}-${daySchedule.day}`}
                            elevation={2}
                            sx={{ p: 2 }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold" }}
                            >
                              {daySchedule.day} ({daySchedule.date})
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {daySchedule.staffAssignments[0]?.hours || 0}{" "}
                              hours each
                            </Typography>

                            <Divider sx={{ my: 1 }} />

                            <Box sx={{ mt: 1 }}>
                              {daySchedule.staffAssignments.map(
                                (assignment, idx) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      mb: 1,
                                    }}
                                  >
                                    <Schedule color="action" sx={{ mr: 1 }} />
                                    <Typography variant="body2">
                                      {assignment.staff.fullName}
                                    </Typography>
                                  </Box>
                                )
                              )}
                            </Box>
                          </Paper>
                        )
                      )}
                    </Box>
                  </Box>
                </motion.div>
              )}

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0 || loading}
                  variant="outlined"
                >
                  Back
                </Button>

                {activeStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    disabled={
                      (activeStep === 0 && staffList.length === 0) ||
                      (activeStep === 1 && selectedDays.length === 0) ||
                      loading
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={ExitSchedule}
                    disabled={loading}
                  >
                    {"Exit Schedule"}
                  </Button>
                )}
              </Box>
            </Paper>
          </LocalizationProvider>
        </Container>
      </Box>
    </Box>
  );
};

export default PlanningGenerator;
