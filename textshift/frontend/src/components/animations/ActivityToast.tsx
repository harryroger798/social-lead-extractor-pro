import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const activities = [
  { name: 'Sarah', location: 'NYC', action: 'humanized 500 words' },
  { name: 'James', location: 'London', action: 'detected AI in essay' },
  { name: 'Emily', location: 'Toronto', action: 'checked plagiarism' },
  { name: 'Michael', location: 'Sydney', action: 'humanized 1,200 words' },
  { name: 'Lisa', location: 'Berlin', action: 'analyzed research paper' },
  { name: 'David', location: 'Tokyo', action: 'humanized blog post' },
  { name: 'Anna', location: 'Paris', action: 'detected AI content' },
  { name: 'Chris', location: 'Singapore', action: 'checked 3 documents' },
];

export default function ActivityToast() {
  const [currentActivity, setCurrentActivity] = useState<typeof activities[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showToast = () => {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      setCurrentActivity(randomActivity);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    };

    const initialDelay = setTimeout(showToast, 5000);

    const interval = setInterval(showToast, 15000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && currentActivity && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-24 left-6 z-50"
        >
          <div className="flex items-center gap-3 bg-black/90 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 shadow-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-white">
                <span className="font-semibold">{currentActivity.name}</span> from {currentActivity.location}
              </p>
                            <p className="text-xs text-gray-300">
                              just {currentActivity.action}
                            </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
