import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-map-pin-container',
    html: `
      <div style="filter: drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3)); width: 32px; height: 42px; cursor: pointer;">
        <svg width="32" height="42" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="#ef4444"/>
          <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="12" cy="11" r="4" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40],
  })
}

const customIcon = createCustomIcon()

const PHARMACIES = [
  { id: 1, name: 'PureMed Pharmacy', lat: 14.0833, lng: 121.1500, city: 'Tanauan City' },
  { id: 2, name: 'Landicho Drugstore', lat: 13.9416, lng: 121.1622, city: 'Lipa City' },
  { id: 3, name: 'Puremed Pharmacy 2', lat: 14.07, lng: 121.14, city: 'Tanauan City' },
]

const mapCenter: [number, number] = [14.0, 121.15]

const PharmacyMap: React.FC = () => {
  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden relative shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-[rgba(255,255,255,0.08)]">
      <MapContainer
        center={mapCenter}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: '#e5e7eb' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {PHARMACIES.map((pharmacy) => (
          <Marker key={pharmacy.id} position={[pharmacy.lat, pharmacy.lng]} icon={customIcon}>
            <Popup className="custom-popup">
              <div className="p-1">
                <strong className="block text-[#0f172a] text-sm font-bold">{pharmacy.name}</strong>
                <span className="text-xs text-[#ef4444] font-medium">{pharmacy.city}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style>{`
        .custom-map-pin-container {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          background-color: #ffffff;
          color: #0f172a;
          border-radius: 10px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 4px;
        }
        .leaflet-popup-tip {
          background-color: #ffffff;
        }
      `}</style>
    </div>
  )
}

export default PharmacyMap
