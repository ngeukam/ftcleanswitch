import * as React from "react";
import { Link } from "react-router-dom";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import HomeIcon from "@mui/icons-material/Home";
import PaymentIcon from "@mui/icons-material/Payment";
import BedroomParentIcon from "@mui/icons-material/BedroomParent";
import MoneyIcon from "@mui/icons-material/Money";
import { getUser } from "../utils/Helper";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import TaskIcon from "@mui/icons-material/Task";
import { logout } from "../utils/logout";
// ----------------------------------------------------------------------

// Interface for a single navigation item
interface NavItemProps {
  link: string;
  label: string;
  icon: React.ReactNode;
}

// A reusable component for a single navigation item
const NavItem = ({ link, label, icon }: NavItemProps) =>
  link === "/login" ? (
    <Link to={link} style={{ textDecoration: "none", color: "inherit" }}>
      <ListItemButton onClick={logout}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={label} />
      </ListItemButton>
    </Link>
  ) : (
    <Link to={link} style={{ textDecoration: "none", color: "inherit" }}>
      <ListItemButton>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={label} />
      </ListItemButton>
    </Link>
  );

// ----------------------------------------------------------------------

// Centralized navigation configuration object
const navConfig = {
  main: {
    FO: [
      { link: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
      { link: "/properties-list", label: "Properties", icon: <HomeIcon /> },
      {
        link: "/apartments-list",
        label: "Apartments",
        icon: <BedroomParentIcon />,
      },

      { link: "/bookings", label: "Bookings", icon: <BookOnlineIcon /> },
      { link: "/refunds", label: "Refunds", icon: <PaymentIcon /> },
      { link: "/guests", label: "Guests", icon: <PersonIcon /> },
      { link: "/tasks-list", label: "Tasks", icon: <TaskIcon /> },
    ],
    DG: [
      { link: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
      { link: "/properties-list", label: "Properties", icon: <HomeIcon /> },
      {
        link: "/apartments-list",
        label: "Apartments",
        icon: <BedroomParentIcon />,
      },
      {
        link: "/tasks-templates-list",
        label: "Tasks Templates",
        icon: <FormatListBulletedIcon />,
      },
      {
        link: "/planning-generator",
        label: "Schedule Planning",
        icon: <BookOnlineIcon />,
      },
      { link: "/users-list", label: "Users", icon: <PeopleIcon /> },
      { link: "/tasks-list", label: "Tasks", icon: <TaskIcon /> },
      { link: "/calender", label: "Calendar", icon: <CalendarMonthIcon /> },
      { link: "/bookings", label: "Bookings", icon: <BookOnlineIcon /> },
      { link: "/refunds", label: "Refunds", icon: <PaymentIcon /> },
      { link: "/guests", label: "Guests", icon: <PersonIcon /> },
    ],
  },
  manager: [
    { link: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    {
      link: "/tasks-templates-list",
      label: "Tasks Templates",
      icon: <FormatListBulletedIcon />,
    },
    { link: "/tasks-list", label: "Tasks", icon: <TaskIcon /> },
    {
      link: "/planning-generator",
      label: "Schedule Planning",
      icon: <BookOnlineIcon />,
    },
    { link: "/users-list", label: "Users", icon: <PeopleIcon /> },
    { link: "/calender", label: "Calendar", icon: <CalendarMonthIcon /> },
  ],
  secondary: {
    adminHR: [
      {
        link: "/salary-calculation",
        label: "Salary Calculation",
        icon: <MoneyIcon />,
      },
      {
        link: "/salary-management",
        label: "Salary Management",
        icon: <MoneyIcon />,
      },
      { link: "/account", label: "Account", icon: <ManageAccountsIcon /> },
      { link: "/login", label: "Logout", icon: <LogoutIcon /> },
    ],
    default: [
      { link: "/account", label: "Account", icon: <ManageAccountsIcon /> },
      { link: "/login", label: "Logout", icon: <LogoutIcon /> },
    ],
  },
};

// ----------------------------------------------------------------------

// Get user data
const user = getUser();
const userDepartment = user?.department;
const userRole = user?.role;

// Helper function to merge arrays and remove duplicates based on link
const mergeNavItems = (
  baseItems: NavItemProps[],
  additionalItems: NavItemProps[]
): NavItemProps[] => {
  const merged = [...baseItems];
  const existingLinks = new Set(baseItems.map((item) => item.link));

  additionalItems.forEach((item) => {
    if (!existingLinks.has(item.link)) {
      merged.push(item);
      existingLinks.add(item.link);
    }
  });

  return merged;
};

// Start with the base list for the user's department.
let primaryNavList: NavItemProps[] = [];
if (userDepartment === "FO") {
  primaryNavList = [...navConfig.main.FO];
} else if (userDepartment === "DG") {
  primaryNavList = [...navConfig.main.DG];
}

// Conditionally add manager-specific links if the user is a manager, avoiding duplicates
if (userRole === "manager") {
  primaryNavList = mergeNavItems(primaryNavList, navConfig.manager);
}

// Determine secondary navigation list based on role/department
const secondaryNavList =
  userRole === "admin" || userDepartment === "HR"
    ? navConfig.secondary.adminHR
    : navConfig.secondary.default;

// ----------------------------------------------------------------------

// Export the main and secondary list components
export const mainListItems = (
  <React.Fragment>
    {primaryNavList.map((item, index) => (
      <NavItem key={index} {...item} />
    ))}
  </React.Fragment>
);

export const secondaryListItems = (
  <React.Fragment>
    <ListSubheader component="div" inset>
      Saved reports
    </ListSubheader>
    {secondaryNavList.map((item, index) => (
      <NavItem key={index} {...item} />
    ))}
  </React.Fragment>
);
