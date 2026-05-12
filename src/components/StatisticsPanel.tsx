import { timeSeriesData, getConcentrationColor } from '../utils/mockData';

interface StatisticsPanelProps {
  currentTimeIndex: number;
}

const StatisticsPanel = ({ currentTimeIndex }: StatisticsPanelProps) => {
  const currentData = timeSeriesData[currentTimeIndex];
  if (!currentData) return null;

  const avgConcentration = Math.round(
    currentData.regions.reduce((sum, r) => sum + r.concentration, 0) / currentData.regions.length
  );

  const maxRegion = currentData.regions.reduce((max, r) => r.concentration > max.concentration ? r : max);
  const minRegion = currentData.regions.reduce((min, r) => r.concentration < min.concentration ? r : min);

  const getConcentrationLevel = (value: number): string => {
    if (value <= 35) return '优';
    if (value <= 75) return '良';
    if (value <= 115) return '轻度污染';
    if (value <= 150) return '中度污染';
    if (value <= 250) return '重度污染';
    return '严重污染';
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">实时统计</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">平均浓度</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">{avgConcentration}</span>
            <span className="text-sm text-gray-400">μg/m³</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">等级: {getConcentrationLevel(avgConcentration)}</div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">最高浓度</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-red-600">{Math.round(maxRegion.concentration)}</span>
            <span className="text-sm text-gray-400">μg/m³</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">地点: {maxRegion.name}</div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">最低浓度</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">{Math.round(minRegion.concentration)}</span>
            <span className="text-sm text-gray-400">μg/m³</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">地点: {minRegion.name}</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-600 mb-3">各城市浓度</h4>
        <div className="space-y-2">
          {currentData.regions.map((region) => (
            <div key={region.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{region.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getConcentrationColor(region.concentration) }} />
                <span className="text-sm font-medium text-gray-700">{Math.round(region.concentration)} μg/m³</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;
