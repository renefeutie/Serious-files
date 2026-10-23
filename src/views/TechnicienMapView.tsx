import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import { ARTISANS, Artisan } from '../data/mockData';

export const isValidGoogleMapsKey = (key?: string | null): boolean => {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  // Valid Google Cloud API keys start with AIza and are ~39 characters long
  return /^AIza[0-9A-Za-z-_]{30,45}$/.test(trimmed);
};

// Guard component inside APIProvider that switches to fallback if API fails auth or loading
const MapLoadingGuard: React.FC<{ onError: () => void }> = ({ onError }) => {
  const status = useApiLoadingStatus();
  useEffect(() => {
    if (status === APILoadingStatus.AUTH_FAILURE || status === APILoadingStatus.FAILED) {
      onError();
    }
  }, [status, onError]);
  return null;
};

interface TechnicianTracking {
  id: string;
  artisan: Artisan;
  status: 'en_route' | 'arrive' | 'en_intervention';
  statusLabel: string;
  vehicle: 'Moto Express' | 'Véhicule Atelier';
  clientAddress: string;
  clientDistrict: string;
  lat: number;
  lng: number;
  destLat: number;
  destLng: number;
  initialEtaMinutes: number;
  currentEtaMinutes: number;
  speedKmH: number;
}

const TECHNICIANS: TechnicianTracking[] = [
  {
    id: 'tech-1',
    artisan: ARTISANS[0], // Talla Éric
    status: 'en_route',
    statusLabel: 'En route vers votre domicile',
    vehicle: 'Moto Express',
    clientAddress: 'Rue Pau, face Hôtel Akwa Palace',
    clientDistrict: 'Akwa, Douala',
    lat: 4.0435,
    lng: 9.7022,
    destLat: 4.0511,
    destLng: 9.7679,
    initialEtaMinutes: 18,
    currentEtaMinutes: 14,
    speedKmH: 32,
  },
  {
    id: 'tech-2',
    artisan: ARTISANS[1], // Kamdem & Fils
    status: 'en_intervention',
    statusLabel: 'En intervention de plomberie',
    vehicle: 'Véhicule Atelier',
    clientAddress: 'Carrefour Armée de l’Air',
    clientDistrict: 'Bonamoussadi, Douala',
    lat: 4.0754,
    lng: 9.7341,
    destLat: 4.0812,
    destLng: 9.7425,
    initialEtaMinutes: 5,
    currentEtaMinutes: 0,
    speedKmH: 0,
  },
  {
    id: 'tech-3',
    artisan: ARTISANS[2], // Mbarga Frigo
    status: 'en_route',
    statusLabel: 'En transit avec matériel frigorifique',
    vehicle: 'Véhicule Atelier',
    clientAddress: 'Rond-Point Deido',
    clientDistrict: 'Deido, Douala',
    lat: 4.0621,
    lng: 9.7153,
    destLat: 4.0689,
    destLng: 9.7214,
    initialEtaMinutes: 22,
    currentEtaMinutes: 19,
    speedKmH: 26,
  },
];

interface TechnicienMapViewProps {
  initialArtisanId?: string;
  onNavigate: (tab: string, artisanId?: string) => void;
  onShowToast: (msg: string) => void;
}

export const TechnicienMapView: React.FC<TechnicienMapViewProps> = ({
  initialArtisanId,
  onNavigate,
  onShowToast,
}) => {
  const [activeTechId, setActiveTechId] = useState<string>(() => {
    if (initialArtisanId) {
      const match = TECHNICIANS.find((t) => t.artisan.id === initialArtisanId);
      if (match) return match.id;
    }
    return 'tech-1';
  });
  const [techList, setTechList] = useState<TechnicianTracking[]>(TECHNICIANS);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(() => {
    if (initialArtisanId) {
      const match = TECHNICIANS.find((t) => t.artisan.id === initialArtisanId);
      if (match) return match.id;
    }
    return 'tech-1';
  });
  const [hasMapError, setHasMapError] = useState<boolean>(false);

  // Listen to global auth failures (e.g. InvalidKeyMapError, gm_authFailure)
  useEffect(() => {
    const handleAuthFail = () => setHasMapError(true);
    window.addEventListener('gmp-auth-failure', handleAuthFail);
    return () => window.removeEventListener('gmp-auth-failure', handleAuthFail);
  }, []);

  const activeTech = techList.find((t) => t.id === activeTechId) || techList[0];
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const isKeyValid = isValidGoogleMapsKey(apiKey);

  // Simulation timer that gently moves the active technician toward destination
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setTechList((prev) =>
        prev.map((t) => {
          if (t.id !== activeTechId || t.status !== 'en_route') return t;

          // Step slightly closer to destLat, destLng
          const stepFactor = 0.04;
          const nextLat = t.lat + (t.destLat - t.lat) * stepFactor;
          const nextLng = t.lng + (t.destLng - t.lng) * stepFactor;

          const distanceRemaining = Math.sqrt(
            Math.pow(t.destLat - nextLat, 2) + Math.pow(t.destLng - nextLng, 2)
          );

          if (distanceRemaining < 0.002) {
            return {
              ...t,
              lat: t.destLat,
              lng: t.destLng,
              status: 'arrive',
              statusLabel: 'Arrivé sur place ! Le technicien sonne.',
              currentEtaMinutes: 0,
              speedKmH: 0,
            };
          }

          const nextEta = Math.max(1, Math.round(t.currentEtaMinutes - 0.25));
          return {
            ...t,
            lat: nextLat,
            lng: nextLng,
            currentEtaMinutes: nextEta,
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating, activeTechId]);

  return (
    <div className="flex flex-col w-full h-[calc(100vh-4rem-4rem)] max-w-6xl mx-auto relative overflow-hidden bg-[#ecf6ed]">
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 inset-x-3 z-20 flex flex-col gap-2 max-w-md mx-auto pointer-events-auto">
        {/* Header Pill */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-md border border-[#e1ebe1] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#bfecdc] text-[#006946] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">pin_drop</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-[#151e18]">Suivi GPS Technicien</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#bfecdc] text-[#006946] text-[10px] font-bold">
                  {isKeyValid && !hasMapError ? 'Google Maps' : 'GPS Urbain Douala'}
                </span>
              </div>
              <p className="text-[11px] text-[#3e4942]">
                {isKeyValid && !hasMapError
                  ? 'Géolocalisation en temps réel avec Google Maps'
                  : 'Géolocalisation et simulation de trajet à Douala'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setIsSimulating(!isSimulating);
                onShowToast(
                  isSimulating
                    ? 'Simulation GPS mise en pause'
                    : 'Simulation GPS en direct activée'
                );
              }}
              className={`h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                isSimulating
                  ? 'bg-[#006946] text-white shadow-xs'
                  : 'bg-[#ecf6ed] text-[#3e4942] hover:bg-[#e1ebe1]'
              }`}
              title="Activer/Pause la simulation de trajet"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isSimulating ? 'pause' : 'play_arrow'}
              </span>
              <span>{isSimulating ? 'Direct' : 'Pause'}</span>
            </button>
          </div>
        </div>

        {/* Technician Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-white/90 backdrop-blur-md rounded-xl border border-[#e1ebe1] shadow-xs no-scrollbar">
          {techList.map((tech) => {
            const isSelected = tech.id === activeTechId;
            return (
              <button
                key={tech.id}
                type="button"
                onClick={() => {
                  setActiveTechId(tech.id);
                  setSelectedMarkerId(tech.id);
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#006946] text-white shadow-xs'
                    : 'text-[#3e4942] hover:bg-[#ecf6ed]'
                }`}
              >
                <img
                  src={tech.artisan.avatar}
                  alt={tech.artisan.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-white"
                />
                <span>{tech.artisan.name}</span>
                <span
                  className={`text-[10px] px-1 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#ecf6ed] text-[#006946]'
                  }`}
                >
                  {tech.status === 'arrive' ? 'Arrivé' : `${tech.currentEtaMinutes}m`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="w-full h-full relative">
        {isKeyValid && !hasMapError ? (
          <APIProvider
            apiKey={apiKey}
            language="fr"
            region="CM"
          >
            <MapLoadingGuard onError={() => setHasMapError(true)} />
            <Map
              mapId="DEMO_MAP_ID"
              center={{ lat: activeTech.lat, lng: activeTech.lng }}
              zoom={14}
              gestureHandling="greedy"
              disableDefaultUI={false}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              {/* Technician Marker */}
              {techList.map((tech) => (
                <AdvancedMarker
                  key={tech.id}
                  position={{ lat: tech.lat, lng: tech.lng }}
                  onClick={() => setSelectedMarkerId(tech.id)}
                  title={`${tech.artisan.name} (${tech.vehicle})`}
                >
                  <div className="relative flex flex-col items-center cursor-pointer group">
                    {/* Pulsing halo */}
                    <div className="absolute -inset-2 rounded-full bg-[#006946]/30 animate-ping pointer-events-none" />

                    <div className="relative w-12 h-12 rounded-2xl bg-white p-1 shadow-lg border-2 border-[#006946] flex items-center justify-center">
                      <img
                        src={tech.artisan.avatar}
                        alt={tech.artisan.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#006946] text-white flex items-center justify-center text-[10px] shadow-xs">
                        <span className="material-symbols-outlined text-[12px]">two_wheeler</span>
                      </span>
                    </div>

                    <div className="bg-[#151e18] text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 shadow-md whitespace-nowrap">
                      {tech.artisan.name} • {tech.currentEtaMinutes > 0 ? `${tech.currentEtaMinutes} min` : 'Arrivé'}
                    </div>
                  </div>
                </AdvancedMarker>
              ))}

              {/* Destination Client Marker */}
              <AdvancedMarker position={{ lat: activeTech.destLat, lng: activeTech.destLng }}>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                    <span className="material-symbols-outlined text-[20px]">home</span>
                  </div>
                  <div className="bg-white text-[#ba1a1a] border border-[#ba1a1a]/30 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 shadow-sm whitespace-nowrap">
                    Votre Domicile
                  </div>
                </div>
              </AdvancedMarker>

              {/* InfoWindow on Selected Technician */}
              {selectedMarkerId && (
                <InfoWindow
                  position={{
                    lat: activeTech.lat,
                    lng: activeTech.lng,
                  }}
                  onCloseClick={() => setSelectedMarkerId(null)}
                >
                  <div className="p-1 min-w-[180px] text-xs">
                    <strong className="block text-sm text-[#151e18] font-bold">
                      {activeTech.artisan.name}
                    </strong>
                    <span className="text-[#006946] font-semibold block">{activeTech.artisan.job}</span>
                    <div className="mt-1 pt-1 border-t border-[#e1ebe1] text-[#3e4942]">
                      <p>Statut : {activeTech.statusLabel}</p>
                      <p>Véhicule : {activeTech.vehicle}</p>
                      <p className="font-bold text-[#006946] mt-0.5">
                        ETA : {activeTech.currentEtaMinutes} minutes ({activeTech.speedKmH} km/h)
                      </p>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* High-Fidelity Interactive Map Fallback (Douala Urban Grid) */
          <div className="w-full h-full relative bg-[#e6f1e7] flex items-center justify-center overflow-hidden">
            {/* Styled Douala City Map Background Simulation */}
            <svg
              className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
            >
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#bdcac0" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Simulated River Wouri */}
              <path
                d="M -50,150 Q 250,220 500,160 T 1100,280"
                fill="none"
                stroke="#a4d0c0"
                strokeWidth="70"
                opacity="0.6"
              />
              {/* Simulated Boulevards Douala */}
              <path
                d="M 50,0 L 500,800 M 0,350 L 900,300 M 200,600 L 700,50"
                fill="none"
                stroke="#ffffff"
                strokeWidth="10"
              />
              <path
                d="M 100,200 L 600,550 M 350,100 L 350,700"
                fill="none"
                stroke="#ffddb4"
                strokeWidth="6"
              />
            </svg>

            {/* Simulated Live Route Trajectory line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line
                x1="38%"
                y1="52%"
                x2="64%"
                y2="38%"
                stroke="#006946"
                strokeWidth="5"
                strokeDasharray="6,6"
                className="animate-pulse"
              />
            </svg>

            {/* Destination Marker */}
            <div className="absolute left-[64%] top-[38%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
              <div className="w-11 h-11 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shadow-xl border-3 border-white animate-bounce">
                <span className="material-symbols-outlined text-[22px]">home</span>
              </div>
              <div className="bg-white text-[#ba1a1a] font-bold text-xs px-2.5 py-0.5 rounded-full mt-1 shadow-md border border-[#ffdad6]">
                Votre Domicile (Akwa)
              </div>
            </div>

            {/* Active Moving Technician Marker */}
            <div
              className="absolute left-[38%] top-[52%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer transition-all duration-1000"
              onClick={() => onShowToast(`${activeTech.artisan.name} est en route !`)}
            >
              <div className="absolute -inset-4 rounded-full bg-[#006946]/30 animate-ping" />
              <div className="relative w-14 h-14 rounded-2xl bg-white p-1 shadow-2xl border-2 border-[#006946] flex items-center justify-center">
                <img
                  src={activeTech.artisan.avatar}
                  alt={activeTech.artisan.name}
                  className="w-full h-full object-cover rounded-xl"
                />
                <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#006946] text-white flex items-center justify-center text-xs shadow-md">
                  <span className="material-symbols-outlined text-[14px]">two_wheeler</span>
                </span>
              </div>
              <div className="bg-[#151e18] text-white font-extrabold text-xs px-3 py-1 rounded-full mt-1.5 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-[#78d9aa] animate-pulse" />
                <span>{activeTech.artisan.name}</span>
                <span className="text-[#bfecdc]">
                  • {activeTech.currentEtaMinutes > 0 ? `${activeTech.currentEtaMinutes} min` : 'Arrivé'}
                </span>
              </div>
            </div>

            {/* Other Technicians in Douala */}
            <div
              className="absolute left-[25%] top-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 cursor-pointer opacity-85 hover:opacity-100"
              onClick={() => setActiveTechId('tech-2')}
            >
              <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-md border border-[#006946] flex items-center justify-center">
                <img
                  src={ARTISANS[1].avatar}
                  alt="Kamdem"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <span className="bg-white text-[#151e18] font-bold text-[10px] px-2 py-0.5 rounded-full mt-0.5 shadow-xs">
                Kamdem Plomberie
              </span>
            </div>

            <div
              className="absolute left-[72%] top-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 cursor-pointer opacity-85 hover:opacity-100"
              onClick={() => setActiveTechId('tech-3')}
            >
              <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-md border border-[#006946] flex items-center justify-center">
                <img
                  src={ARTISANS[2].avatar}
                  alt="Mbarga"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <span className="bg-white text-[#151e18] font-bold text-[10px] px-2 py-0.5 rounded-full mt-0.5 shadow-xs">
                Mbarga Frigo Pro
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Technician Live Status Sheet */}
      <div className="absolute bottom-3 inset-x-3 z-30 max-w-md mx-auto pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 shadow-xl border border-[#e1ebe1] flex flex-col gap-3">
          {/* Top row: Avatar + Names + Live ETA */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={activeTech.artisan.avatar}
                  alt={activeTech.artisan.name}
                  className="w-13 h-13 rounded-2xl object-cover ring-2 ring-[#006946]/30"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#006946] text-white flex items-center justify-center text-[10px]">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-[#151e18] truncate">
                    {activeTech.artisan.name}
                  </h3>
                  <span className="text-xs text-[#ffb955] font-bold flex items-center">
                    ★ {activeTech.artisan.rating}
                  </span>
                </div>
                <p className="text-xs text-[#3d665a] truncate font-medium">
                  {activeTech.artisan.job}
                </p>
                <span className="text-[11px] text-[#6e7a72] flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[13px] text-[#006946]">speed</span>
                  <span>{activeTech.vehicle} ({activeTech.speedKmH} km/h)</span>
                </span>
              </div>
            </div>

            {/* Live ETA Box */}
            <div className="text-right shrink-0 bg-[#ecf6ed] p-2.5 rounded-2xl border border-[#bfecdc]">
              <span className="text-[10px] font-bold text-[#6e7a72] uppercase block">
                Arrivée estimée
              </span>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-xl font-extrabold text-[#006946]">
                  {activeTech.currentEtaMinutes > 0 ? activeTech.currentEtaMinutes : '0'}
                </span>
                <span className="text-xs font-bold text-[#006946]">min</span>
              </div>
            </div>
          </div>

          {/* Progress Route Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#006946] font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#006946] animate-pulse" />
                {activeTech.statusLabel}
              </span>
              <span className="text-[#6e7a72]">{activeTech.clientDistrict}</span>
            </div>
            <div className="w-full bg-[#e1ebe1] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#006946] h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      ((activeTech.initialEtaMinutes - activeTech.currentEtaMinutes) /
                        activeTech.initialEtaMinutes) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Action Buttons: WhatsApp Pro & Call */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#f2fcf2]">
            <a
              href={`https://wa.me/${activeTech.artisan.whatsapp}?text=Bonjour%20${encodeURIComponent(
                activeTech.artisan.name
              )},%20je%20suis%20votre%20position%20sur%20Google%20Maps%20MboaFacile.`}
              target="_blank"
              rel="noreferrer"
              className="h-11 rounded-xl bg-[#bfecdc] hover:bg-[#a4d0c0] text-[#006946] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>WhatsApp Direct</span>
            </a>

            <a
              href={`tel:${activeTech.artisan.phone}`}
              className="h-11 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              <span>Appeler le pro</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
