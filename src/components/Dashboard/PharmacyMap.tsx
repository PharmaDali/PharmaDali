import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { usePharmacies } from '../../context/PharmacyContext'
import { getFastCoordinates } from '../../utils/geocoding'

const createCustomIcon = (status: string) => {
  const pinColor =
    status === 'Active'
      ? '#22c55e'
      : status === 'Pending'
      ? '#f59e0b'
      : '#ef4444'

  return L.divIcon({
    className: 'custom-map-pin-container',
    html: `
      <div style="filter: drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3)); width: 32px; height: 42px; cursor: pointer;">
        <svg width="32" height="42" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="${pinColor}"/>
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

const mapCenter: [number, number] = [14.0, 121.15]

const PharmacyMap: React.FC = () => {
  const { pharmacies } = usePharmacies()

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

        {pharmacies.map((pharmacy, idx) => {
          let lat = pharmacy.lat
          let lng = pharmacy.lng

          // If coordinates missing, resolve fast coordinates with index offset so pins don't overlap
          if (lat === undefined || lng === undefined) {
            const fallback = getFastCoordinates(pharmacy.location, idx)
            lat = fallback.lat
            lng = fallback.lng
          }

          const icon = createCustomIcon(pharmacy.status)

          return (
            <Marker key={pharmacy.id + '-' + idx} position={[lat, lng]} icon={icon}>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[140px]">
                  <strong className="block text-[#0f172a] text-sm font-bold">{pharmacy.name}</strong>
                  <div className="text-xs text-gray-600 mt-0.5">{pharmacy.location}</div>
                  {pharmacy.owner && <div className="text-[11px] text-gray-500">Owner: {pharmacy.owner}</div>}
                  <div className="mt-1.5 inline-block">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        pharmacy.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : pharmacy.status === 'Pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {pharmacy.status}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-[400] bg-[#292d37]/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 shadow-lg text-white text-xs space-y-1.5">
        <div className="font-semibold text-[11px] text-gray-300 uppercase tracking-wider mb-1">Status Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#22c55e] inline-block shadow-sm"></span>
          <span>Active</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#f59e0b] inline-block shadow-sm"></span>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ef4444] inline-block shadow-sm"></span>
          <span>Inactive</span>
        </div>
      </div>

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
