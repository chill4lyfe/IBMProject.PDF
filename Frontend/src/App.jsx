import { useState, useEffect } from 'react';
import { getStorageData, setActiveSessionId, saveOrUpdateSession, renameSessionInStorage, deleteSessionFromStorage } from './utils/storage';
import { api } from './utils/api';
import LeftNav from './components/LeftNav';
import DocSidebar from './components/DocSidebar';
import ChatBox from './components/ChatBox';
import { Rocket, Shield, Zap } from 'lucide-react';
import Toast from './components/Toast';

function App() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionIdState, setActiveSessionIdState] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(true);
  
  // NEW: State to track if the user has entered the workspace
  const [isAppStarted, setIsAppStarted] = useState(false);
  
  const [documents, setDocuments] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  useEffect(() => {
    const data = getStorageData();
    setSessions(data.sessions);
    // We load the ID into state, but we DO NOT start the app yet.
    setActiveSessionIdState(data.activeSessionId);
  }, []);

  useEffect(() => {
    const loadSessionData = async () => {
      // Only fetch if the app has started and we have an ID
      if (!activeSessionIdState || !isAppStarted) {
        setDocuments([]);
        setChatHistory([]);
        setTotalTokens(0);
        return;
      }

      setIsLoadingDocs(true);
      try {
        const [docsRes, historyRes] = await Promise.all([
          api.getSessionDocuments(activeSessionIdState),
          api.getChatHistory(activeSessionIdState)
        ]);
        
        const fetchedDocs = docsRes.data.documents || [];
        setDocuments(fetchedDocs);
        setChatHistory(historyRes.data.history || []);
        console.log("Backend sent totalTokens on load:", docsRes.data.totalTokens);

        // Set the exact token count from the database
        if (docsRes.data.totalTokens !== undefined) {
          setTotalTokens(docsRes.data.totalTokens);
        } else {
          // Absolute fallback just in case the backend fails to send it
          const docTokens = fetchedDocs.reduce((sum, doc) => sum + (doc.tokenCount || 0), 0);
          setTotalTokens(docTokens);
        }
      } catch (error) {
        console.error("Failed to load session:", error);
        showError("Failed to load chat history. Please check your connection.");
      } finally {
        setIsLoadingDocs(false);
      }
    };

    loadSessionData();
  }, [activeSessionIdState, isAppStarted]);

  // Handlers
  const handleNewChat = () => {
    setIsAppStarted(true); // Transition to workspace
    setActiveSessionIdState(null);
    setActiveSessionId(null);
  };

  const handleSelectSession = (id) => {
    setIsAppStarted(true); // Transition to workspace
    setActiveSessionIdState(id);
    setActiveSessionId(id);
  };

  const handleRename = (id, newTitle) => {
    const updated = renameSessionInStorage(id, newTitle);
    setSessions(updated);
  };

  const handleDeleteSession = (id) => {
    const updatedData = deleteSessionFromStorage(id);
    setSessions(updatedData.sessions);
    if (activeSessionIdState === id) {
      setActiveSessionIdState(updatedData.activeSessionId);
      // If they deleted the active chat, we can optionally kick them back to the intro
      if (updatedData.sessions.length === 0) setIsAppStarted(false);
    }
  };

  const handleUpload = async (file) => {
    setIsUploading(true);
    try {
      const res = await api.uploadDocument(file, activeSessionIdState);
      const { sessionId, document, sessionTokens } = res.data;

      if (!activeSessionIdState) {
        const updatedSessions = saveOrUpdateSession(sessionId, "New Workspace");
        setSessions(updatedSessions);
        setActiveSessionIdState(sessionId);
        setActiveSessionId(sessionId);
      }

      setDocuments(prev => [...prev, document]);
      if (sessionTokens) setTotalTokens(sessionTokens);
    } catch (error) {
      showError(error.message || "Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  const showError = (msg) => setErrorMessage(msg);

  const handleDeleteDoc = async (docId) => {
    try {
      const docToDelete = documents.find(d => (d._id || d.id) === docId);
      await api.deleteDocument(docId, activeSessionIdState);
      setDocuments(prev => prev.filter(d => (d._id || d.id) !== docId));
      if (docToDelete && docToDelete.tokenCount) {
        setTotalTokens(prev => Math.max(0, prev - docToDelete.tokenCount));
      }
    } catch (error) {
      console.error("Failed to delete document", error);
      showError("Failed to delete document. Please try again.");
    }
  };

  return (
    <div className="flex h-screen w-full bg-royal-bg text-gray-100 font-sans overflow-hidden">

      {/* PANE 1: Leftmost Nav */}
      <LeftNav 
        sessions={sessions} 
        activeSessionId={activeSessionIdState}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        isOpen={isNavOpen} // <-- Add this line: Pass the layout state as a prop
        onToggle={() => setIsNavOpen(!isNavOpen)} // <-- Updated toggle line
        onRename={handleRename}
        onDelete={handleDeleteSession}
      />

      {/* CONDITIONAL RENDERING: Intro Cover vs Workspace */}
      {!isAppStarted ? (
        
        /* --- THE ROYAL INTRO COVER --- */
        <div className="flex-1 flex flex-col items-center justify-center relative bg-royal-bg overflow-hidden transition-opacity duration-1000">
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-royal-accent/7 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="z-10 flex flex-col items-center text-center animate-[fadeIn_1s_ease-in-out]">
            <div className="w-20 h-20 rounded-2xl bg-royal-panel border border-royal-border flex items-center justify-center mb-8 shadow-2xl shadow-black/50">
              <Rocket size={40} strokeWidth={1.5} className="text-royal-accent" />
            </div>
            
            <h1 className="text-7xl font-light tracking-widest text-gray-100 mb-4 uppercase">Helper</h1>
            <p className="text-royal-muted text-lg tracking-widest uppercase font-bold mb-12">By Team Rocket</p>
            
            <div className="flex gap-16 text-left mb-12">
              <div className="flex flex-col items-center max-w-50 text-center">
                <Shield size={22} className="text-royal-accent mb-3 opacity-80" />
                <h3 className="text-medium font-medium text-gray-200 mb-2">Private Workspace</h3>
                <p className="text-xs text-royal-muted leading-relaxed">Your documents are processed securely. All conversations are stored locally.</p>
              </div>
              <div className="flex flex-col items-center max-w-50 text-center">
                <Zap size={22} className="text-royal-accent mb-3 opacity-80" />
                <h3 className="text-medium font-medium text-gray-200 mb-2">1M Token Context</h3>
                <p className="text-xs text-royal-muted leading-relaxed">Analyze massive datasets and entire books simultaneously without losing contexts</p>
              </div>
            </div>

            <button 
              onClick={handleNewChat}
              className="px-11 py-3 bg-royal-accent text-royal-bg font-medium rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-royal-accent/10"
            >
              Initialize Workspace
            </button>
            <p className="text-xs text-royal-muted mt-4">or select an existing chat from the sidebar</p>
          </div>
        </div>

      ) : (

        /* --- THE WORKSPACE (Panes 2 & 3) --- */
        <>
          {/* PANE 2: Middle-Left Docs */}
          <div className="w-80 border-r border-royal-border bg-royal-panel flex flex-col animate-[fadeIn_0.5s_ease-in-out]">
            <DocSidebar 
              documents={documents}
              isLoading={isLoadingDocs}
              isUploading={isUploading}
              onUpload={handleUpload}
              onDelete={handleDeleteDoc}
            />
          </div>

          {/* PANE 3: Wide Right Chat */}
          <div className="flex-1 flex flex-col relative bg-royal-bg animate-[fadeIn_0.5s_ease-in-out]">
            
            {/* Z-INDEX FIX: Changed z-10 to z-50 */}
            <div className="absolute top-4 right-4 z-50">
              <div className="px-3 py-1.5 bg-royal-panel border border-royal-border rounded-full text-xs flex items-center gap-2 font-medium text-royal-muted shadow-lg">
                <span className={`w-2 h-2 rounded-full animate-pulse ${totalTokens >= 190000 ? 'bg-red-500' : 'bg-royal-accent'}`}></span>
                Context: {totalTokens.toLocaleString()} / 190k
              </div>
            </div>

            <ChatBox 
              activeSessionId={activeSessionIdState}
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              totalTokens={totalTokens}
              setTotalTokens={setTotalTokens}
              showError={showError}
            />
          </div>
        </>
      )}
      <Toast message={errorMessage} onClose={() => setErrorMessage(null)} />
    </div>
  );
}

export default App;