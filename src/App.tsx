import { useState, useEffect, useCallback } from 'react';
import ParticleMap from './components/ParticleMap';
import TimeSlider from './components/TimeSlider';
import StatisticsPanel from './components/StatisticsPanel';
import { timeSeriesData } from './utils/mockData';
import '@arcgis/core/assets/esri/themes/light/main.css';

function App() {
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTimeIndex((prev) => (prev + 1) % timeSeriesData.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">ArcGIS 区域颗粒浓度动态显示</h1>
            <p className="text-sm text-blue-100">基于天地图底图 | PM2.5实时监测系统</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">数据更新时间</div>
            <div className="font-medium">
              {new Date(timeSeriesData[currentTimeIndex]?.time || Date.now()).toLocaleString('zh-CN')}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <ParticleMap currentTimeIndex={currentTimeIndex} />
        </div>
        
        <div className="w-72 p-4 space-y-4 overflow-y-auto bg-gray-50">
          <TimeSlider
            currentIndex={currentTimeIndex}
            onIndexChange={setCurrentTimeIndex}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
          />
          <StatisticsPanel currentTimeIndex={currentTimeIndex} />
        </div>
      </div>
    </div>
  );
}

export default App;
