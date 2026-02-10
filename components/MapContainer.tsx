import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Airport } from '../types';
import { interpolatePath, getBearing } from '../utils/geoUtils';

interface MapContainerProps {
  from: Airport | null;
  to: Airport | null;
  isFlying: boolean;
  airports: Airport[];
  onAirportClick: (ap: Airport) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({ from, to, isFlying }) => {
  const mapRef = useRef<L.Map | null>(null);
  const pathRef = useRef<L.Polyline | null>(null);
  const planeRef = useRef<L.Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map', { 
        zoomControl: false, 
        attributionControl: false,
        worldCopyJump: true,
        inertia: true,
        minZoom: 2,
        keyboard: true
      }).setView([20, 0], 3);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!from || !to) {
      if (pathRef.current) mapRef.current.removeLayer(pathRef.current);
      if (planeRef.current) mapRef.current.removeLayer(planeRef.current);
      pathRef.current = null;
      planeRef.current = null;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    if (pathRef.current) mapRef.current.removeLayer(pathRef.current);
    if (planeRef.current) mapRef.current.removeLayer(planeRef.current);

    // Create the curved path
    const points = interpolatePath([from.lat, from.lon], [to.lat, to.lon], 2000);
    
    pathRef.current = L.polyline(points as any, { 
      color: '#fbbf24', 
      weight: 3, 
      dashArray: '10, 15',
      opacity: 0.6,
      smoothFactor: 1.5
    }).addTo(mapRef.current);
    
    mapRef.current.flyToBounds(pathRef.current.getBounds(), { padding: [150, 150], duration: 1.5 });

    if (isFlying) {
      let startTime = performance.now();
      const duration = 180000; // 3 min total visual duration

      const planeIcon = L.divIcon({
        html: `<div class="plane-wrapper">
                <div class="plane-rotation-layer" id="plane-rotator" style="width:64px; height:64px;">
                  <i class="fa-solid fa-plane text-yellow-400 text-3xl drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]" style="transform: rotate(-45deg);"></i>
                </div>
              </div>`,
        className: '',
        iconSize: [64, 64],
        iconAnchor: [32, 32] 
      });

      planeRef.current = L.marker(points[0] as any, { icon: planeIcon, zIndexOffset: 2000 }).addTo(mapRef.current);

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const index = Math.floor(progress * (points.length - 1));
        const currentPos = points[index];
        const nextIndex = Math.min(index + 5, points.length - 1); 
        const nextPos = points[nextIndex];
        
        // Calculate bearing for incline/alignment
        const bearing = getBearing(currentPos[0], currentPos[1], nextPos[0], nextPos[1]);
        
        if (planeRef.current) {
          planeRef.current.setLatLng(currentPos as any);
          const rotator = planeRef.current.getElement()?.querySelector('#plane-rotator') as HTMLElement;
          if (rotator) {
            rotator.style.transform = `rotate(${bearing}deg)`;
          }
        }

        if (mapRef.current && index % 20 === 0) {
          mapRef.current.panTo(currentPos as any, { animate: true, duration: 0.3 });
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [from, to, isFlying]);

  return <div id="map" />;
};

export default MapContainer;