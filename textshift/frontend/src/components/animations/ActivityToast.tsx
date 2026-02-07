import { useState, useEffect } from 'react';
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

  if (!isVisible || !currentActivity) return null;

  return (
    <div className="fixed bottom-24 left-6 z-50 animate-slide-in-left">
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
    </div>
  );
}
