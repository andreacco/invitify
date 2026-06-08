'use client';

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, Autocomplete } from '@react-google-maps/api';

// IMPORTANT: Define libraries outside the component to prevent infinite re-renders
const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.75rem',
};

const defaultCenter = {
  lat: 10.4806,
  lng: -66.9036, // Default: Caracas
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#18181b' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a1a1aa' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#18181b' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#3f3f46' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#27272a' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#3f3f46' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#09090b' }] },
];

interface MapPickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export default function MapPicker({ label, value, onChange }: MapPickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(defaultCenter);
  
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  // Handle place selection from the search bar
  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarker({ lat, lng });
        setMapCenter({ lat, lng }); // Move map to the searched location
      }
    }
  };

  // Handle manual clicks on the map
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, []);

  // Save the marker as a standard Google Maps URL
  const handleConfirmLocation = () => {
    if (marker) {
      onChange(`https://www.google.com/maps/search/?api=1&query=${marker.lat},${marker.lng}`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
        {label}
      </label>

      {/* Primary Input with Map Button */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Pega el link aquí o busca en el mapa..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-purple-500 text-zinc-300 hover:text-purple-400 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
        >
          <span>📍</span> Mapa
        </button>
      </div>

      {/* Map Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" 
            onClick={() => setIsModalOpen(false)} 
          />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100">Buscar Ubicación</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ✕
              </button>
            </div>

            {loadError && <div className="text-rose-400 text-xs">Error al cargar Google Maps.</div>}
            
            {!isLoaded ? (
              <div className="h-[300px] bg-zinc-950 rounded-xl animate-pulse flex items-center justify-center text-zinc-500 text-xs">
                Cargando cartografía...
              </div>
            ) : (
              <>
                {/* Search Bar (Google Places Autocomplete) */}
                <div className="relative z-10">
                  <Autocomplete
                    onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <input
                      type="text"
                      placeholder="Ej: Hacienda La Vega, Iglesia San José..."
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none shadow-lg"
                    />
                  </Autocomplete>
                </div>

                {/* Google Map */}
                <div className="border border-zinc-800 rounded-xl overflow-hidden shadow-inner">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={14}
                    center={mapCenter}
                    onClick={handleMapClick}
                    options={{
                      disableDefaultUI: true,
                      zoomControl: true,
                      styles: darkMapStyle,
                    }}
                  >
                    {marker && <Marker position={marker} />}
                  </GoogleMap>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-2 border-t border-zinc-800/60">
                  <p className="text-[10px] text-zinc-500">
                    {marker ? '📍 Ubicación seleccionada' : 'Haz clic en el mapa o busca un lugar'}
                  </p>
                  <button
                    type="button"
                    onClick={handleConfirmLocation}
                    disabled={!marker}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50"
                  >
                    Confirmar Ubicación
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}