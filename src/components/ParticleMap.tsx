import { useEffect, useRef, useState, useCallback } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import Graphic from '@arcgis/core/Graphic';
import Circle from '@arcgis/core/geometry/Circle';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import { regions, timeSeriesData, getConcentrationColor, concentrationLevels, Region, RegionData } from '../utils/mockData';

interface ParticleMapProps {
  currentTimeIndex: number;
}

const ParticleMap = ({ currentTimeIndex }: ParticleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRegionCenter = (coordinates: [number, number][]): [number, number] => {
    const x = coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length;
    const y = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;
    return [x, y];
  };

  const getCircleRadius = (concentration: number): number => {
    const minRadius = 20000;
    const maxRadius = 120000;
    const normalized = Math.min(concentration / 300, 1);
    return minRadius + normalized * (maxRadius - minRadius);
  };

  const getOpacity = (concentration: number): number => {
    const minOpacity = 0.3;
    const maxOpacity = 0.85;
    const normalized = Math.min(concentration / 300, 1);
    return minOpacity + normalized * (maxOpacity - minOpacity);
  };

  const updateConcentrationLayer = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentData = timeSeriesData[currentTimeIndex];
    if (!currentData) return;

    const graphics: Graphic[] = [];

    regions.forEach((region: Region) => {
      const regionData: RegionData | undefined = currentData.regions.find((r: RegionData) => r.id === region.id);
      if (!regionData) return;

      const center = getRegionCenter(region.coordinates);
      const radius = getCircleRadius(regionData.concentration);
      const opacity = getOpacity(regionData.concentration);
      const hexColor = getConcentrationColor(regionData.concentration);
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);

      const circle = new Circle({
        center: center,
        radius: radius,
        spatialReference: { wkid: 4326 },
      });

      const fillSymbol = new SimpleFillSymbol({
        color: [r, g, b, opacity],
        outline: new SimpleLineSymbol({
          color: [r, g, b, Math.min(opacity + 0.3, 1)],
          width: 1,
        }),
      });

      const graphic = new Graphic({
        geometry: circle,
        symbol: fillSymbol,
        attributes: {
          name: region.name,
          concentration: regionData.concentration,
          id: region.id,
        },
      });

      graphics.push(graphic);
    });

    const currentMap = view.map;
    if (!currentMap) return;

    currentMap.allLayers.forEach((layer) => {
      if (layer.type === 'feature' && (layer as FeatureLayer).title === 'ParticleConcentration') {
        currentMap.remove(layer);
      }
    });

    const featureLayer = new FeatureLayer({
      source: graphics,
      title: 'ParticleConcentration',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'concentration', type: 'double' },
      ],
      objectIdField: 'id',
      popupTemplate: {
        title: '{name}',
        content: [{ type: 'text', text: `PM2.5浓度: <b>{concentration}</b> μg/m³` }],
      },
    });

    currentMap.add(featureLayer);
  }, [currentTimeIndex]);

  useEffect(() => {
    if (!mapRef.current) return;

    const loadMap = async () => {
      try {
        const osmLayer = new WebTileLayer({
          urlTemplate: 'https://{s}.tile.openstreetmap.org/{level}/{col}/{row}.png',
          subDomains: ['a', 'b', 'c'],
          title: 'OpenStreetMap',
        });

        const map = new Map({
          layers: [osmLayer],
        });

        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [116.4, 39.9],
          zoom: 5,
          constraints: { minZoom: 3, maxZoom: 18 },
        });

        viewRef.current = view;

        view.on('error', (err) => {
          console.error('Map view error:', err);
          setError('地图加载失败，请刷新页面重试');
        });

        await view.when();
        setIsLoading(false);
        updateConcentrationLayer();
      } catch (err) {
        console.error('Failed to load map:', err);
        setError('地图初始化失败');
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setError('地图加载超时，请检查网络连接');
      }
    }, 15000);

    loadMap();

    return () => {
      clearTimeout(timeoutId);
      if (viewRef.current) {
        viewRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !error) {
      updateConcentrationLayer();
    }
  }, [currentTimeIndex, isLoading, error, updateConcentrationLayer]);

  if (error) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">{error}</div>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-xl text-gray-600">加载地图中...</div>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">PM2.5浓度图例</h3>
        <div className="space-y-1">
          {concentrationLevels.map((level) => (
            <div key={level.label} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: level.color, opacity: 0.7 }} />
              <span className="text-xs text-gray-600">{level.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
          <p>● 圆越大表示浓度越高</p>
          <p>● 颜色越深表示浓度越高</p>
        </div>
      </div>
    </div>
  );
};

export default ParticleMap;
