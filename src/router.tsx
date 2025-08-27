import * as React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ErrorPage from "./components/ErrorPage";
import SignInSide from "./pages/Auth/SignInSide";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Calender from "./pages/Calender/Calender";
import Account from "./pages/Account/Account";
import Settings from "./pages/Settings/Settings";
import { getUser, isAuthenticated } from "./utils/Helper";
import PropertyList from "./pages/PropertyInfo/PropertyList";
import PropertyInfo from "./pages/PropertyInfo/PropertyInfo";
import UserList from "./pages/UserInfo/UserList";
import UserInfo from "./pages/UserInfo/UserInfo";
import TaskList from "./pages/TaskInfo/TaskList";
import TaskInfo from "./pages/TaskInfo/TaskInfo";
import PlanningGenerator from "./pages/Planning/PlanningGenerator";
import TaskTemplateList from "./pages/TaskInfo/TaskTemplateList";
import TaskTemplateInfo from "./pages/TaskInfo/TaskTemplateInfo";
import ApartmentList from "./pages/ApartmentInfo/ApartmentList";
import ApartmentInfo from "./pages/ApartmentInfo/ApartmentInfo";
import TaskUserList from "./pages/UserInfo/TaskUserList";
import SalaryCalculator from "./pages/UserInfo/SalaryCalculator";
import SalaryList from "./pages/UserInfo/SalaryList";
import BookingList from "./pages/Bookings/BookingList";
import AddBooking from "./pages/Bookings/AddBooking";
import BookingDetails from "./pages/Bookings/BookingDetails";
import BookingEdit from "./pages/Bookings/BookingEdit";
import GuestDetail from "./pages/GuestInfo/GuestDetail";
import GuestList from "./pages/GuestInfo/GuestList";
import EditGuestDialog from "./pages/GuestInfo/EditGuestDialog";
import PropertyDetails from "./pages/PropertyInfo/PropertyDetails";
import PropertyApartments from "./pages/PropertyInfo/PropertyApartments";
import PropertyTasks from "./pages/PropertyInfo/PropertyTasks";
import PropertyUsers from "./pages/PropertyInfo/PropertyUsers";
import PropertyTasksTemplate from "./pages/PropertyInfo/PropertyTasksTemplate";
import PropertyBookings from "./pages/PropertyInfo/PropertyBookings";
import PropertyGuests from "./pages/PropertyInfo/PropertyGuests";
import PropertyAddBooking from "./pages/PropertyInfo/PropertyAddBooking";
import RefundList from "./pages/Refunds/RefundList";

const USER_TYPES = {
  ADMIN_USER: "admin",
  MANAGER_USER: "manager",
  RECEPTIONIST_USER: "receptionist",
};

const CURRENT_USER_TYPE = getUser()?.role;

const AdminElement = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (
    CURRENT_USER_TYPE === USER_TYPES.ADMIN_USER ||
    CURRENT_USER_TYPE === USER_TYPES.MANAGER_USER
  ) {
    return <>{children}</>;
  } else {
    return <Navigate to="/" replace />;
  }
};

const ProtectedElement = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SignInSide />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <SignInSide />,
  },
  {
    path: "/forgot",
    element: <ForgotPassword />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedElement>
        <Dashboard />
      </ProtectedElement>
    ),
  },
  {
    path: "/bookings",
    element: (
      <ProtectedElement>
        <BookingList />
      </ProtectedElement>
    ),
  },
  {
    path: "/refunds",
    element: (
      <ProtectedElement>
        <RefundList />
      </ProtectedElement>
    ),
  },
  {
    path: "/bookings/new",
    element: (
      <ProtectedElement>
        <AddBooking />
      </ProtectedElement>
    ),
  },
  {
    path: "/bookings/:id",
    element: (
      <ProtectedElement>
        <BookingDetails />
      </ProtectedElement>
    ),
  },
    {
    path: "/bookings/edit/:id",
    element: (
      <ProtectedElement>
        <BookingEdit />
      </ProtectedElement>
    ),
  },
  {
    path: "/guests/:id",
    element: (
      <ProtectedElement>
        <GuestDetail />
      </ProtectedElement>
    ),
  },
   {
    path: "/guests/",
    element: (
      <ProtectedElement>
        <GuestList />
      </ProtectedElement>
    ),
  },
  {
    path: "/guests/edit/:id",
    element: (
      <ProtectedElement>
        <EditGuestDialog />
      </ProtectedElement>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedElement>
        <Profile />
      </ProtectedElement>
    ),
  },
  {
    path: "/properties/edit/:id",
    element: (
      <AdminElement>
        <PropertyInfo />
      </AdminElement>
    ),
  },
  {
    path: "/properties-list",
    element: (
      <ProtectedElement>
        <PropertyList />
      </ProtectedElement>
    ),
  },
   {
    path: "/properties/:id/apartments",
    element: (
      <ProtectedElement>
        <PropertyApartments />
      </ProtectedElement>
    ),
  },
  {
    path: "/properties/:id/tasks-template",
    element: (
      <ProtectedElement>
        <PropertyTasksTemplate />
      </ProtectedElement>
    ),
  },
  {
    path: "/properties/:id/tasks",
    element: (
      <ProtectedElement>
        <PropertyTasks />
      </ProtectedElement>
    ),
  },
  {
    path: "/properties/:id/users",
    element: (
      <ProtectedElement>
        <PropertyUsers />
      </ProtectedElement>
    ),
  },
  {
    path: "/properties/:id/bookings",
    element: (
      <ProtectedElement>
        <PropertyBookings />
      </ProtectedElement>
    ),
  },
  {
    path: "/properties/:id/bookings/new",
    element: (
      <ProtectedElement>
        <PropertyAddBooking />
      </ProtectedElement>
    ),
  },
  {
    path: "/properties/:id/guests",
    element: (
      <ProtectedElement>
        <PropertyGuests />
      </ProtectedElement>
    ),
  },
  {
    path: "/properties/:id",
    element: (
      <ProtectedElement>
        <PropertyDetails />
      </ProtectedElement>
    ),
  },
  {
    path: "/apartments/edit/:id/:number",
    element: (
      <AdminElement>
        <ApartmentInfo />
      </AdminElement>
    ),
  },
  {
    path: "/apartments-list",
    element: (
      <ProtectedElement>
        <ApartmentList />
      </ProtectedElement>
    ),
  },
  // {
  //   path: "/doctor-list",
  //   element: (
  //     <AdminElement>
  //       <DoctorList />
  //     </AdminElement>
  //   )
  // },
  {
    path: "/tasks-list",
    element: (
      <ProtectedElement>
        <TaskList />
      </ProtectedElement>
    ),
  },
  {
    path: "/tasks/:id/:first_name/:last_name",
    element: (
      <AdminElement>
        <TaskUserList />
      </AdminElement>
    ),
  },
  {
    path: "/tasks-templates-list",
    element: (
      <AdminElement>
        <TaskTemplateList />
      </AdminElement>
    ),
  },
  {
    path: "/tasks/edit/:id",
    element: (
      <ProtectedElement>
        <TaskInfo />
      </ProtectedElement>
    ),
  },
  {
    path: "/tasks-templates/edit/:id",
    element: (
      <AdminElement>
        <TaskTemplateInfo />
      </AdminElement>
    ),
  },
  {
    path: "/users-list",
    element: (
      <AdminElement>
        <UserList />
      </AdminElement>
    ),
  },
  {
    path: "/users/edit/:id",
    element: (
      <AdminElement>
        <UserInfo />
      </AdminElement>
    ),
  },
  {
    path: "/planning-generator",
    element: (
      <AdminElement>
        <PlanningGenerator />
      </AdminElement>
    ),
  },
  // {
  //   path: "/appointments",
  //   element: (
  //     <AdminElement>
  //       <Appointments />
  //     </AdminElement>
  //   )
  // },
  {
    path: "/calender",
    element: (
      <AdminElement>
        <Calender />
      </AdminElement>
    ),
  },
  // {
  //   path: "/kanban",
  //   element: (
  //     <AdminElement>
  //       <Kanban />
  //     </AdminElement>
  //   )
  // },
  {
    path: "/account",
    element: (
      <AdminElement>
        <Account />
      </AdminElement>
    ),
  },
  {
    path: "/settings",
    element: (
      <AdminElement>
        <Settings />
      </AdminElement>
    ),
  },
  {
    path: "/salary-calculation",
    element: (
      <AdminElement>
        <SalaryCalculator />
      </AdminElement>
    ),
  },
  {
    path: "/salary-management",
    element: (
      <AdminElement>
        <SalaryList />
      </AdminElement>
    ),
  },
]);
