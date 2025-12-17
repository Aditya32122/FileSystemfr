import { useEffect } from "react";

export default function Notification({ message, type, onClear }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClear();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-gray-800 border-green-500 text-green-300' : 'bg-gray-800 border-red-500 text-red-300';

  return (
    <div className={`fixed bottom-5 right-5 border px-4 py-3 rounded-lg shadow-lg ${bgColor} z-[100]`} role="alert">
      <span className="block sm:inline">{message}</span>
    </div>
  );
}
