import { useEffect, useState } from "react";
import api from "../utils/api";
import "./MessagesTab.css";

export default function MessagesTab() {
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch inbox + sent messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const [inboxRes, sentRes] = await Promise.all([
          api.get("/messages/inbox", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/messages/sent", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setInbox(inboxRes.data);
        setSent(sentRes.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [token]);

  // Combine and sort messages between selected user
  useEffect(() => {
    if (!selectedUser) return;

    const chatMessages = [
      ...inbox.filter(m => m.sender._id === selectedUser._id),
      ...sent.filter(m => m.recipient._id === selectedUser._id),
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    setMessages(chatMessages);
  }, [selectedUser, inbox, sent]);

  const handleSendReply = async () => {
  if (!replyText.trim() || !selectedConversation) return;
  setLoading(true);

  try {
    const token = localStorage.getItem("token");
    const itemId = selectedConversation.item?._id;
    const recipientId = selectedConversation.otherUser?._id;

    if (!itemId || !recipientId) {
      console.error("Missing itemId or recipientId", { itemId, recipientId });
      alert("Error: Cannot send message. Missing item or recipient info.");
      setLoading(false);
      return;
    }

    console.log("Sending message:", { itemId, recipientId, text: replyText });

    const res = await api.post(
      "/messages",
      { itemId, recipientId, text: replyText },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const newMessage = res.data;

    setMessages((prev) => [...prev, newMessage]);
    setSelectedConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      lastMessage: newMessage.text,
      lastMessageTime: newMessage.createdAt,
    }));

    setReplyText("");
  } catch (err) {
    console.error("Send message error:", err.response?.data || err);
    alert("Failed to send message. Check console for details.");
  } finally {
    setLoading(false);
  }
};


  if (loading) return <p className="loading">Loading messages...</p>;

  const uniqueUsers = [
    ...new Map(
      [
        ...inbox.map(m => [m.sender._id, m.sender]),
        ...sent.map(m => [m.recipient._id, m.recipient]),
      ]
    ).values(),
  ];

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h3>Messages</h3>
        {uniqueUsers.map(user => (
          <div
            key={user._id}
            className={`chat-user ${selectedUser?._id === user._id ? "active" : ""}`}
            onClick={() => setSelectedUser(user)}
          >
            <span>{user.name}</span>
          </div>
        ))}
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h4>{selectedUser.name}</h4>
            </div>

            <div className="chat-messages">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`chat-bubble ${
                    m.sender._id === selectedUser._id ? "received" : "sent"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type a message..."
              />
              <button onClick={handleSend}>Send</button>
            </div>
          </>
        ) : (
          <p className="select-user">Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
}
