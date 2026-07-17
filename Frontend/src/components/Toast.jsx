import { AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

const Toast = ({ message, onClose }) => {
  // Auto-close after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-100 animate-[slideInRight_0.3s_ease-out]">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1A1515] border border-red-900/50 rounded-xl shadow-2xl shadow-red-900/20 max-w-sm">
        <AlertCircle size={18} className="text-red-500 shrink-0" />
        <p className="text-sm text-gray-200">{message}</p>
        <button 
          onClick={onClose}
          className="ml-2 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;