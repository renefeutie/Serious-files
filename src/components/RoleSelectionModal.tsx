import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { DOUALA_DISTRICTS, YAOUNDE_DISTRICTS } from '../data/mockData';

export const RoleSelectionModal: React.FC = () => {
  const { needsRoleSelection, completeGoogleRoleSelection, user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [city, setCity] = useState<'Douala' | 'Yaoundé'>('Douala');
  const [district, setDistrict] = useState('Akwa');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!needsRoleSelection || !user) return null;

  const districtsList = city === 'Douala' ? DOUALA_DISTRICTS : YAOUNDE_DISTRICTS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await completeGoogleRoleSelection(selectedRole, city, district);
    } catch (err) {
      console.error('Erreur sélection rôle Google:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#dbe5dc] space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#bfecdc] text-[#006946] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[28px]">switch_account</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#151e18]">
            Bienvenue sur MboaFacile !
          </h2>
          <p className="text-xs text-[#6e7a72]">
            Pour finaliser votre compte Google (<strong>{user.email}</strong>), veuillez choisir votre profil :
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSelectedRole('client')}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                selectedRole === 'client'
                  ? 'border-[#006946] bg-[#ecf6ed]'
                  : 'border-[#dbe5dc] bg-white hover:bg-[#f2fcf2]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                  selectedRole === 'client' ? 'bg-[#006946] text-white' : 'bg-[#e1ebe1] text-[#6e7a72]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#151e18] block">Je suis un Client Particulier</span>
                <span className="text-[11px] text-[#6e7a72] block mt-0.5">
                  Je souhaite chercher des artisans fiables, sauvegarder mes favoris et demander des devis.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('merchant')}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                selectedRole === 'merchant'
                  ? 'border-[#006946] bg-[#ecf6ed]'
                  : 'border-[#dbe5dc] bg-white hover:bg-[#f2fcf2]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                  selectedRole === 'merchant' ? 'bg-[#006946] text-white' : 'bg-[#e1ebe1] text-[#6e7a72]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">storefront</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#151e18] block">Je suis un Commerçant / Artisan</span>
                <span className="text-[11px] text-[#6e7a72] block mt-0.5">
                  Je souhaite créer ma fiche d'établissement, être géolocalisé et recevoir des demandes clients.
                </span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#151e18] mb-1" htmlFor="role-city">
                Ville
              </label>
              <select
                id="role-city"
                value={city}
                onChange={(e) => {
                  const c = e.target.value as 'Douala' | 'Yaoundé';
                  setCity(c);
                  setDistrict(c === 'Douala' ? 'Akwa' : 'Bastos');
                }}
                className="w-full h-10 px-2.5 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs font-semibold text-[#151e18]"
              >
                <option value="Douala">Douala</option>
                <option value="Yaoundé">Yaoundé</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#151e18] mb-1" htmlFor="role-district">
                Quartier
              </label>
              <select
                id="role-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-10 px-2.5 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs font-semibold text-[#151e18]"
              >
                {districtsList.slice(0, 50).map((d: string) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-2xl bg-[#006946] hover:bg-[#16845b] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Validation...' : 'Confirmer mon profil'}
          </button>
        </form>
      </div>
    </div>
  );
};
