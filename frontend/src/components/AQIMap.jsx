import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const DEFAULT_CENTER = [28.6139, 77.2090];

export default function AQIMap({
  center = DEFAULT_CENTER,
  aqiData,
  stubbleData,
  commuteData,
  selectedLayer = 'all',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);
  const initialCenterRef = useRef(center);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map instance
      const map = L.map(mapContainerRef.current, {
        center: initialCenterRef.current,
        zoom: 10,
        zoomControl: false,
      });

      // Watermark-free, zero API key Dark Canvas basemap (Esri World Dark Gray)
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri & OpenStreetMap contributors',
          maxZoom: 16,
        }
      ).addTo(map);

      // Road and city labels overlay
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 16,
        }
      ).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers and polylines whenever data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Draw Active Base AQI Pin & Pulse
    if (aqiData?.current) {
      const pm25 = aqiData.current.pm2_5;
      const color = aqiData.current.color || '#10B981';
      const category = aqiData.current.cpcb_category;

      const circle = L.circle(center, {
        color: color,
        fillColor: color,
        fillOpacity: 0.35,
        radius: 3500,
      }).bindPopup(`
        <div style="padding: 4px; font-family: sans-serif;">
          <h4 style="margin: 0; font-size: 14px; color: ${color};">${category} Air Quality</h4>
          <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: bold;">PM2.5: ${pm25} µg/m³</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #9CA3AF;">${aqiData.current.health_risk}</p>
        </div>
      `);
      group.addLayer(circle);
    }

    // 2. Draw Stubble Burning Clusters (Punjab / Haryana)
    if (stubbleData?.hotspot_clusters && (selectedLayer === 'all' || selectedLayer === 'stubble')) {
      stubbleData.hotspot_clusters.forEach((cluster) => {
        const fireMarker = L.circleMarker([cluster.latitude, cluster.longitude], {
          radius: Math.min(cluster.active_fires / 10, 16),
          color: '#F97316',
          fillColor: '#EA580C',
          fillOpacity: 0.75,
          weight: 2,
        }).bindPopup(`
          <div style="padding: 4px; font-family: sans-serif;">
            <h4 style="margin: 0; color: #F97316;">🔥 Stubble Fire Cluster</h4>
            <p style="margin: 2px 0; font-weight: bold;">${cluster.district}</p>
            <p style="margin: 0; font-size: 13px;">${cluster.active_fires} Active Farm Fires</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #9CA3AF;">Intensity: ${cluster.intensity}</p>
          </div>
        `);
        group.addLayer(fireMarker);
      });
    }

    // 3. Draw Cleanest Commute Polylines
    if (commuteData?.analysis?.routes && (selectedLayer === 'all' || selectedLayer === 'commute')) {
      const bounds = [];
      commuteData.analysis.routes.forEach((route) => {
        if (route.polyline && route.polyline.length >= 2) {
          const polyline = L.polyline(route.polyline, {
            color: route.color,
            weight: route.color === '#10B981' ? 6 : 4,
            opacity: 0.9,
            dashArray: route.color === '#EF4444' ? '6, 8' : null,
          }).bindPopup(`
            <div style="padding: 4px; font-family: sans-serif;">
              <h4 style="margin: 0; color: ${route.color};">${route.name}</h4>
              <p style="margin: 4px 0 0 0; font-size: 13px;">Inhaled: <b>${route.inhaled_pm25_micrograms} µg</b> (${route.cigarette_smoke_equivalent} cigs)</p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #9CA3AF;">Est: ${route.duration_minutes} min • ${route.distance_km} km</p>
            </div>
          `);
          group.addLayer(polyline);
          route.polyline.forEach((p) => bounds.push(p));
        }
      });

      if (bounds.length > 0 && selectedLayer === 'commute') {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [aqiData, stubbleData, commuteData, selectedLayer, center]);

  return <div ref={mapContainerRef} className="map-viewport" id="leaflet-aqi-map" />;
}
