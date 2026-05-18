import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, MapPin, Navigation as NavigationIcon, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: string) => void;
  initialLocation?: string;
}

const LocationMarker = ({ position, setPosition, onPositionChanged }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void, onPositionChanged: (pos: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onPositionChanged(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} draggable={true} eventHandlers={{
        dragend: (e) => {
            const marker = e.target;
            const pos = marker.getLatLng();
            setPosition(pos);
            onPositionChanged(pos);
        }
    }}></Marker>
  );
};

export const LocationPicker: React.FC<LocationPickerProps> = ({ isOpen, onClose, onConfirm, initialLocation }) => {
  const [address, setAddress] = useState(initialLocation || 'الرياض، حي العليا');
  const [isSearching, setIsSearching] = useState(false);
  const [position, setPosition] = useState<L.LatLng | null>(L.latLng(24.7136, 46.6753)); // Default Riyadh

  const handlePositionChanged = async (pos: L.LatLng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}&accept-language=ar`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          const shortName = parts.slice(0, 3).join(',');
          setAddress(shortName);
        }
      }
    } catch (e) {
      console.warn("Reverse geocode failed", e);
    }
  };

  // Reset address when opening
  useEffect(() => {
    if (isOpen) {
        if (initialLocation) {
            setAddress(initialLocation);
        }
        // Auto-request location permissions
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const newPos = L.latLng(pos.coords.latitude, pos.coords.longitude);
                setPosition(newPos);
                handlePositionChanged(newPos);
              },
              (err) => console.error("Geolocation error:", err)
            );
        }
    }
  }, [isOpen, initialLocation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-200">
      {/* Search Bar Layer */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 pt-safe">
        <div className="bg-white rounded-lg shadow-md flex items-center p-3 gap-3">
          <button onClick={onClose} className="p-1 rounded-full active:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-600"/>
          </button>
          <div className="flex-1 relative">
            <input 
                type="text" 
                placeholder="ابحث عن منطقة، شارع..." 
                className="w-full outline-none text-sm text-right pr-2 font-sans" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={() => setIsSearching(true)}
                onBlur={() => setTimeout(() => setIsSearching(false), 200)}
            />
          </div>
          {address && (
            <button onClick={() => setAddress('')}>
                <X size={18} className="text-gray-400" />
            </button>
          )}
          <Search size={20} className="text-primary" />
        </div>
        
        {/* Search Suggestions */}
        {isSearching && (
            <div className="bg-white mt-2 rounded-lg shadow-xl border border-gray-100 overflow-hidden">
                {['الرياض، حي الملقا', 'الرياض، حي النرجس', 'جدة، شارع التحلية'].map((s, i) => (
                    <button 
                        key={i} 
                        className="w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b last:border-0 flex items-center gap-2 justify-end"
                        onClick={() => {
                            setAddress(s);
                            setIsSearching(false);
                        }}
                    >
                        <span>{s}</span>
                        <MapPin size={14} className="text-gray-300" />
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* Map Area */}
      <div className="flex-1 bg-gray-100 relative overflow-hidden group z-10">
         <MapContainer center={[24.7136, 46.6753]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} onPositionChanged={handlePositionChanged} />
         </MapContainer>

         {/* Controls */}
         <div className="absolute bottom-48 right-4 flex flex-col gap-3 z-[400]">
             <button 
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setPosition(L.latLng(pos.coords.latitude, pos.coords.longitude));
                      },
                      (err) => console.error(err)
                    );
                  }
                }}
                className="bg-white p-3 rounded-full shadow-lg text-gray-600 active:bg-gray-50"
             >
                <NavigationIcon size={24} className="fill-blue-500 text-blue-500" />
             </button>
         </div>
      </div>

      {/* Bottom Sheet */}
      <div className="bg-white p-6 rounded-t-[2rem] shadow-[0_-5px_40px_rgba(0,0,0,0.1)] -mt-6 z-20 relative">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        <div className="flex items-start gap-3 mb-6">
            <div className="mt-1">
                <MapPin className="text-red-500" size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">موقع التوصيل</h3>
                <p className="text-gray-500 text-sm mt-1">{address || 'حدد الموقع على الخريطة'}</p>
                {position && (
                  <p className="text-xs text-gray-400 mt-1">
                    {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                  </p>
                )}
            </div>
        </div>
        
        <button 
            onClick={() => {
                const payload = JSON.stringify({ address, lat: position?.lat, lng: position?.lng });
                onConfirm(payload);
            }}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
            تأكيد الموقع
        </button>
      </div>
    </div>
  );
}