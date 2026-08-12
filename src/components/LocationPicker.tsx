"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

const tileUrl = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
  : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const pinIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:16px;height:16px;border-radius:50% 50% 50% 0;background:#C9591F;border:2px solid white;transform:rotate(-45deg)"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 16],
});

function Recenter({ center, active }: { center: [number, number]; active: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (active) map.setView(center, map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], active]);
  return null;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({
  value,
  onChange,
  center,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
  center: [number, number];
}) {
  return (
    <MapContainer
      center={center}
      zoom={12}
      className="isolate"
      style={{ height: "260px", width: "100%", borderRadius: "8px" }}
    >
      <TileLayer url={tileUrl} attribution="" />
      <Recenter center={center} active={!value} />
      <ClickHandler onPick={onChange} />
      {value && <Marker position={[value.lat, value.lng]} icon={pinIcon} />}
    </MapContainer>
  );
}
