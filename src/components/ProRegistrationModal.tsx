import React, { useState } from 'react';
import { CATEGORIES, DOUALA_DISTRICTS } from '../data/mockData';
import { sanitizeInput, validateCameroonPhone, checkRateLimit, recordActionTimestamp } from '../utils/security';
import { DistrictCombobox } from './DistrictCombobox';

interface ProRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (artisanName: string) => void;
  onOpenPrivacyPolicy?: () => void;
}

export const ProRegistrationModal: React.FC<ProRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  onOpenPrivacyPolicy,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [trade, setTrade] = useState(CATEGORIES[0].id);
  const [district, setDistrict] = useState(DOUALA_DISTRICTS[0]);
  const [cniNumber, setCniNumber] = useState('');
  const [experience, setExperience] = useState('3-5 ans');
  const [consentGiven, setConsentGiven] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; cni?: string; consent?: string; general?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-spam rate limiting
    const rateCheck = checkRateLimit('pro_registration', 3000, false);
    if (!rateCheck.allowed) {
      setErrors({ general: `Veuillez patienter ${rateCheck.waitSeconds}s avant de soumettre.` });
      return;
    }

    const phoneVal = validateCameroonPhone(phone);
    const newErrors: { phone?: string; cni?: string; consent?: string; general?: string } = {};

    if (!phoneVal.isValid) {
      newErrors.phone = phoneVal.error;
    }

    const cleanCni = cniNumber.trim().replace(/[\s\-]/g, '');
    if (!cleanCni || cleanCni.length < 5) {
      newErrors.cni = 'Veuillez renseigner un numéro de CNI ou de récépissé valide (au moins 5 caractères).';
    }

    if (!consentGiven) {
      newErrors.consent = 'Votre accord préalable est requis pour le traitement de votre dossier d’artisan.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    recordActionTimestamp('pro_registration');
    setErrors({});
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      const cleanName = sanitizeInput(fullName, 60);
      onSubmitSuccess(cleanName || 'Artisan');
      onClose();
    }, 700);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto no-scrollbar border border-[#dbe5dc]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e1ebe1]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#ffddb4] text-[#7f5200] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">handyman</span>
            </div>
            <div>
              <h3 id="pro-modal-title" className="text-base sm:text-lg font-bold text-[#151e18]">
                Devenir Prestataire Vérifié
              </h3>
              <p className="text-xs text-[#6e7a72]">Rejoignez le réseau MboaFacile à Douala &amp; Yaoundé</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f2fcf2] text-[#3e4942] hover:bg-[#e6f1e7] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#006946]"
            aria-label="Fermer la boîte de candidature"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {errors.general && (
          <div role="alert" className="mt-3 p-3 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          {/* Nom complet */}
          <div>
            <label htmlFor="pro-full-name" className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
              Nom complet ou Nom de l'atelier <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              id="pro-full-name"
              type="text"
              required
              maxLength={70}
              placeholder="Ex : Atangana Joseph (Élec-Pro Akwa)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#f2fcf2] border border-[#dbe5dc] text-sm text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946] focus-visible:ring-2 focus-visible:ring-[#006946]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Téléphone WhatsApp */}
            <div>
              <label htmlFor="pro-phone" className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Numéro WhatsApp Pro <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs font-bold text-[#6e7a72]" aria-hidden="true">+237</span>
                <input
                  id="pro-phone"
                  type="tel"
                  required
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'pro-phone-error' : undefined}
                  placeholder="6XX XXX XXX"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  className={`w-full h-11 pl-14 pr-3 rounded-xl bg-[#f2fcf2] border text-sm text-[#151e18] focus:outline-none focus:ring-2 focus-visible:ring-2 ${
                    errors.phone
                      ? 'border-[#ba1a1a] focus:ring-[#ba1a1a] focus-visible:ring-[#ba1a1a]'
                      : 'border-[#dbe5dc] focus:ring-[#006946] focus-visible:ring-[#006946]'
                  }`}
                />
              </div>
              {errors.phone && (
                <p id="pro-phone-error" role="alert" className="text-xs text-[#ba1a1a] font-medium mt-1">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Métier principal */}
            <div>
              <label htmlFor="pro-trade" className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Métier principal <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                id="pro-trade"
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#f2fcf2] border border-[#dbe5dc] text-sm text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946] focus-visible:ring-2 focus-visible:ring-[#006946]"
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
            {/* Quartier d'atelier avec recherche intégrée */}
            <DistrictCombobox
              id="pro-district-search"
              label="Quartier d'atelier / base"
              required
              value={district}
              onChange={(newDistrict) => setDistrict(newDistrict)}
              placeholder="Rechercher votre quartier d'atelier..."
              showPopularChips={false}
            />

            {/* Expérience */}
            <div>
              <label htmlFor="pro-experience" className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Expérience dans le métier
              </label>
              <select
                id="pro-experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#f2fcf2] border border-[#dbe5dc] text-sm text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946] focus-visible:ring-2 focus-visible:ring-[#006946]"
              >
                <option value="1-2 ans">1 à 2 ans</option>
                <option value="3-5 ans">3 à 5 ans</option>
                <option value="5-10 ans">5 à 10 ans</option>
                <option value="+10 ans">+10 ans (Maître artisan)</option>
              </select>
            </div>
          </div>

          {/* Numéro CNI */}
          <div>
            <label htmlFor="pro-cni" className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
              Numéro CNI ou Récépissé d'identité (DGSN) <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              id="pro-cni"
              type="text"
              required
              maxLength={25}
              aria-invalid={!!errors.cni}
              aria-describedby={errors.cni ? 'pro-cni-error' : 'pro-cni-hint'}
              placeholder="Ex : 108492049"
              value={cniNumber}
              onChange={(e) => {
                setCniNumber(e.target.value);
                if (errors.cni) setErrors((prev) => ({ ...prev, cni: undefined }));
              }}
              className={`w-full h-11 px-3.5 rounded-xl bg-[#f2fcf2] border text-sm text-[#151e18] focus:outline-none focus:ring-2 focus-visible:ring-2 ${
                errors.cni
                  ? 'border-[#ba1a1a] focus:ring-[#ba1a1a] focus-visible:ring-[#ba1a1a]'
                  : 'border-[#dbe5dc] focus:ring-[#006946] focus-visible:ring-[#006946]'
              }`}
            />
            {errors.cni ? (
              <p id="pro-cni-error" role="alert" className="text-xs text-[#ba1a1a] font-medium mt-1">
                {errors.cni}
              </p>
            ) : (
              <p id="pro-cni-hint" className="text-[11px] text-[#6e7a72] mt-1">
                Utilisé exclusivement pour la vérification physique et l'attribution du badge vert certifié.
              </p>
            )}
          </div>

          {/* RGPD & Verification Consent */}
          <div className="p-3 bg-[#ecf6ed] rounded-xl border border-[#dbe5dc]">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                id="pro-consent"
                type="checkbox"
                required
                aria-required="true"
                checked={consentGiven}
                onChange={(e) => {
                  setConsentGiven(e.target.checked);
                  if (errors.consent) setErrors((prev) => ({ ...prev, consent: undefined }));
                }}
                className="w-4 h-4 rounded text-[#006946] accent-[#006946] shrink-0 mt-0.5 focus-visible:ring-2 focus-visible:ring-[#006946]"
              />
              <span className="text-xs text-[#3e4942] leading-relaxed">
                J'atteste sur l'honneur de l'exactitude de mes compétences et j'accepte que mes pièces soient vérifiées
                conformément aux{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPrivacyPolicy?.();
                  }}
                  className="text-[#006946] font-bold underline hover:text-[#005236] inline focus-visible:ring-2 focus-visible:ring-[#006946] rounded-xs"
                >
                  Conditions Générales et à la Politique de Confidentialité
                </button>
                .
              </span>
            </label>
            {errors.consent && (
              <p role="alert" className="text-xs text-[#ba1a1a] font-semibold mt-1.5 pl-6">
                {errors.consent}
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl bg-[#f2fcf2] text-[#3e4942] font-semibold text-sm hover:bg-[#e6f1e7] transition-colors focus-visible:ring-2 focus-visible:ring-[#006946]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-11 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all focus-visible:ring-2 focus-visible:ring-[#006946] disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <span className="inline-block animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                  <span>Validation sécurisée...</span>
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
