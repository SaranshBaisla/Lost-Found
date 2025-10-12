import { useState, useEffect } from "react";
import io from "socket.io-client";
import api from "../utils/api";
import "./Inbox.css";

// Use your deployed backend
const socket = io("https://lost-found-mogm.onrender.com");

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get current user & register socket
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(decoded.id);
        socket.emit("register", decoded.id);
      } catch (err) {
        console.error("Token decode failed:", err);
      }
    }

    // Cleanup socket on unmount
    return () => {
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, []);

  // Fetch inbox + sent messages
  useEffect(() => {
    if (!currentUserId) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const [inboxRes, sentRes] = await Promise.all([
          api.get("/messages/inbox", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/messages/sent", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const allMessages = [...inboxRes.data, ...sentRes.data];

        const grouped = allMessages.reduce((acc, msg) => {
          const otherUser = msg.sender._id === currentUserId ? msg.recipient : msg.sender;
          const key = `${otherUser._id}-${msg.item._id}`;

          if (!acc[key]) {
            acc[key] = {
              id: key,
              otherUser,
              item: msg.item,
              lastMessage: msg.text,
              lastMessageTime: msg.createdAt,
              messages: [],
            };
          }
          acc[key].messages.push(msg);
          return acc;
        }, {});

        const sorted = Object.values(grouped).sort(
          (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
        );

        setConversations(sorted);
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };

    fetchMessages();
  }, [currentUserId]);

  // Listen for incoming messages
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      const otherUser = message.sender._id === currentUserId ? message.recipient : message.sender;
      const key = `${otherUser._id}-${message.item._id}`;

      setConversations((prev) => {
        const existing = prev.find((c) => c.id === key);

        if (existing) {
          const updated = {
            ...existing,
            lastMessage: message.text,
            lastMessageTime: message.createdAt,
            messages: [...existing.messages, message],
          };
          return [updated, ...prev.filter((c) => c.id !== key)];
        } else {
          const newConv = {
            id: key,
            otherUser,
            item: message.item,
            lastMessage: message.text,
            lastMessageTime: message.createdAt,
            messages: [message],
          };
          return [newConv, ...prev];
        }
      });

      if (selectedConversation?.id === key) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [currentUserId, selectedConversation]);

  const selectConversation = (conv) => {
    setSelectedConversation(conv);
    setMessages(conv.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/messages",
        {
          itemId: selectedConversation.item._id,
          recipientId: selectedConversation.otherUser._id,
          text: replyText,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newMsg = res.data;
      socket.emit("sendMessage", newMsg);

      const updated = [...messages, newMsg];
      setMessages(updated);
      setSelectedConversation((prev) => ({
        ...prev,
        messages: updated,
        lastMessage: newMsg.text,
        lastMessageTime: newMsg.createdAt,
      }));

      setReplyText("");
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  return (
    <div className="inbox-container">
      <div className="inbox-layout">
        {/* Conversations Panel */}
        <div className="conversations-panel">
          <div className="panel-header">
            <h2>Messages</h2>
            <span className="message-count">{conversations.length}</span>
          </div>

          {conversations.length === 0 ? (
            <div className="empty-state">
              <p>No messages yet</p>
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.map((conv) => {
                const lastMessage = conv.messages[conv.messages.length - 1];
                const isYouSender = lastMessage?.sender._id === currentUserId;

                return (
                  <div
                    key={conv.id}
                    className={`conversation-item ${selectedConversation?.id === conv.id ? "active" : ""}`}
                    onClick={() => selectConversation(conv)}
                  >
                    <div className="conversation-avatar">
                      {conv.otherUser?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="conversation-details">
                      <div className="conversation-header">
                        <span className="conversation-name">
                          {isYouSender
                            ? `You → ${conv.otherUser?.name}`
                            : `${conv.otherUser?.name} → You`}
                        </span>
                        <span className="conversation-time">
                          {new Date(conv.lastMessageTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="conversation-item-title">{conv.item?.title}</div>
                      <div className="conversation-preview">{conv.lastMessage}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <div className="chat-panel">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="chat-avatar">
                    {selectedConversation.otherUser?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{selectedConversation.otherUser?.name}</h3>
                    <p className="chat-subtitle">
                      Regarding: <strong>{selectedConversation.item?.title}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.map((msg) => {
                  const isOwn = String(msg.sender._id) === String(currentUserId);
                  return (
                    <div key={msg._id} className={`message-bubble ${isOwn ? "own" : "other"}`}>
                      <div className="message-content">
                        {!isOwn && <div className="message-sender">{msg.sender.name}</div>}
                        <div className="message-text">{msg.text}</div>
                        <div className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="chat-input-container">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="chat-input"
                  rows={1}
                  disabled={loading}
                />
                <button
                  onClick={handleSendReply}
                  className="send-button"
                  disabled={!replyText.trim() || loading}
                >
                  {loading ? (
                    <div className="button-spinner"></div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="currentColor"
                    >
                      <path d="M2.01 21l20.99-9L2.01 3v7l15 2-15 2v7z" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <h3>Select a conversation</h3>
              <p>Choose a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
