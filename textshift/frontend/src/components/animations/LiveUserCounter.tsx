import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

export default function LiveUserCounter() {
  const [count, setCount] = useState(127);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(100, Math.min(200, prev + change));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-fade-in-up">
      <div className="flex items-center gap-3 bg-black/80 backdrop-blur-lg border border-emerald-500/30 rounded-full px-4 py-2 shadow-lg shadow-emerald-500/10">
        <div className="relative">
          <Users className="w-4 h-4 text-emerald-400" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </div>
        <span className="text-sm text-white">
          <span className="font-semibold text-emerald-400">{count}</span>
          {' '}people analyzing text right now
        </span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-300 hover:text-white transition ml-2" aria-label="Close notification"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
