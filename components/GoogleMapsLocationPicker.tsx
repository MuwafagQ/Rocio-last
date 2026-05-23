import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLoadScript, GoogleMap, MarkerF, StandaloneSearchBox } from '@react-google-maps/api';
import { MapPin, Navigation, Search, X, Check } from 'lucide-react';

// TODO: Investigate Saudi Post / SPL National Address API as a precision layer
// on top of Google Maps. Requires registration at developer.splonline.com.sa.
// If free tier covers our volume, add a second input for the 10-digit national
// address code that prefills lat/lng. Revisit when GA is close.

const WADI_ALDAWASEER = { lat: 20.4922, lng: 44.8086 };
const LIBRARIES: ('places')[] = ['places'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Receives JSON string: { address: string, lat: number, lng: number } */
  onConfirm: (loc: string) => void;
  initialLocation?: string | null;
}

export const GoogleMapsLocationPicker: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  initialLocation,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries: LIBRARIES,
    language: 'ar',
    region: 'SA',
  });

  const [center, setCenter] = useState(WADI_ALDAWASEER);
  const [markerPos, setMarkerPos] = useState(WADI_ALDAWASEER);
  const [address, setAddress] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Parse initial location once
  useEffect(() => {
    if (!isOpen) return;
    if (initialLocation) {
      try {
        const p = JSON.parse(initialLocation);
        if (p.lat && p.lng) {
          setMarkerPos({ lat: p.lat, lng: p.lng });
          setCenter({ lat: p.lat, lng: p.lng });
          if (p.address) setAddress(p.address);
          return;
        }
      } catch {}
    }
    // No saved location — ask for geolocation
    requestGeolocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const reverseGeocode = useCallback((pos: { lat: number; lng: number }) => {
    if (!isLoaded) return;
    if (!geocoderRef.current) geocoderRef.current = new google.maps.Geocoder();
    geocoderRef.current.geocode({ location: pos, language: 'ar' }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        setAddress(results[0].formatted_address);
      }
    });
  }, [isLoaded]);

  const requestGeolocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMarkerPos(p);
        setCenter(p);
        reverseGeocode(p);
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        // Permission denied — stay on Wadi Aldawaseer
      },
      { timeout: 8000 }
    );
  };

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarkerPos(pos);
    reverseGeocode(pos);
  }, [reverseGeocode]);

  const handleMarkerDrag = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarkerPos(pos);
    reverseGeocode(pos);
  }, [reverseGeocode]);

  const handlePlacesChanged = () => {
    const places = searchBoxRef.current?.getPlaces();
    if (!places?.length) return;
    const place = places[0];
    if (!place.geometry?.location) return;
    const pos = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    setMarkerPos(pos);
    setCenter(pos);
    setAddress(place.formatted_address || place.name || '');
  };

  const handleConfirm = () => {
    onConfirm(JSON.stringify({ address, lat: markerPos.lat, lng: markerPos.lng }));
  };

  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: 'greedy',
  }), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm z-10 shrink-0">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
          <X size={22} className="text-gray-600" />
        </button>
        <h2 className="font-bold text-gray-900 text-lg">حدد موقع التوصيل</h2>
      </div>

      {/* Search bar */}
      {isLoaded && (
        <div className="px-4 pt-3 pb-2 z-10 shrink-0">
          <StandaloneSearchBox
            onLoad={(ref) => { searchBoxRef.current = ref; }}
            onPlacesChanged={handlePlacesChanged}
            options={{ componentRestrictions: { country: 'sa' } }}
          >
            <div className="relative">
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن موقعك..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </StandaloneSearchBox>
        </div>
      )}

      {/* Map area */}
      <div className="flex-1 relative">
        {!apiKey && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-6 text-center z-10">
            <div>
              <MapPin size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-700 mb-1">مفتاح Google Maps غير مُعيَّن</p>
              <p className="text-xs text-gray-500 font-mono">VITE_GOOGLE_MAPS_API_KEY</p>
            </div>
          </div>
        )}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-6 text-center z-10">
            <p className="text-red-600 font-medium text-sm">تعذّر تحميل الخريطة — تحقق من مفتاح API</p>
          </div>
        )}
        {isLoaded && !loadError && apiKey && (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={14}
            onClick={handleMapClick}
            options={mapOptions}
          >
            <MarkerF
              position={markerPos}
              draggable
              onDragEnd={handleMarkerDrag}
            />
          </GoogleMap>
        )}
        {!isLoaded && apiKey && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Current location button */}
        <button
          onClick={requestGeolocation}
          disabled={geoLoading}
          className="absolute bottom-4 left-4 bg-white shadow-lg rounded-full p-3 active:scale-95 transition-transform disabled:opacity-60 z-10"
        >
          <Navigation size={20} className={`text-primary ${geoLoading ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {/* Address + confirm */}
      <div className="px-4 py-4 bg-white border-t border-gray-100 shrink-0">
        <div className="flex items-start gap-2 mb-4">
          <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 flex-1 leading-relaxed">
            {address || 'اسحب المؤشر أو انقر على الخريطة لتحديد موقعك'}
          </p>
        </div>
        <button
          onClick={handleConfirm}
          disabled={!address}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <Check size={20} />
          تأكيد الموقع
        </button>
      </div>
    </div>
  );
};
