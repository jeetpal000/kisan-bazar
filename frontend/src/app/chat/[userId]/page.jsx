"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { Input } from "@/components/ui/input";

const formatLastSeen = (value) =>
  value ? `Last seen ${new Date(value).toLocaleString()}` : "Offline";

export default function ChatPage() {
  const { userId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const acknowledgedMessageIds = useRef(new Set());

  useEffect(() => {
    const load = async () => {
      const [meResponse, chatResponse] = await Promise.all([
        fetch("/api/userdata"),
        fetch(`/api/chat/${userId}`),
      ]);
      if (meResponse.ok) setCurrentUser((await meResponse.json()).user);
      if (chatResponse.ok) {
        const data = await chatResponse.json();
        setOtherUser(data.user);
        setMessages(data.messages);
      }
    };
    load();
  }, [userId]);

  useEffect(() => {
    if (!currentUser) return;
    const handlePresence = ({ onlineUserIds, lastSeen: seen }) => {
      setOnline(onlineUserIds.includes(userId));
      setLastSeen(seen[userId] || null);
    };
    const handleTyping = ({ userId: senderId, isTyping }) => {
      if (senderId === userId) setTyping(isTyping);
    };
    const handleMessage = (message) => {
      if (message.senderId === userId)
        setMessages((items) => [...items, message]);
    };
    const handleDelivered = ({ messageId }) =>
      setMessages((items) =>
        items.map((message) =>
          message.id === messageId
            ? { ...message, status: "delivered" }
            : message,
        ),
      );
    const handleRead = ({ messageIds }) =>
      setMessages((items) =>
        items.map((message) =>
          messageIds.includes(message.id)
            ? { ...message, status: "read" }
            : message,
        ),
      );
    socket.on("presence:update", handlePresence);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:message", handleMessage);
    socket.on("chat:delivered", handleDelivered);
    socket.on("chat:read", handleRead);
    socket.connect();
    socket.emit("user:online", currentUser.id);
    socket.emit("presence:get");
    return () => {
      socket.off("presence:update", handlePresence);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:message", handleMessage);
      socket.off("chat:delivered", handleDelivered);
      socket.off("chat:read", handleRead);
      socket.disconnect();
    };
  }, [currentUser, userId]);

  useEffect(() => {
    if (!currentUser || !messages.length) return;
    const unreadMessageIds = messages
      .filter(
        (message) =>
          message.senderId === userId &&
          message.status !== "read" &&
          !acknowledgedMessageIds.current.has(message.id),
      )
      .map((message) => message.id);
    if (!unreadMessageIds.length) return;
    unreadMessageIds.forEach((messageId) =>
      acknowledgedMessageIds.current.add(messageId),
    );
    fetch(`/api/chat/${userId}`, { method: "PATCH" });
    socket.emit("chat:read", {
      senderId: userId,
      messageIds: unreadMessageIds,
    });
  }, [currentUser, messages, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    const response = await fetch(`/api/chat/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) return;
    const data = await response.json();
    setMessages((items) => [...items, data.message]);
    setText("");
    socket.emit("chat:typing", { recipientId: userId, isTyping: false });
    socket.emit("chat:message", { recipientId: userId, message: data.message });
  };

  const updateText = (value) => {
    setText(value);
    socket.emit("chat:typing", {
      recipientId: userId,
      isTyping: Boolean(value.trim()),
    });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(
      () =>
        socket.emit("chat:typing", { recipientId: userId, isTyping: false }),
      1200,
    );
  };

  if (!otherUser)
    return <main className="mx-auto max-w-3xl p-6 mt-22">Loading chat...</main>;
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col px-4 py-6">
      <Link
        href="/"
        className="mb-4 flex w-fit items-center gap-2 text-sm text-green-700"
      >
        <ArrowLeft className="size-4" /> Back home
      </Link>
      <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
        <header className="border-b px-5 py-4">
          <h1 className="font-semibold text-slate-900">
            {otherUser.farmername}
          </h1>
          <p
            className={`text-xs ${online ? "text-green-600" : "text-slate-500"}`}
          >
            {online ? "Online" : formatLastSeen(lastSeen)}
          </p>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${message.senderId === currentUser?.id ? "bg-green-700 text-white" : "bg-white text-slate-800 shadow-sm"}`}
              >
                <p>{message.text}</p>
                {message.senderId === currentUser?.id && (
                  <span className="mt-1 block text-right text-[10px] opacity-75">
                    {message.status}
                  </span>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <p className="text-xs text-slate-500">
              {otherUser.farmername} is typing...
            </p>
          )}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={sendMessage} className="flex gap-2 border-t p-3">
          <Input
            value={text}
            onChange={(event) => updateText(event.target.value)}
            placeholder="Write a private message..."
            className="h-10"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="flex size-10 items-center justify-center rounded-lg bg-green-700 text-white"
          >
            <Send className="size-4" />
          </button>
        </form>
      </section>
    </main>
  );
}
