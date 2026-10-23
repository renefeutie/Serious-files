import React, { useState } from 'react';
import { CATEGORIES, DOUALA_DISTRICTS } from '../data/mockData';

interface ProRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (artisanName: string) => void;
}

export const ProRegistrationModal: React.FC<ProRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [trade, setTrade] = useState(CATEGORIES[0].id);
  const [district, setDistrict] = useState(DOUALA_DISTRICTS[0]);
  const [cniNumber, setCniNumber] = useState('');
  const [experience, setExperience] = useState('3-5 ans');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmitSuccess(fullName || 'Artisan');
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-[#e1ebe1]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#ffddb4] text-[#7f5200] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">handyman</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#151e18]">Devenir Prestataire Vérifié</h3>
              <p className="text-xs text-[#6e7a72]">Rejoignez le réseau MboaFacile à Douala &amp; Yaoundé</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f2fcf2] text-[#3e4942] hover:bg-[#e6f1e7] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
              Nom complet ou Nom de l'atelier *
            </label>
            <input
              type="text"
              required
              placeholder="Ex : Atangana Joseph (Élec-Pro Akwa)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#f2fcf2] border border-[#dbe5dc] text-sm focus:outline-none focus:ring-2 focus:ring-[#006946]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Numéro WhatsApp Pro *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs font-bold text-[#6e7a72]">+237</span>
                <input
                  type="tel"
                  required
                  placeholder="6XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 pl-14 pr-3 rounded-xl bg-[#f2fcf2] border border-[#dbe5dc] text-sm focus:outline-none focus:ring-2 focus:ring-[#006946]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Métier principal *
              </label>
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#f2fcf2] border border-[#dbe5dc] text-sm focus:outline-none focus:ring-2 focus:ring-[#006946]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Quartier d'atelier / base *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#f2fcf2] border border-[#dbe5dc] text-sm focus:outline-none focus:ring-2 focus:ring-[#006946]"
              >
                {DOUALA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d} (Douala)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Expérience dans le métier
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#f2fcf2] border border-[#dbe5dc] text-sm focus:outline-none focus:ring-2 focus:ring-[#006946]"
              >
                <option value="1-2 ans">1 à 2 ans</option>
                <option value="3-5 ans">3 à 5 ans</option>
                <option value="5-10 ans">5 à 10 ans</option>
                <option value="+10 ans">+10 ans (Maître artisan)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
              Numéro CNI ou Récépissé d'identité (Confidentialité garantie) *
            </label>
            <input
              type="text"
              required
              placeholder="Ex : 108492049 (Format officiel DGSN)"
              value={cniNumber}
              onChange={(e) => setCniNumber(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#f2fcf2] border border-[#dbe5dc] text-sm focus:outline-none focus:ring-2 focus:ring-[#006946]"
            />
            <p className="text-[11px] text-[#6e7a72] mt-1">
              La vérification CNI permet d'obtenir le badge vert « Profil Vérifié » qui multiplie par 4 vos demandes.
            </p>
          </div>

          <div className="p-3 bg-[#ecf6ed] rounded-xl flex items-start gap-2.5 text-xs text-[#3e4942]">
            <span className="material-symbols-outlined text-[#006946] text-[18px] shrink-0 mt-0.5">
              verified_user
            </span>
            <span>
              Zéro abonnement mensuel obligatoire. Vous ne payez qu'une commission symbolique de 5% une fois la mission terminée et validée par le client.
            </span>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl bg-[#f2fcf2] text-[#3e4942] font-semibold text-sm hover:bg-[#e6f1e7]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-11 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              {submitting ? (
                <>
                  <span className="inline-block animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                  <span>Validation du dossier...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Soumettre ma candidature Pro</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
