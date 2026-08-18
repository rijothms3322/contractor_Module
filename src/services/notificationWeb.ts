export const requestNotificationPermission = async () => {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    if (!("Notification" in window)) {
      console.log("This browser does not support notifications.");
      return "unsupported";
    }

    // Already decided permission
    if (Notification.permission === "granted") {
      console.log("Notification permission already granted");
      return "granted";
    }

    if (Notification.permission === "denied") {
      console.log("Notification permission was denied");
      return "denied";
    }

    // Ask user permission
    const permission = await Notification.requestPermission();

    console.log("Permission:", permission);

    return permission;

  } catch (error) {
    console.error("Notification permission error:", error);
    return null;
  }
};

export const showNotification = () => {
  if (Notification.permission === "granted") {
    new Notification("💊 Medicine Reminder", {
      body: "Time to take your medicine!",
      icon: "/icon.png",
    });
  }
};