import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

L.Marker.prototype.options.icon = DefaultIcon

const PHARMACIES = [
  { id: 1, name: 'PureMed Pharmacy', lat: 14.0833, lng: 121.1500, city: 'Tanauan City' },
  { id: 2, name: 'Landicho Drugstore', lat: 13.9416, lng: 121.1622, city: 'Lipa City' },
  { id: 3, name: 'Puremed Pharmacy 2', lat: 14.07, lng: 121.14, city: 'Tanauan City' },
]

const mapCenter: [number, number] = [14.0, 121.15]

const PharmacyMap: React.FC = () => {
  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden relative shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <MapContainer
        center={mapCenter}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: '#2b2f37' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {PHARMACIES.map((pharmacy) => (
          <Marker key={pharmacy.id} position={[pharmacy.lat, pharmacy.lng]}>
            <Popup className="custom-popup">
              <div className="font-primary">
                <strong className="block text-[#48aad9] text-sm">{pharmacy.name}</strong>
                <span className="text-xs text-gray-600">{pharmacy.city}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style>{`
        .leaflet-popup-content-wrapper {
          background-color: #8ccfed;
          color: #22313b;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .leaflet-popup-tip {
          background-color: #8ccfed;
        }
        .leaflet-popup-content-wrapper .text-\\[\\#48aad9\\] {
          color: #22313b;
        }
        .leaflet-popup-content-wrapper .text-gray-600 {
          color: rgba(34, 49, 59, 0.7);
        }
      `}</style>
    </div>
  )
}

export default PharmacyMap
