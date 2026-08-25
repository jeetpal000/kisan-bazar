"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  Bell,
  MessageCircle,
  Mic,
  Phone,
  PhoneOff,
  Search,
  Send,
} from "lucide-react";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { Input } from "@/components/ui/input";
import Image from "next/image";

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
  const [activeUsers, setActiveUsers] = useState(0);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const acknowledgedMessageIds = useRef(new Set());
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteAudio = useRef(null);
  const pendingIceCandidates = useRef([]);
  const callId = useRef(null);
  const callStatusRef = useRef("idle");
  const [callStatus, setCallStatus] = useState("idle");
  const [callError, setCallError] = useState("");

  const closeCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;
    localStream.current?.getTracks().forEach((track) => track.stop());
    localStream.current = null;
    pendingIceCandidates.current = [];
    callId.current = null;
    callStatusRef.current = "idle";
    setCallStatus("idle");
  };

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

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
      setActiveUsers(onlineUserIds.length);
    };
    const handleTyping = ({ userId: senderId, isTyping }) => {
      if (senderId === userId) setTyping(isTyping);
    };
    const handleMessage = (message) => {
      if (message.senderId === userId) {
        setMessages((items) => [...items, message]);
        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          new Notification(otherUser?.farmername || "New message", {
            body: message.text,
            tag: `chat-${userId}`,
          });
        }
      }
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
    const handleIncomingCall = async ({
      callId: incomingCallId,
      callerId,
      callerName,
    }) => {
      if (callStatusRef.current !== "idle") {
        socket.emit("call:reject", { callId: incomingCallId, callerId });
        return;
      }
      callId.current = incomingCallId;
      setCallStatus("ringing");
      setCallError("");
      if ("Notification" in window) {
        if (Notification.permission === "default")
          await Notification.requestPermission();
        if (Notification.permission === "granted") {
          new Notification(`${callerName} is calling`, {
            body: "Open Kisan Bazar to answer",
          });
        }
      }
    };
    const handleCallAccepted = async ({ callId: acceptedCallId }) => {
      if (acceptedCallId !== callId.current) return;
      setCallStatus("connected");
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("call:signal", {
        callId: acceptedCallId,
        recipientId: userId,
        type: "offer",
        signal: offer,
      });
    };
    const handleCallSignal = async ({ callId: signalCallId, type, signal }) => {
      if (signalCallId !== callId.current || !peerConnection.current) return;
      if (type === "offer") {
        await peerConnection.current.setRemoteDescription(signal);
        for (const candidate of pendingIceCandidates.current) {
          await peerConnection.current.addIceCandidate(candidate);
        }
        pendingIceCandidates.current = [];
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("call:signal", {
          callId: signalCallId,
          recipientId: userId,
          type: "answer",
          signal: answer,
        });
      } else if (type === "answer") {
        await peerConnection.current.setRemoteDescription(signal);
        for (const candidate of pendingIceCandidates.current) {
          await peerConnection.current.addIceCandidate(candidate);
        }
        pendingIceCandidates.current = [];
      } else if (type === "ice-candidate") {
        if (peerConnection.current.remoteDescription) {
          await peerConnection.current.addIceCandidate(signal);
        } else {
          pendingIceCandidates.current.push(signal);
        }
      }
    };
    const handleCallEnded = ({ callId: endedCallId }) => {
      if (endedCallId === callId.current) closeCall();
    };
    const handleCallRejected = ({ callId: rejectedCallId }) => {
      if (rejectedCallId !== callId.current) return;
      setCallError("Call was declined");
      closeCall();
    };
    const handleCallBusy = ({ callId: busyCallId }) => {
      if (busyCallId !== callId.current) return;
      setCallError("User is busy on another call");
      closeCall();
    };
    const handleCallUnavailable = ({ callId: unavailableCallId }) => {
      if (unavailableCallId !== callId.current) return;
      setCallError("User is unavailable");
      closeCall();
    };
    socket.on("presence:update", handlePresence);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:message", handleMessage);
    socket.on("chat:delivered", handleDelivered);
    socket.on("chat:read", handleRead);
    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("call:signal", handleCallSignal);
    socket.on("call:ended", handleCallEnded);
    socket.on("call:rejected", handleCallRejected);
    socket.on("call:busy", handleCallBusy);
    socket.on("call:unavailable", handleCallUnavailable);
    socket.connect();
    socket.emit("user:online", currentUser.id);
    socket.emit("presence:get");
    return () => {
      socket.off("presence:update", handlePresence);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:message", handleMessage);
      socket.off("chat:delivered", handleDelivered);
      socket.off("chat:read", handleRead);
      socket.off("call:incoming", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("call:signal", handleCallSignal);
      socket.off("call:ended", handleCallEnded);
      socket.off("call:rejected", handleCallRejected);
      socket.off("call:busy", handleCallBusy);
      socket.off("call:unavailable", handleCallUnavailable);
      closeCall();
      socket.disconnect();
    };
  }, [currentUser, otherUser?.farmername, userId]);

  const createPeerConnection = async () => {
    localStream.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const connection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    localStream.current
      .getTracks()
      .forEach((track) => connection.addTrack(track, localStream.current));
    connection.ontrack = ({ streams }) => {
      if (remoteAudio.current && streams[0])
        remoteAudio.current.srcObject = streams[0];
    };
    connection.onicecandidate = ({ candidate }) => {
      if (candidate && callId.current) {
        socket.emit("call:signal", {
          callId: callId.current,
          recipientId: userId,
          type: "ice-candidate",
          signal: candidate,
        });
      }
    };
    connection.onconnectionstatechange = () => {
      if (
        ["failed", "disconnected", "closed"].includes(
          connection.connectionState,
        )
      )
        closeCall();
    };
    peerConnection.current = connection;
  };

  const startCall = async () => {
    if (callStatus !== "idle") return;
    try {
      setCallError("");
      await createPeerConnection();
      callId.current = crypto.randomUUID();
      setCallStatus("calling");
      socket.emit("call:start", {
        callId: callId.current,
        recipientId: userId,
        callerName: currentUser.farmername,
      });
    } catch {
      setCallError("Microphone permission is required");
      closeCall();
    }
  };

  const acceptCall = async () => {
    try {
      await createPeerConnection();
      setCallStatus("connected");
      socket.emit("call:accept", { callId: callId.current, callerId: userId });
    } catch {
      socket.emit("call:reject", { callId: callId.current, callerId: userId });
      setCallError("Microphone permission is required");
      closeCall();
    }
  };

  const rejectCall = () => {
    socket.emit("call:reject", { callId: callId.current, callerId: userId });
    closeCall();
  };

  const endCall = () => {
    socket.emit("call:end", { callId: callId.current });
    closeCall();
  };

  const enableNotifications = async () => {
    if (typeof Notification !== "undefined")
      await Notification.requestPermission();
  };

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

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [recentChats, setRecentChats] = useState([]);

  useEffect(() => {
    const loadRecentChats = async () => {
      const response = await fetch("/api/chat/recent", { cache: "no-store" });
      if (response.ok) setRecentChats((await response.json()).chats);
    };
    loadRecentChats();
  }, [userId, messages.length]);

  useEffect(() => {
    const loadUsers = async () => {
      const response = await fetch(
        `/api/chat/users?search=${encodeURIComponent(search)}`,
      );
      if (response.ok) setUsers((await response.json()).users);
    };
    const timeout = setTimeout(loadUsers, 250);
    return () => clearTimeout(timeout);
  }, [isOpen, search]);

  if (!otherUser)
    return <main className="mx-auto max-w-3xl p-6 mt-20">Loading chat...</main>;
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full flex-col px-4 py-6 mt-18">
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
        <div
          className={`absolute inset-y-0 left-0 z-10 w-[min(86vw,21rem)] border-r bg-white transition-transform duration-300 md:relative md:z-0 md:block md:w-80 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Chats</h2>
                <p className="text-xs text-slate-500">
                  {activeUsers} farmers online now
                </p>
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
              {(search ? users : recentChats).map((user) => (
                <Link
                  key={user.id}
                  href={`/chat/${user.id}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg p-3 hover:bg-green-50 ${user.id === userId ? "bg-green-50" : ""}`}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100 font-semibold text-green-800">
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt=""
                        width={100}
                        height={100}
                        className="size-full object-cover"
                      />
                    ) : (
                      user.farmername?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-500">
                      {user.farmername}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.lastMessage || user.role || "Start a conversation"}
                    </p>
                  </div>
                  {user.unreadCount > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-green-700 text-[10px] text-white">
                      {user.unreadCount}
                    </span>
                  )}
                </Link>
              ))}
              {!(search ? users : recentChats).length && (
                <p className="py-6 text-center text-sm text-slate-500">
                  {search ? "No users found" : "No recent chats"}
                </p>
              )}
            </div>
          </div>
        </div>
        <section className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-white">
          <header className="z-1 flex shrink-0 items-center gap-3 border-b bg-white px-5 py-4">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Open chats"
              className="md:hidden"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-green-100 font-semibold text-green-800">
              {otherUser.profileImage ? (
                <Image
                  src={otherUser.profileImage}
                  alt=""
                  width={100}
                  height={100}
                  className="size-full object-cover"
                />
              ) : (
                otherUser.farmername?.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="font-semibold text-foreground">
                {otherUser.farmername}
              </h1>
              <p
                className={`text-xs ${online ? "text-green-600" : "text-slate-500"}`}
              >
                {online ? "Online" : formatLastSeen(lastSeen)}
              </p>
            </div>
            <button
              type="button"
              onClick={startCall}
              disabled={callStatus !== "idle" || !online}
              aria-label={`Call ${otherUser.farmername}`}
              title={!online ? "User is offline" : "Start audio call"}
              className="ml-auto flex size-10 items-center justify-center rounded-full bg-green-700 text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Phone className="size-4" />
            </button>
            {typeof Notification !== "undefined" &&
              Notification.permission !== "granted" && (
                <button
                  type="button"
                  onClick={enableNotifications}
                  aria-label="Enable message notifications"
                  title="Enable message notifications"
                  className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <Bell className="size-4" />
                </button>
              )}
          </header>
          {callStatus !== "idle" && (
            <div className="flex items-center gap-3 border-b bg-green-50 px-5 py-3 text-sm text-green-900">
              <Mic className="size-4" />
              <span className="flex-1">
                {callStatus === "calling" &&
                  `Calling ${otherUser.farmername}...`}
                {callStatus === "ringing" &&
                  `${otherUser.farmername} is calling...`}
                {callStatus === "connected" && "Audio call connected"}
              </span>
              {callStatus === "ringing" ? (
                <>
                  <button
                    type="button"
                    onClick={acceptCall}
                    className="rounded-md bg-green-700 px-3 py-1.5 text-white"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={rejectCall}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-red-700"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={endCall}
                  aria-label="End audio call"
                  className="flex size-8 items-center justify-center rounded-full bg-red-600 text-white"
                >
                  <PhoneOff className="size-4" />
                </button>
              )}
            </div>
          )}
          {callError && (
            <p className="border-b bg-red-50 px-5 py-2 text-xs text-red-700">
              {callError}
            </p>
          )}
          <audio ref={remoteAudio} autoPlay className="hidden" />
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${message.senderId === currentUser?.id ? "bg-[#d2d2d2] text-[#2b2b2b]" : "bg-green-700 text-[white] shadow-sm"}`}
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
      </div>
    </main>
  );
}
