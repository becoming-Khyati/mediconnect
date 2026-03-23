import React, { useState, useEffect } from "react";
import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    AppBar,
    Typography,
    IconButton,
    Avatar,
    Badge
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import LogoutIcon from "@mui/icons-material/Logout";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const drawerWidth = 240;
const miniWidth = 70;

function MainLayout({ children }) {
    const [open, setOpen] = useState(true);
    const [profile, setProfile] = useState(null);
    const [notifCount, setNotifCount] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();
    const role = localStorage.getItem("role");

    const fetchProfile = async () => {
        try {
            const res = await api.get("profile/");
            setProfile(res.data);
        } catch (err) {
            console.log("Profile fetch error", err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get("notifications/");
            const unread = res.data.filter((n) => !n.is_read);

            if (unread.length > notifCount) {
                const audio = new Audio("/Notification.mp3");
                audio.play().catch(() => {});
                toast.info(unread[0].message, { toastId: "notif" });
            }

            setNotifCount(unread.length);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchNotifications();

        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const toggleDrawer = () => setOpen(!open);

    const doctorMenu = [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
        { text: "Patients", icon: <PeopleIcon />, path: "/patients" },
        { text: "Appointments", icon: <EventIcon />, path: "/doctor-appointments" }
    ];

    const patientMenu = [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/patient-dashboard" },
        { text: "Appointments", icon: <EventIcon />, path: "/patient-appointments" }
    ];

    const menuItems = role === "doctor" ? doctorMenu : patientMenu;

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <AppBar position="fixed" sx={{ zIndex: 1201, background: "#0f172a" }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton color="inherit" onClick={toggleDrawer}>
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
                            MediConnect
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography sx={{ fontSize: 14 }}>
                            {role === "doctor"
                                ? `Dr. ${profile?.username || ""}`
                                : profile?.name || "Patient"}
                        </Typography>

                        <IconButton
                            color="inherit"
                            onClick={() => {
                                setNotifCount(0);
                                navigate("/notifications");
                            }}
                        >
                            <Badge badgeContent={notifCount} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>

                        <Avatar
                            src={
                                profile?.profile_picture
                                    ? profile.profile_picture
                                    : ""
                            }
                            sx={{
                                width: 36,
                                height: 36,
                                cursor: "pointer",
                                border: "2px solid white"
                            }}
                            onClick={() => navigate("/profile")}
                        />
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: open ? drawerWidth : miniWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: open ? drawerWidth : miniWidth,
                        transition: "width 0.3s",
                        overflowX: "hidden",
                        background: "#111827",
                        color: "#fff"
                    }
                }}
            >
                <Toolbar />

                <List>
                    {menuItems.map((item) => {
                        const active = location.pathname === item.path;

                        return (
                            <ListItemButton
                                key={item.text}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    mx: 1,
                                    my: 0.5,
                                    borderRadius: 2,
                                    background: active ? "#374151" : "transparent",
                                    "&:hover": { background: "#374151" }
                                }}
                            >
                                <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
                                    {item.icon}
                                </ListItemIcon>

                                {open && (
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontSize: 14,
                                            fontWeight: 500
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        );
                    })}

                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            mx: 1,
                            mt: 2,
                            borderRadius: 2,
                            "&:hover": { background: "#374151" }
                        }}
                    >
                        <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
                            <LogoutIcon />
                        </ListItemIcon>

                        {open && <ListItemText primary="Logout" />}
                    </ListItemButton>
                </List>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    background: "linear-gradient(135deg, #f1f5f9, #ffffff)",
                    p: 3,
                    minHeight: "100vh"
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}

export default MainLayout;