import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function FitRoute({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 1) {
      const bounds = L.latLngBounds(coordinates.map(point => [point.lat, point.lng]));
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 17 });
    }
  }, [coordinates, map]);

  return null;
}

export function getSegmentColor(brush, pump) {
  if (brush > 0 && pump > 0) return '#7c3aed';
  if (brush > 0) return '#ef4444';
  if (pump > 0) return '#2563eb';
  return '#334155';
}

function MapView({ coordinates }) {
  const segments = coordinates.slice(0, -1).map((point, index) => ({
    positions: [
      [point.lat, point.lng],
      [coordinates[index + 1].lat, coordinates[index + 1].lng],
    ],
    color: getSegmentColor(point.brush, point.pump),
  }));

  return (
    <MapContainer center={[55.6825, 37.505]} zoom={14} className="route-map">
      <FitRoute coordinates={coordinates} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {segments.map((segment, index) => (
        <Polyline
          key={`${index}-${segment.color}`}
          positions={segment.positions}
          color={segment.color}
          weight={5}
          opacity={0.9}
        />
      ))}
    </MapContainer>
  );
}

export default MapView;
