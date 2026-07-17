import { useState, useEffect, useRef } from "react";
import { MessageSquare, Plus, Rocket, Pin, PinOff, MoreVertical, Pencil, Trash2, Check, X } from "lucide-react";

const LeftNav = ({ sessions, activeSessionId, onNewChat, onSelectSession, isOpen, onToggle, onRename, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [isHoveredOpen, setIsHoveredOpen] = useState(false);
  const menuRef = useRef(null);

  // Close drop-down menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpenId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startEdit = (e, session) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
    setMenuOpenId(null);
  };

  const saveEdit = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) onRename(id, editTitle.trim());
    setEditingId(null);
  };

  // Determine if the panel should visually display as open
  const isVisiblyOpen = isOpen || isHoveredOpen;

  return (
    <>
      {/* INVISIBLE HOVER TRIGGER ZONE: Stays stuck to the far left when collapsed */}
      {!isOpen && (
        <div 
          className="fixed left-0 top-0 h-full w-3 z-40 cursor-w-resize"
          onMouseEnter={() => setIsHoveredOpen(true)}
        />
      )}

      {/* THE SIDEBAR CONTAINER */}
      <div
        ref={menuRef}
        onMouseLeave={() => setIsHoveredOpen(false)}
        className={`h-full border-r border-royal-border bg-royal-bg flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? "relative w-72" : "fixed left-0 top-0 z-50 w-72"}
          ${isVisiblyOpen ? "translate-x-0 opacity-100 shadow-2xl shadow-black/50" : "-translate-x-full opacity-0 pointer-events-none"}
        `}
      >
        {/* HEADER SECTION */}
        <div className="p-5 border-b border-royal-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-royal-panel flex items-center justify-center border border-royal-border">
              <Rocket size={16} className="text-royal-accent" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide text-gray-100">HELPER</h1>
              <p className="text-[14px] uppercase tracking-wider text-royal-muted font-bold">By Rocket</p>
            </div>
          </div>
          <button 
            onClick={() => {
              onToggle();
              setIsHoveredOpen(false); // Kill hover override on formal toggle
            }} 
            className={`p-1.5 rounded-md transition-all ${
              isOpen 
                ? "text-royal-accent bg-royal-panel border border-royal-border" 
                : "text-royal-muted hover:text-royal-accent hover:bg-royal-panel"
            }`}
            title={isOpen ? "Unpin Sidebar" : "Pin Sidebar"}
          >
            {isOpen ? <Pin size={16} className="rotate-45" /> : <PinOff size={16} />}
          </button>
        </div>

        {/* ACTION BUTTON */}
        <div className="p-4">
          <button onClick={onNewChat} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-royal-panel border border-royal-border rounded-lg hover:border-royal-muted transition-all text-sm font-medium text-gray-200">
            <Plus size={16} /> New Chat
          </button>
        </div>

        {/* RECENT CHATS THREAD LIST */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          <div className="px-2 pb-2 text-[11px] font-semibold text-royal-muted uppercase tracking-wider">Recent Chats</div>
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                activeSessionId === session.id ? "bg-royal-panel border border-royal-border text-royal-accent" : "text-royal-muted hover:bg-royal-panel/50 border border-transparent"
              }`}
            >
              {editingId === session.id ? (
                <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
                  <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(e, session.id)} className="bg-transparent border-b border-royal-accent text-sm text-gray-200 w-full focus:outline-none" />
                  <button onClick={(e) => saveEdit(e, session.id)} className="text-green-500 hover:text-green-400"><Check size={14}/></button>
                  <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400"><X size={14}/></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={15} className="shrink-0" />
                    <span className="text-sm truncate font-light tracking-wide">{session.title}</span>
                  </div>
                  
                  {/* 3-Dots Menu Button */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === session.id ? null : session.id); }}
                    className={`p-1 rounded-md hover:bg-royal-border transition-opacity ${activeSessionId === session.id || menuOpenId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <MoreVertical size={14} className="text-royal-muted hover:text-gray-200" />
                  </button>

                  {/* Dropdown Menu */}
                  {menuOpenId === session.id && (
                    <div className="absolute right-2 top-10 w-32 bg-royal-bg border border-royal-border rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                      <button onClick={(e) => startEdit(e, session)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-royal-panel hover:text-royal-accent transition-colors">
                        <Pencil size={12} /> Rename
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(session.id); setMenuOpenId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default LeftNav;