import React, { useState, useRef, useEffect } from "react";
import { Send, Square, Bot, User, ChevronDown, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { streamChatAsk } from "../utils/sseParser";
import remarkGfm from "remark-gfm";

const MarkdownComponents = {
  p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-gray-300 font-['Manrope'] font-light" {...props} />,
  strong: ({ node, ...props }) => <strong className="text-royal-accent font-semibold font-['Manrope']" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-300 font-['Manrope'] font-light" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-300 font-['Manrope'] font-light" {...props} />,
  li: ({ node, ...props }) => <li className="pl-1 text-gray-300 font-['Manrope'] font-light" {...props} />,
  code: ({ inline, className, children, ...props }) => {
    return inline ? (
      <code className="bg-royal-border/50 text-royal-accent px-1.5 py-0.5 rounded text-xs font-['Fira_Code'] tracking-tight" {...props}>{children}</code>
    ) : (
      <pre className="bg-[#0A0D0F] p-2.5 rounded-md border border-royal-border overflow-x-auto mb-3 font-['Fira_Code'] text-xs text-gray-300 tracking-normal leading-relaxed">
        <code {...props}>{children}</code>
      </pre>
    );
  },
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto mb-5 rounded-lg border border-royal-border">
      <table className="w-full text-left border-collapse text-sm" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="bg-royal-panel border-b border-royal-border" {...props} />,
  th: ({ node, ...props }) => <th className="px-4 py-3 font-semibold text-royal-accent border-r border-royal-border last:border-r-0 font-['Manrope']" {...props} />,
  tbody: ({ node, ...props }) => <tbody className="divide-y divide-royal-border/80 font-['Manrope'] font-light" {...props} />,
  tr: ({ node, ...props }) => <tr className="hover:bg-royal-panel/30 transition-colors font-['Manrope'] font-light" {...props} />,
  td: ({ node, ...props }) => <td className="px-4 py-3 border-r border-royal-border/80 last:border-r-0 font-['Manrope'] font-light" {...props} />,
};

const ChatBubble = React.memo(({ msg }) => (
  <div className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
    {msg.role === "model" && (
      <div className="w-8 h-8 rounded-full bg-royal-panel border border-royal-border flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <Bot size={16} className="text-royal-accent" />
      </div>
    )}
    
    <div className={`max-w-[80%] ${msg.role === "user" ? "bg-royal-panel border border-royal-border px-5 py-3 rounded-2xl rounded-tr-sm text-gray-200 shadow-sm" : "pt-1"}`}>
      {msg.role === "user" ? (
        <p className="whitespace-pre-wrap">{msg.content}</p>
      ) : (
        <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>
          {msg.content}
        </ReactMarkdown>
      )}
    </div>

    {msg.role === "user" && (
      <div className="w-8 h-8 rounded-full bg-teal-900/30 border border-teal-500/20 flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <User size={16} className="text-teal-400" />
      </div>
    )}
  </div>
));

const ChatBox = ({ activeSessionId, chatHistory, setChatHistory, setTotalTokens, totalTokens, showError }) => {
  const [input, setInput] = useState("");
  const [persona, setPersona] = useState(""); // Empty means default
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");

  const streamingTextRef = useRef("");  
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const textareaRef = useRef(null);

  const isCapped = totalTokens >= 256000;

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [chatHistory, streamingMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);
  const handleExportChat = () => {
    let content = `# WORKSPACE SESSION TRANSFER\n\n> **SYSTEM INSTRUCTION FOR AI:**\n> *The following is the complete conversation history 
    from a previous workspace session. Please process this entire document to absorb the context, facts, and progress already established. 
    Treat this as your foundational memory for our new conversation, and seamlessly resume assisting the user based on this context.*\n\n---\n\n`;
    
    chatHistory.forEach(msg => {
      content += `### ${msg.role === 'user' ? 'User' : 'Helper'}\n${msg.content}\n\n---\n\n`;
    });

    // Create a Blob and trigger download
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-transfer-${activeSessionId.slice(-6)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleSend = async () => {
    if (!input.trim() || !activeSessionId || isStreaming || isCapped) return;
    const userQuestion = input.trim();
    setInput("");
    setChatHistory((prev) => [...prev, { role: "user", content: userQuestion }]);
    
    // Reset our states and ref
    streamingTextRef.current = ""; 
    setStreamingMessage("");
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    await streamChatAsk(
      activeSessionId,
      userQuestion,
      persona,
      (chunk) => {
        // Update the ref FIRST, then the state. This prevents the disappearing bug!
        streamingTextRef.current += chunk;
        setStreamingMessage(streamingTextRef.current);
      },
      (newTotalTokens) => {
        setIsStreaming(false);
        // Use the ref here instead of the state variable
        setChatHistory((prev) => [...prev, { role: "model", content: streamingTextRef.current }]);
        if (newTotalTokens) setTotalTokens(newTotalTokens);
      },
      (error) => {
        setIsStreaming(false);
        showError(error);
      },
      abortControllerRef.current.signal
    );
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      // Use the ref here too
      setChatHistory((prev) => [...prev, { role: "model", content: streamingTextRef.current + " *(Stopped by user)*" }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

return (
    <div className="flex-1 flex flex-col relative h-full overflow-hidden">
      
      {/* NEW: Top Gradient Fade Overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-royal-bg via-royal-bg/80 to-transparent z-10 pointer-events-none"></div>

      {/* Chat History Area (Removed 'no-scrollbar' so the custom one shows) */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-8 relative z-0 transition-all duration-300 ${isCapped ? "pb-72" : "pb-40"}`}>
        {chatHistory.length === 0 && !isStreaming ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Bot size={48} className="text-royal-muted mb-4" />
            <h3 className="text-xl font-medium text-gray-200 mb-2">How can I help you today?</h3>
            <p className="text-sm text-royal-muted max-w-md">Upload documents to the workspace on the left, or ask me a general question to get started.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 pt-24">
            {chatHistory.map((msg, idx) => (
              <ChatBubble key={idx} msg={msg} /> 
            ))}

            {isStreaming && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-royal-panel border border-royal-border flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot size={16} className="text-royal-accent" />
                </div>
                <div className="pt-1 max-w-[80%]">
                  <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>{streamingMessage}</ReactMarkdown>
                  <span className="inline-block w-2.5 h-4 ml-1 bg-royal-accent animate-pulse align-middle rounded-sm"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className={`transition-all ${isCapped ? "h-60" : "h-20"}`} />
          </div>
        )}
      </div>

      {/* NEW: Extended Bottom Gradient Mask */}
      <div className="absolute bottom-24 left-0 right-0 h-20 bg-linear-to-t from-royal-bg to-transparent z-10 pointer-events-none"></div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-royal-bg z-20">
        <div className="max-w-4xl mx-auto">
          {isCapped ? (
            <div className="p-5 bg-royal-panel border border-royal-border rounded-2xl shadow-2xl flex flex-col items-center justify-center gap-3 text-center">
              <div className="text-royal-accent font-medium">Context Limit Reached</div>
              <p className="text-sm text-royal-muted max-w-md">
                This session has reached its maximum memory capacity. To maintain high-quality responses, please export this chat and start a new workspace.
              </p>
              <button 
                onClick={handleExportChat}
                className="mt-2 px-6 py-2.5 bg-royal-accent text-royal-bg font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Download size={16} />
                Download Chat Transfer (.md)
              </button>
            </div>
          ) : (
            <div className="bg-royal-panel border border-royal-border rounded-2xl shadow-2xl flex items-end p-2 focus-within:border-royal-muted transition-colors">
              
              <div className="relative shrink-0 mb-1 ml-1">
                <select 
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="appearance-none bg-transparent text-royal-accent text-sm font-medium pl-3 pr-8 py-2 outline-none cursor-pointer border-r border-royal-border/50"
                >
                  <option value="" className="bg-royal-bg">Select Persona</option>
                  <option value="Financial Advisor" className="bg-royal-bg">Financial Analyst</option>
                  <option value="Legal Drafter" className="bg-royal-bg">Legal Analyst</option>
                  <option value="Research Assistant" className="bg-royal-bg">Research Assistant</option>
                  <option value="Technical Writer" className="bg-royal-bg">Technical Writer</option>
                  <option value="Software Expert" className="bg-royal-bg">Software Expert</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-royal-accent pointer-events-none" />
              </div>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your documents..."
                className="flex-1 bg-transparent text-gray-200 text-sm px-4 py-2.5 outline-none resize-none max-h-37.5 placeholder:text-royal-muted"
                rows={1}
              />

              <div className="shrink-0 mb-1 mr-1">
                {isStreaming ? (
                  <button onClick={handleStop} className="p-2.5 bg-royal-border text-gray-300 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-colors">
                    <Square size={18} className="fill-current" />
                  </button>
                ) : (
                  <button 
                    onClick={handleSend} 
                    disabled={!input.trim() || !activeSessionId}
                    className="p-2.5 bg-royal-accent text-royal-bg rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-md"
                  >
                    <Send size={18} className="ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="text-center mt-3 text-[10px] text-royal-muted">
            AI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;