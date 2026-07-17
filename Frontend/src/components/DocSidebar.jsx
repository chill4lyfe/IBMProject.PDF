import { FileText, Trash2, UploadCloud, Loader2 } from "lucide-react";

const DocSidebar = ({ documents, isLoading, isUploading, onUpload, onDelete }) => {
  const isFull = documents.length >= 4;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div className="w-80 border-r border-royal-border bg-royal-panel flex flex-col h-full">
      <div className="p-5 border-b border-royal-border">
        <h2 className="text-sm font-semibold text-gray-300 flex justify-between items-center">
          Workspace Documents
          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
            {documents.length}/4
          </span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Document List */}
        {isLoading ? (
          <div className="text-sm text-gray-500 animate-pulse">Loading workspace...</div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div 
                key={doc._id || doc.id} 
                className="group flex items-center justify-between p-3 bg-[#1A2024] border border-white/5 rounded-lg hover:border-royal-border transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText size={16} className="text-teal-500 shrink-0" />
                  <div className="truncate">
                    <p className="text-sm text-gray-200 truncate">{doc.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {doc.tokenCount ? `${doc.tokenCount.toLocaleString()} tokens` : "Ready"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onDelete(doc._id || doc.id)}
                  className="p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Document"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Area (Integrated directly for minimalism) */}
        {!isLoading && (
          <div className={`mt-2 ${isFull ? "opacity-50 pointer-events-none" : ""}`}>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-royal-border rounded-xl hover:border-teal-500/50 hover:bg-teal-500/5 transition-all cursor-pointer bg-[#1A2024]">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isUploading ? (
                  <Loader2 size={24} className="text-royal-accent mb-2 animate-spin" />
                ) : (
                  <UploadCloud size={24} className="text-royal-muted mb-2" />
                )}
                <p className="text-sm text-gray-300 font-medium">
                  {isUploading ? "Processing Document..." : isFull ? "Workspace Full" : "Click or drag to upload"}
                </p>
                <p className="text-[10px] text-royal-muted mt-1 uppercase tracking-wider">
                  {isUploading ? "Extracting text..." : "PDF, TXT, MD (Max 10MB)"}
                </p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.txt,.md" 
                onChange={handleFileChange}
                disabled={isFull || isUploading}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocSidebar;