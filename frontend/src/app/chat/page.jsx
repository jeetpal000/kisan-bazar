"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ChatHomePage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadRecentChats = async () => {
      const response = await fetch("/api/chat/recent", { cache: "no-store" });
      if (response.ok) setRecentChats((await response.json()).chats);
    };
    loadRecentChats();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      const response = await fetch(
        `/api/chat/users?search=${encodeURIComponent(search)}`,
      );
      if (response.ok) setUsers((await response.json()).users);
    };
    const timeout = setTimeout(loadUsers, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  const people = search ? users : recentChats;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full flex-col px-4 py-6 mt-20">
      <Link
        href="/"
        className="mb-4 flex w-fit items-center gap-2 text-sm text-green-700"
      >
        <ArrowLeft className="size-4" /> Back home
      </Link>
      <div className="relative flex h-[calc(100vh-10rem)] overflow-hidden rounded-xl border bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chats"
          className="absolute left-3 top-3 z-20 flex size-10 items-center justify-center rounded-full bg-green-700 text-white shadow-lg md:hidden"
        >
          <MessageCircle className="size-5" />
        </button>
        <aside
          className={`absolute inset-y-0 left-0 z-10 w-[min(86vw,21rem)] border-r bg-white transition-transform duration-300 md:relative md:z-0 md:block md:w-80 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Chats</h1>
                <p className="text-xs text-slate-500">Find a farmer or buyer</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chats"
                className="rounded-full p-1 hover:bg-slate-100 md:hidden"
              >
                <ChevronLeft className="size-5" />
              </button>
            </div>
            <div className="relative px-4 py-3">
              <Search className="absolute left-7 top-6 size-4 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users"
                className="h-10 rounded-full bg-slate-100 pl-9"
              />
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-3">
              {!search && recentChats.length > 0 && (
                <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Recent chats
                </p>
              )}
              {people.map((user) => (
                <Link
                  key={user.id}
                  href={`/chat/${user.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-[#94949452]"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-800">
                    {user.farmername?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {user.farmername}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.lastMessage || user.role || "Start a conversation"}
                    </p>
                  </div>
                </Link>
              ))}
              {!people.length && (
                <p className="py-6 text-center text-sm text-slate-500">
                  {search ? "No users found" : "No recent chats"}
                </p>
              )}
            </div>
          </div>
        </aside>
        <section className="flex h-full w-full min-w-0 flex-col items-center justify-center bg-[linear-gradient(135deg,#0f0f0f0_0%,#eef7ec_100%)] px-6 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-green-700 text-white shadow-lg">
            <MessageCircle className="size-9" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-900">
            Kisan Bazar Community Chat
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Connect directly with farmers and buyers, ask about products, share
            updates, and make better local trade decisions.
          </p>
          <p className="mt-5 text-sm font-medium text-green-800">
            Search a user or choose a recent chat to begin.
          </p>
        </section>
      </div>
    </main>
  );
}
