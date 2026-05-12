import { useState } from 'react';
import { timeSeriesData } from '../utils/mockData';

interface TimeSliderProps {
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const TimeSlider = ({ currentIndex, onIndexChange, isPlaying, onPlayPause }: TimeSliderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const formatTime = (timeStr: string): string => {
    const date = new Date(timeStr);
    return `${date.getHours().toString().padStart(2, '0')}:00`;
  };

  const handleMouseDown = () => { setIsDragging(true); };
  const handleMouseUp = () => { setIsDragging(false); };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newIndex = Math.round(percentage * (timeSeriesData.length - 1));
    onIndexChange(newIndex);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">PM2.5 浓度动态监测</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{formatTime(timeSeriesData[currentIndex]?.time || '')}</span>
          <button onClick={onPlayPause} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
            {isPlaying ? '暂停' : '播放'}
          </button>
        </div>
      </div>
      
      <div
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = Math.max(0, Math.min(1, x / rect.width));
          onIndexChange(Math.round(percentage * (timeSeriesData.length - 1)));
        }}
      >
        <div
          className="absolute h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / timeSeriesData.length) * 100}%` }}
        />
        <div
          className="absolute top-1/2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md transition-all"
          style={{ left: `${(currentIndex / (timeSeriesData.length - 1)) * 100}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>00:00</span>
        <span>12:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
};

export default TimeSlider;
