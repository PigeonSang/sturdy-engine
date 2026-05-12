export interface Region {
  id: string;
  name: string;
  coordinates: [number, number][];
}

export interface RegionData {
  id: string;
  name: string;
  concentration: number;
}

export interface TimeSeriesData {
  time: string;
  regions: RegionData[];
}

const generateConcentration = (base: number, variation: number): number => {
  return Math.round((base + (Math.random() - 0.5) * variation) * 10) / 10;
};

export const regions: Region[] = [
  { id: "beijing", name: "北京市", coordinates: [[116.0, 39.8], [116.8, 39.8], [116.8, 40.3], [116.0, 40.3]] },
  { id: "shanghai", name: "上海市", coordinates: [[121.2, 30.8], [121.8, 30.8], [121.8, 31.3], [121.2, 31.3]] },
  { id: "guangzhou", name: "广州市", coordinates: [[113.1, 23.0], [113.6, 23.0], [113.6, 23.3], [113.1, 23.3]] },
  { id: "chengdu", name: "成都市", coordinates: [[103.5, 30.5], [104.1, 30.5], [104.1, 31.0], [103.5, 31.0]] },
  { id: "wuhan", name: "武汉市", coordinates: [[114.1, 30.4], [114.6, 30.4], [114.6, 30.7], [114.1, 30.7]] },
  { id: "xian", name: "西安市", coordinates: [[108.8, 34.1], [109.3, 34.1], [109.3, 34.4], [108.8, 34.4]] },
];

export const generateTimeSeriesData = (): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const baseDate = new Date("2024-01-01T00:00:00");
  
  for (let i = 0; i < 24; i++) {
    const currentTime = new Date(baseDate.getTime() + i * 60 * 60 * 1000);
    const timeStr = currentTime.toISOString();
    
    const regionData: RegionData[] = regions.map((region) => {
      const baseConcentration = region.id === "beijing" ? 80 : region.id === "shanghai" ? 65 :
                                region.id === "guangzhou" ? 55 : region.id === "chengdu" ? 70 :
                                region.id === "wuhan" ? 60 : 75;
      const variation = i >= 8 && i <= 18 ? 30 : 15;
      
      return { id: region.id, name: region.name, concentration: generateConcentration(baseConcentration, variation) };
    });
    
    data.push({ time: timeStr, regions: regionData });
  }
  
  return data;
};

export const timeSeriesData: TimeSeriesData[] = generateTimeSeriesData();

export const getConcentrationColor = (concentration: number): string => {
  if (concentration <= 35) return "#00e400";
  if (concentration <= 75) return "#ffff00";
  if (concentration <= 115) return "#ff7e00";
  if (concentration <= 150) return "#ff0000";
  if (concentration <= 250) return "#9932cc";
  return "#7e0023";
};

export interface ConcentrationLevel {
  min: number;
  max: number;
  color: string;
  label: string;
}

export const concentrationLevels: ConcentrationLevel[] = [
  { min: 0, max: 35, color: "#00e400", label: "优 (0-35)" },
  { min: 35, max: 75, color: "#ffff00", label: "良 (35-75)" },
  { min: 75, max: 115, color: "#ff7e00", label: "轻度污染 (75-115)" },
  { min: 115, max: 150, color: "#ff0000", label: "中度污染 (115-150)" },
  { min: 150, max: 250, color: "#9932cc", label: "重度污染 (150-250)" },
  { min: 250, max: 500, color: "#7e0023", label: "严重污染 (>250)" },
];
