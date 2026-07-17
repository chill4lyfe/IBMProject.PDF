const STORAGE_KEY = "rocket_workspace_data";

const getDefaultData = () => ({
  activeSessionId: null,
  sessions: [], // Array of { id, title, updatedAt }
});

export const getStorageData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : getDefaultData();
};

export const saveStorageData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getActiveSessionId = () => getStorageData().activeSessionId;

export const setActiveSessionId = (id) => {
  const data = getStorageData();
  data.activeSessionId = id;
  saveStorageData(data);
};

export const saveOrUpdateSession = (id, title = "New Workspace") => {
  const data = getStorageData();
  const existingIndex = data.sessions.findIndex((s) => s.id === id);
  
  if (existingIndex >= 0) {
    data.sessions[existingIndex].updatedAt = new Date().toISOString();
    // Only update title if it's explicitly provided and not the default
    if (title !== "New Workspace") data.sessions[existingIndex].title = title;
  } else {
    data.sessions.unshift({ id, title, updatedAt: new Date().toISOString() });
  }
  
  saveStorageData(data);
  return data.sessions;
};

export const deleteSessionFromStorage = (id) => {
  const data = getStorageData();
  data.sessions = data.sessions.filter((s) => s.id !== id);
  if (data.activeSessionId === id) {
    data.activeSessionId = data.sessions.length > 0 ? data.sessions[0].id : null;
  }
  saveStorageData(data);
  return data;
};

export const renameSessionInStorage = (id, newTitle) => {
  const data = getStorageData();
  const session = data.sessions.find(s => s.id === id);
  if (session) {
    session.title = newTitle;
    session.updatedAt = new Date().toISOString();
    saveStorageData(data);
  }
  return data.sessions;
};