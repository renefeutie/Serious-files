import React, { useState } from 'react';
import { DOUALA_DISTRICTS } from '../data/mockData';
import { filterDistricts, POPULAR_DOUALA_DISTRICTS } from '../utils/textUtils';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDistrict: string;
  onSelectDistrict: (district: string, city: string) => void;
}

const YAOUNDE_DISTRICTS = ['Bastos', 'Omnisports', 'Essos', 'Mvan', 'Mendong', 'Biyem-Assi', 'Etoudi', 'Nlongkak'];

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  isOpen,
  onClose,
  currentDistrict,
  onSelectDistrict,
}) => {
  const [selectedCity, setSelectedCity] = useState<'Douala' | 'Yaoundé'>('Douala');
  const [filterText, setFilterText] = useState('');

  if (!isOpen) return null;

  const rawDistricts = selectedCity === 'Douala' ? DOUALA_DISTRICTS : YAOUNDE_DISTRICTS;
  const districts = filterDistricts(rawDistricts, filterText);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-selector-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-5 z-10 max-h-[88vh] flex flex-col border border-[#dbe5dc]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e1ebe1]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#bfecdc] text-[#006946] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">location_on</span>
            </div>
            <div>
              <h3 id="city-selector-title" className="text-base sm:text-lg font-bold text-[#151e18]">
                Rechercher votre quartier
              </h3>
              <p className="text-xs text-[#6e7a72]">Localisez les artisans les plus proches de chez vous</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la sélection de ville"
            className="w-9 h-9 rounded-full bg-[#f2fcf2] text-[#3e4942] hover:bg-[#e6f1e7] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#006946]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* City Toggle */}
        <div className="grid grid-cols-2 gap-2 my-3 p-1 bg-[#ecf6ed] rounded-xl">
          <button
            type="button"
            onClick={() => {
              setSelectedCity('Douala');
              setFilterText('');
            }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              selectedCity === 'Douala'
                ? 'bg-white text-[#006946] shadow-sm font-bold'
                : 'text-[#3e4942] hover:text-[#151e18]'
            }`}
          >
            Douala ({DOUALA_DISTRICTS.length} quartiers)
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCity('Yaoundé');
              setFilterText('');
            }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              selectedCity === 'Yaoundé'
                ? 'bg-white text-[#006946] shadow-sm font-bold'
                : 'text-[#3e4942] hover:text-[#151e18]'
            }`}
          >
            Yaoundé ({YAOUNDE_DISTRICTS.length} quartiers)
          </button>
        </div>

        {/* Recherche rapide de quartier avec icône et compteur */}
        <div className="space-y-2 mb-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-[#006946]" aria-hidden="true">
              search
            </span>
            <input
              type="text"
              autoFocus
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder={`Rechercher parmi les ${rawDistricts.length} quartiers (ex: Akwa, Maképè, Logpom)...`}
              className="w-full h-11 pl-10 pr-9 bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] rounded-xl border border-[#dbe5dc] focus:outline-none focus:ring-2 focus:ring-[#006946] focus-visible:ring-2 focus-visible:ring-[#006946]"
            />
            {filterText && (
              <button
                type="button"
                onClick={() => setFilterText('')}
                className="absolute right-2.5 top-3 text-[#6e7a72] hover:text-[#151e18]"
                aria-label="Effacer la recherche"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}
          </div>

          {/* Quartiers populaires pour accès immédiat en 1 clic */}
          {selectedCity === 'Douala' && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-bold text-[#6e7a72] flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-[#006946]">trending_up</span>
                Populaires :
              </span>
              {POPULAR_DOUALA_DISTRICTS.slice(0, 7).map((pop) => (
                <button
                  key={pop}
                  type="button"
                  onClick={() => {
                    onSelectDistrict(pop, selectedCity);
                    onClose();
                  }}
                  className={`text-[11px] px-2 py-0.5 rounded-full transition-all ${
                    currentDistrict.toLowerCase().includes(pop.toLowerCase())
                      ? 'bg-[#006946] text-white font-bold'
                      : 'bg-[#ecf6ed] text-[#006946] hover:bg-[#bfecdc] font-medium'
                  }`}
                >
                  {pop}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Counter header */}
        <div className="flex items-center justify-between text-[11px] text-[#6e7a72] font-semibold pb-1.5 px-1 border-b border-[#e1ebe1]">
          <span>
            {districts.length === 0
              ? 'Aucun résultat'
              : `${districts.length} quartier${districts.length > 1 ? 's' : ''} disponible${districts.length > 1 ? 's' : ''}`}
          </span>
          {filterText && (
            <span className="text-[#006946]">Filtre actif : « {filterText} »</span>
          )}
        </div>

        {/* District list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 pt-2 no-scrollbar max-h-[44vh]">
          {districts.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <span className="material-symbols-outlined text-[32px] text-[#6e7a72]">location_off</span>
              <p className="text-xs text-[#6e7a72]">
                Aucun quartier ne correspond à « <strong className="text-[#151e18]">{filterText}</strong> ».
              </p>
              <button
                type="button"
                onClick={() => {
                  onSelectDistrict(filterText.trim(), selectedCity);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#006946] text-white text-xs font-bold hover:bg-[#16845b]"
              >
                Utiliser « {filterText.trim()} » comme quartier
              </button>
            </div>
          ) : (
            districts.map((district) => {
              const isSelected = currentDistrict.toLowerCase() === district.toLowerCase();
              return (
                <button
                  key={district}
                  type="button"
                  onClick={() => {
                    onSelectDistrict(district, selectedCity);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs sm:text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-[#bfecdc]/60 text-[#006946] font-bold border border-[#006946]/30'
                      : 'bg-[#f2fcf2] text-[#151e18] hover:bg-[#e6f1e7]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="material-symbols-outlined text-[16px] text-[#006946]">location_on</span>
                    <span className="truncate">{district}</span>
                    <span className="text-[10px] text-[#6e7a72]">({selectedCity})</span>
                  </div>

                  {isSelected && (
                    <span className="material-symbols-outlined text-[18px] text-[#006946]">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-[#e1ebe1] mt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#ecf6ed] text-[#3e4942] font-semibold text-xs sm:text-sm hover:bg-[#e1ebe1] transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
