import React, { useState } from 'react';
import { DOUALA_DISTRICTS } from '../data/mockData';

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

  if (!isOpen) return null;

  const districts = selectedCity === 'Douala' ? DOUALA_DISTRICTS : YAOUNDE_DISTRICTS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 z-10 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#e1ebe1]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006946] text-[22px]">location_on</span>
            <h3 className="text-lg font-bold text-[#151e18]">Choisir votre localisation</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f2fcf2] text-[#3e4942] hover:bg-[#e6f1e7] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* City Toggle */}
        <div className="grid grid-cols-2 gap-2 my-3 p-1 bg-[#ecf6ed] rounded-xl">
          <button
            type="button"
            onClick={() => setSelectedCity('Douala')}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              selectedCity === 'Douala'
                ? 'bg-white text-[#006946] shadow-sm'
                : 'text-[#3e4942] hover:text-[#151e18]'
            }`}
          >
            Douala (Littoral)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCity('Yaoundé')}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              selectedCity === 'Yaoundé'
                ? 'bg-white text-[#006946] shadow-sm'
                : 'text-[#3e4942] hover:text-[#151e18]'
            }`}
          >
            Yaoundé (Centre)
          </button>
        </div>

        <p className="text-xs text-[#6e7a72] mb-2">
          Sélectionnez votre quartier pour afficher les artisans les plus proches :
        </p>

        {/* District list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
          {districts.map((district) => {
            const isSelected = currentDistrict.toLowerCase().includes(district.toLowerCase());
            return (
              <button
                key={district}
                type="button"
                onClick={() => {
                  onSelectDistrict(district, selectedCity);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-[#bfecdc]/50 text-[#006946] font-semibold border border-[#006946]/30'
                    : 'bg-[#f2fcf2] text-[#151e18] hover:bg-[#e6f1e7]'
                }`}
              >
                <span>{district}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[18px] text-[#006946]">
                    check_circle
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-[#e1ebe1] mt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#ecf6ed] text-[#3e4942] font-semibold text-sm hover:bg-[#e1ebe1]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
