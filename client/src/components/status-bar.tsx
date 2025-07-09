import { Clock, Signal, Wifi, Battery } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-primary text-white px-4 py-2 text-sm flex justify-between items-center">
      <span>{time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}</span>
      <span className="font-medium">TRUEFAM Tracker</span>
      <div className="flex space-x-2">
        <Signal className="w-3 h-3" />
        <Wifi className="w-3 h-3" />
        <Battery className="w-3 h-3" />
      </div>
    </div>
  );
}
