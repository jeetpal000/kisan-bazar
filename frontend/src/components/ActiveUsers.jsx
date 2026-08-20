"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Search, X } from "lucide-react";
import { socket } from "@/lib/socket";
import { Input } from "@/components/ui/input";

export default function ActiveUsers({ userId }) {
  const [activeUsers, setActiveUsers] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const visitorId =
      userId ||
      sessionStorage.getItem("kisan-bazar-visitor-id") ||
      crypto.randomUUID();

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
  }, [userId]);

  useEffect(() => {
    if (!isOpen) return;
    const loadUsers = async () => {
      const response = await fetch(
        `/api/chat/users?search=${encodeURIComponent(search)}`,
      );
      if (response.ok) setUsers((await response.json()).users);
    };
    const timeout = setTimeout(loadUsers, 250);
    return () => clearTimeout(timeout);
  }, [isOpen, search]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
        aria-label="Open farmer chat"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm">{activeUsers} farmers online</span>
        <MessageCircle className="size-4" />
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Message a farmer
                </h2>
                <p className="text-xs text-slate-500">
                  {activeUsers} farmers online now
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close farmer list"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search farmers"
                className="h-9 pl-9"
              />
            </div>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/chat/${user.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-lg p-3 hover:bg-green-50"
                >
                  <span className="font-medium text-slate-800">
                    {user.farmername}
                  </span>
                  <MessageCircle className="size-4 text-green-700" />
                </Link>
              ))}
              {!users.length && (
                <p className="py-6 text-center text-sm text-slate-500">
                  No farmers found
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
