import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  TextField,
} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Appbar from "../../components/Appbar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import useApi from "../../hooks/APIHandler";
import { EventClickArg } from "@fullcalendar/core";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

interface UserSchedule {
  id: number;
  fullName: string;
  day: string;
  hours: string;
  week_number: number;
  date: string;
  created_at: string;
  added_by_user_id: number;
}

function Calendar() {
  const { callApi, loading, error } = useApi();
  const [userSchedules, setUserSchedules] = useState<UserSchedule[]>([]);
  const [calendarView, setCalendarView] = useState("dayGridMonth");

  const [openForm, setOpenForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [hours, setHours] = useState<number>(2);

  const fetchUserSchedules = async () => {
    try {
      const response = await callApi({ url: "/user/schedules/" });
      if (response?.status === 200) {
        setUserSchedules(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch user schedules:", err);
    }
  };

  const fetchStaffList = async () => {
    try {
      const res = await callApi({ url: "/user/staff/" });
      if (res?.status === 200) {
        setStaffList(res.data.users);
      }
    } catch (err) {
      console.error("Failed to load staff list");
    }
  };

  useEffect(() => {
    fetchUserSchedules();
    fetchStaffList();
  }, []);

  const handleEventClick = async (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const schedule = userSchedules.find((s) => s.id === parseInt(event.id));

    if (!schedule) return;

    const result = await Swal.fire({
      title: "Delete Schedule",
      html: `
        <div style="text-align: left;">
          <p><strong>Staff:</strong> ${schedule.fullName}</p>
          <p><strong>Date:</strong> ${schedule.date}</p>
          <p><strong>Hours:</strong> ${schedule.hours}</p>
        </div>
        <p>Are you sure you want to delete this schedule?</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancel",
      confirmButtonText: "Delete",
      cancelButtonColor: "#3085d6",
      reverseButtons: false,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      try {
        await callApi({
          url: `/user/schedules/${schedule.id}/`,
          method: "DELETE",
        });

        // Optimistically update UI
        setUserSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
        event.remove();
        Swal.fire({
          title: "Deleted!",
          text: "Schedule has been deleted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Delete failed:", err);
        // Re-fetch to ensure UI is in sync with server
        fetchUserSchedules();
      }
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start);
    setOpenForm(true);
  };

  const getWeekNumber = (date: Date): number => {
    const onejan = new Date(date.getFullYear(), 0, 1);
    const millisBetween = +date - +onejan;
    return Math.ceil((millisBetween / 86400000 + onejan.getDay() + 1) / 7);
  };

  const handleSubmitSchedule = async () => {
    if (!selectedDate || !selectedStaff) return;

    const dayName = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const weekNumber = getWeekNumber(selectedDate); // helper à créer

    try {
      const res = await callApi({
        url: "/user/schedules/",
        method: "POST",
        body: {
          staff: selectedStaff,
          day: dayName,
          hours,
          date: selectedDate.toISOString().split("T")[0],
          week_number: weekNumber,
        },
      });

      if (res?.status === 201) {
        toast.success("Schedule added");
        setOpenForm(false);
        fetchUserSchedules(); // refresh calendar
      }
    } catch (err) {
      console.error("Failed to add schedule");
    }
  };

  const handleViewChange = (viewInfo: any) => {
    setCalendarView(viewInfo.view.type);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Appbar appBarTitle="Staff Schedules" />
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          // height: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Container sx={{ mt: 4, mb: 4 }}>
          {loading && (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          )}

          {!loading && (
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              initialView={calendarView}
              timeZone="UTC"
              themeSystem="bootstrap3"
              allDaySlot={true}
              slotDuration="01:00:00"
              editable={true}
              selectable={true}
              selectMirror={true}
              weekNumbers={true}
              dayMaxEvents={true}
              weekends={true}
              nowIndicator={true}
              select={handleDateSelect}
              events={userSchedules.map((schedule) => ({
                id: schedule.id.toString(),
                title: `${schedule.fullName} - ${schedule.hours}h`,
                start: schedule.date,
                allDay: true,
                extendedProps: {
                  day: schedule.day,
                  weekNumber: schedule.week_number,
                },
              }))}
              eventClick={handleEventClick}
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
          )}
        </Container>
      </Box>
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>Add Schedule</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Select Staff"
            value={selectedStaff || ""}
            onChange={(e) => setSelectedStaff(Number(e.target.value))}
            margin="normal"
          >
            {staffList.map((staff) => (
              <MenuItem key={staff.id} value={staff.id}>
                {staff.fullName} ({staff.department})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Hours"
            type="number"
            value={hours}
            fullWidth
            onChange={(e) => setHours(Number(e.target.value))}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button onClick={handleSubmitSchedule} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Calendar;
