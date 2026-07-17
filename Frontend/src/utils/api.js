const API_BASE = "http://localhost:8000/api";

export const api = {
  uploadDocument: async (file, sessionId) => {
    const formData = new FormData();
    formData.append("file", file);
    if (sessionId) formData.append("sessionId", sessionId);

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Upload failed");
    }
    return res.json();
  },

  getSessionDocuments: async (sessionId) => {
    const res = await fetch(`${API_BASE}/documents/session/${sessionId}`);
    if (!res.ok) throw new Error("Failed to fetch documents");
    return res.json();
  },

  deleteDocument: async (id, sessionId) => {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    if (!res.ok) throw new Error("Failed to delete document");
    return res.json();
  },
  // Chat
  getChatHistory: async (sessionId) => {
    const res = await fetch(`${API_BASE}/chat/history/${sessionId}`);
    if (!res.ok) throw new Error("Failed to fetch history");
    return res.json();
  },

  clearChatHistory: async (sessionId) => {
    const res = await fetch(`${API_BASE}/chat/history/${sessionId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to clear history");
    return res.json();
  }
};