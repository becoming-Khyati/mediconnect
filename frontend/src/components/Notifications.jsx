import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import api from "../api/axios";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("notifications/");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async () => {
    try {
      await api.post("notifications/read/");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchNotifications();
      await markAsRead();
      await fetchNotifications();
    };

    init();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box p={2}>
      <Typography variant="h6" mb={2}>
        Notifications
      </Typography>

      {notifications.length === 0 ? (
        <Typography>No notifications</Typography>
      ) : (
        notifications.map((n) => (
          <Paper
            key={n.id}
            sx={{
              p: 2,
              mb: 1,
              borderRadius: 2,
              background: n.is_read ? "#fff" : "#e3f2fd"
            }}
          >
            <Typography>{n.message}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(n.created_at).toLocaleString()}
            </Typography>
          </Paper>
        ))
      )}
    </Box>
  );
}

export default Notifications;