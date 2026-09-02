"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export default function ActiveUsers() {
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const visitorId =
      sessionStorage.getItem("kisan-bazar-visitor-id") || crypto.randomUUID();

    sessionStorage.setItem("kisan-bazar-visitor-id", visitorId);

    const handleActiveUsers = (count) => {
      setActiveUsers(count);
    };

    socket.on("active-users", handleActiveUsers);
    socket.connect();

    socket.emit("user:online", visitorId);

    return () => {
      socket.off("active-users", handleActiveUsers);

      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex items-center gap-2" aria-label="Active users">
      <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
      <span className="text-sm">{activeUsers} farmers online</span>
    </div>
  );
}
