import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-6 left-6 z-50"
        >
          <div className="flex items-center gap-3 bg-black/80 backdrop-blur-lg border border-emerald-500/30 rounded-full px-4 py-2 shadow-lg shadow-emerald-500/10">
            <div className="relative">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <span className="text-sm text-white">
              <motion.span
                key={count}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-semibold text-emerald-400"
              >
                {count}
              </motion.span>
              {' '}people analyzing text right now
            </span>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-white transition ml-2"
            >
              &times;
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
