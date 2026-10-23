import React, { useState } from 'react';
import { CATEGORIES, DOUALA_DISTRICTS, Artisan, UserRequest } from '../data/mockData';

interface DevisWizardViewProps {
  initialArtisan?: Artisan;
  initialCategory?: string;
  initialUrgency?: string;
  onNavigate: (tab: string) => void;
  onAddRequest: (newReq: UserRequest) => void;
  onShowToast: (msg: string) => void;
}

export const DevisWizardView: React.FC<DevisWizardViewProps> = ({
  initialArtisan,
  initialCategory,
  initialUrgency = 'urgent',
  onNavigate,
  onAddRequest,
  onShowToast,
}) => {
  const [step, setStep] = useState<number>(2); // Start at Step 2 like in the user's mockup Image_8, with ability to go back to 1 or forward to 3 & 4!

  // Form State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCategory || (initialArtisan ? initialArtisan.category : 'electricite')
  );
  const [targetArtisan, setTargetArtisan] = useState<Artisan | undefined>(initialArtisan);
  const [broadcastToMulti, setBroadcastToMulti] = useState(true);

  // Step 2 Details
  const [title, setTitle] = useState(
    initialArtisan ? `Intervention avec ${initialArtisan.name}` : 'Réparation disjoncteur principal et prises'
  );
  const [description, setDescription] = useState(
    "Le disjoncteur différentiel saute dès qu'on allume un gros appareil. Pas de courant dans le salon."
  );
  const [photos, setPhotos] = useState<string[]>([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCXPOAInHd3s2hfzD8PuE3TImqQoqKGJsqPds-SXxZPm4iEgt5xoryl32TGqHI7DEQ_4nvKnrJOy4Gsw14AVmQLdGGEn3isGKKjuuzqoZb5xn84qIjWzEt5kACLgyh0KLjQEXZ007ox4MetLO1D9TeD5h6U03loe6ShQXdpB8eHaGVEkPHN8SsowPN3UCLIvpNeBkxLcTluC0CjGEhwADBJr6-WeEl8-SY18WVQ9D9sPRESjVfVleYUzQ',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAdpH7r8qu9EWeb6xWp1HjCLNESkWsEModMx9HO_9QPKWBk_jiji5GWBa1pexiQJ8ncYMCSDQHaIP7pKKNbrtFQ-t9BcNcTIWsZhWuDJb2KmuHygtgEOA19pDaloAiRcXBHcqHW9ciqiPzmT4uupuSE698Bjm-i_VpBsUntAxSgLW9dY3mMIYe5dDqZqhc3SszilwjQY3MHjLnRILHpGykSdlQZdolQfOwVju753yX9hL5MTRqBpkmrJA',
  ]);
  const [district, setDistrict] = useState(initialArtisan ? initialArtisan.district : 'Akwa');
  const [propertyType, setPropertyType] = useState<'appartement' | 'villa' | 'bureau'>('appartement');
  const [urgency, setUrgency] = useState<string>(initialUrgency);
  const [budgetRange, setBudgetRange] = useState<string>('10k_30k');

  // Step 3 Date & Logistics
  const [preferredDate, setPreferredDate] = useState('Aujourd’hui');
  const [timeSlot, setTimeSlot] = useState('14h00 - 16h00 (Après-midi)');
  const [exactAddress, setExactAddress] = useState('Rue Pau, face Hôtel Akwa Palace, Entrée 2');
  const [paymentPreference, setPaymentPreference] = useState('Orange Money / MTN MoMo');

  // Step 4 Contact
  const [clientName, setClientName] = useState('Mme Kamga Sylvie');
  const [clientPhone, setClientPhone] = useState('699 45 21 80');
  const [clientEmail, setClientEmail] = useState('sylvie.kamga@gmail.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<UserRequest | null>(null);

  const selectedCategory = CATEGORIES.find((c) => c.id === selectedCategoryId) || CATEGORIES[0];

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newUrl = URL.createObjectURL(e.target.files[0]);
      setPhotos([...photos, newUrl]);
      onShowToast('Photo ajoutée au devis');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleCompleteSubmission = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = `MB-2025-${Math.floor(1000 + Math.random() * 9000)}`;
      const newReq: UserRequest = {
        id: generatedId,
        title: title || 'Demande d’intervention',
        serviceCategory: selectedCategory.name,
        artisanName: targetArtisan ? targetArtisan.name : '3 artisans certifiés consultés',
        artisanJob: targetArtisan ? targetArtisan.job : `${selectedCategory.name} Pro`,
        artisanAvatar: targetArtisan
          ? targetArtisan.avatar
          : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbdkEH3oGv7EOEN_Onf8UkFeCBSLqUcz1CVcsR4ffbecNtqeIfgi4DiPiZ_iVMstwtLcaox_V7Ho_9VBYrv9y6FtDufFWigtDZI1DR0FnVOL4VsXWf1APuP2JX9i7zsIImHzcgBHKnA8bD7MDMvYOauFge4TkgM9MqUN7kvn3qYXHldBliw2RPcrCin_u3vt3KeKM35ziHDkjXdqR1msE5R9PcA82Fa_p-s2GE8JHY3AdjaioUqdKTfw',
        district: `${district} (Douala)`,
        propertyType: propertyType === 'appartement' ? 'Appartement' : propertyType === 'villa' ? 'Villa' : 'Commerce',
        urgency,
        estimatedBudget:
          budgetRange === 'under_10k'
            ? '< 10 000 FCFA'
            : budgetRange === '10k_30k'
            ? '10 000 – 30 000 FCFA'
            : budgetRange === '30k_100k'
            ? '30 000 – 100 000 FCFA'
            : 'Sur devis',
        status: 'en_attente',
        statusLabel: 'Demande transmise • En attente des chiffrages',
        statusColor: '#a06800',
        date: preferredDate,
        timeSlot,
        phone: clientPhone,
        description,
      };

      onAddRequest(newReq);
      setSubmittedRequest(newReq);
      setIsSubmitting(false);
      onShowToast(`Votre devis ${generatedId} a été créé avec succès !`);
    }, 800);
  };

  // If already submitted, display confirmation view
  if (submittedRequest) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center text-center pb-24">
        <div className="w-16 h-16 rounded-full bg-[#bfecdc] text-[#006946] flex items-center justify-center mb-4 shadow-sm animate-in zoom-in-75 duration-200">
          <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#bfecdc] text-[#006946] text-xs font-bold mb-2">
          Dossier validé avec succès
        </span>

        <h2 className="text-2xl font-extrabold text-[#151e18]">Demande de devis enregistrée !</h2>
        <p className="text-xs sm:text-sm text-[#6e7a72] max-w-md mt-1 leading-relaxed">
          Votre demande porte la référence officielle{' '}
          <strong className="text-[#006946] font-mono">{submittedRequest.id}</strong>. Les professionnels disponibles
          vont vous contacter d'ici 15 minutes sur WhatsApp au{' '}
          <strong className="text-[#151e18]">{clientPhone}</strong>.
        </p>

        {/* Recap Ticket Card */}
        <div className="w-full bg-white rounded-3xl p-5 shadow-md border border-[#e1ebe1] text-left mt-6 space-y-3">
          <div className="flex items-center justify-between border-b border-[#e1ebe1] pb-3">
            <div>
              <span className="text-[11px] text-[#6e7a72]">Numéro de dossier</span>
              <p className="font-mono font-bold text-sm text-[#006946]">{submittedRequest.id}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#ffddb4] text-[#7f5200] text-xs font-bold">
              En cours de chiffrage
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[#6e7a72] block">Service :</span>
              <span className="font-bold text-[#151e18]">{submittedRequest.serviceCategory}</span>
            </div>
            <div>
              <span className="text-[#6e7a72] block">Quartier :</span>
              <span className="font-bold text-[#151e18]">{submittedRequest.district}</span>
            </div>
            <div>
              <span className="text-[#6e7a72] block">Créneau souhaité :</span>
              <span className="font-bold text-[#151e18]">
                {submittedRequest.date} ({submittedRequest.timeSlot})
              </span>
            </div>
            <div>
              <span className="text-[#6e7a72] block">Budget estimé :</span>
              <span className="font-bold text-[#006946]">{submittedRequest.estimatedBudget}</span>
            </div>
          </div>

          <div className="p-3 bg-[#ecf6ed] rounded-2xl flex items-start gap-2.5 text-xs text-[#3e4942]">
            <span className="material-symbols-outlined text-[#006946] text-[18px] shrink-0 mt-0.5">
              security
            </span>
            <span>
              Paiement protégé MboaFacile : vous ne réglez rien à l'avance. Le paiement se fait uniquement à la livraison du travail validé.
            </span>
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-3 mt-6">
          <button
            type="button"
            onClick={() => onNavigate('demandes')}
            className="flex-1 h-12 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">assignment</span>
            <span>Suivre ma demande en direct</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('accueil')}
            className="h-12 px-6 rounded-xl bg-white border border-[#dbe5dc] text-[#151e18] font-bold text-sm hover:bg-[#ecf6ed]"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Stepper de progression (4 étapes) */}
      <div className="px-4 pt-3 pb-3 bg-[#ecf6ed] border-b border-[#e1ebe1]">
        <div className="max-w-2xl mx-auto w-full">
          {/* Breadcrumb contextuel */}
          <div className="flex items-center gap-1.5 text-[#3e4942] text-xs font-semibold mb-3">
            <button type="button" onClick={() => onNavigate('accueil')} className="hover:underline">
              Accueil
            </button>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span>Devis en ligne</span>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#006946] font-bold">Étape {step} sur 4</span>
          </div>

          {/* Stepper Icons */}
          <div className="grid grid-cols-4 gap-2 relative">
            {[
              { num: 1, label: '1. Service' },
              { num: 2, label: '2. Détails' },
              { num: 3, label: '3. Planification' },
              { num: 4, label: '4. Contact' },
            ].map((s) => {
              const isPast = step > s.num;
              const isCurrent = step === s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num)}
                  className="flex flex-col items-center text-center group"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 text-xs font-bold transition-all ${
                      isPast
                        ? 'bg-[#006946] text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#16845b] text-white ring-4 ring-[#bfecdc] shadow-md scale-105'
                        : 'bg-[#dbe5dc] text-[#6e7a72]'
                    }`}
                  >
                    {isPast ? (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : (
                      s.num
                    )}
                  </div>
                  <span
                    className={`text-[11px] truncate w-full ${
                      isCurrent ? 'font-bold text-[#151e18]' : 'text-[#6e7a72]'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress bar continuous */}
          <div className="w-full bg-[#dbe5dc] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#006946] h-full rounded-full transition-all duration-300"
              style={{ width: `${step * 25}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 pt-4">
        {/* ================= STEP 1: SERVICE CATEGORY ================= */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#151e18]">Sélectionnez la catégorie du besoin</h2>
              <p className="text-xs text-[#6e7a72]">Quel type d'artisan doit intervenir à votre domicile ?</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setStep(2);
                    }}
                    className={`p-3.5 rounded-2xl flex items-center gap-3 border text-left transition-all ${
                      isSelected
                        ? 'bg-[#bfecdc]/60 border-[#006946] shadow-xs'
                        : 'bg-white border-[#e1ebe1] hover:border-[#006946]/40 hover:bg-[#f2fcf2]'
                    }`}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.bgLight, color: cat.accentColor }}
                    >
                      <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-[#151e18] truncate">{cat.name}</span>
                      <span className="text-[11px] text-[#6e7a72] truncate">{cat.prosCount} artisans</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-12 px-6 rounded-xl bg-[#006946] text-white font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <span>Continuer vers les Détails</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: DÉTAILS (From user mockup Image_8) ================= */}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(3);
            }}
            className="flex flex-col gap-4"
          >
            {/* Category Recap & Target Artisan */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e1ebe1] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-[#bfecdc] flex items-center justify-center text-[#006946]">
                    <span className="material-symbols-outlined text-[20px]">{selectedCategory.icon}</span>
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#6e7a72]">Catégorie sélectionnée</span>
                    <span className="font-bold text-sm text-[#151e18] leading-tight">
                      {selectedCategory.name} &amp; Dépannage
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#006946] font-bold flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-[#ecf6ed] hover:bg-[#e1ebe1]"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  Changer
                </button>
              </div>

              {/* Artisan assigned or multi-broadcast */}
              <div className="bg-[#ecf6ed] rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#3e4942] font-semibold">Attribution de la demande</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#bfecdc] text-[#006946]">
                    <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                    Vérifié Mboa
                  </span>
                </div>

                {targetArtisan ? (
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl shadow-2xs border border-[#e1ebe1]">
                    <img
                      src={targetArtisan.avatar}
                      alt={targetArtisan.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-[#006946]/30"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-[#151e18] truncate">
                          {targetArtisan.name}
                        </span>
                        <span className="flex items-center text-[#ffb955] text-xs font-bold">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>{' '}
                          {targetArtisan.rating}
                        </span>
                      </div>
                      <span className="text-xs text-[#6e7a72] truncate">
                        {targetArtisan.job} • {targetArtisan.district}, Douala
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[#3e4942]">
                    Votre demande sera adressée en priorité aux 3 artisans certifiés les mieux notés de votre quartier.
                  </div>
                )}

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={broadcastToMulti}
                    onChange={(e) => setBroadcastToMulti(e.target.checked)}
                    className="w-4 h-4 rounded text-[#006946] accent-[#006946]"
                  />
                  <span className="text-xs text-[#151e18]">
                    Envoyer aussi aux <strong className="text-[#006946]">3 meilleurs artisans disponibles</strong> de mon quartier
                  </span>
                </label>
              </div>
            </div>

            {/* Titre du besoin */}
            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Titre de votre demande *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Réparation disjoncteur principal et prises cuisine"
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#dbe5dc] text-sm text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              />
            </div>

            {/* Description détaillée */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#151e18] uppercase tracking-wider">
                  Description détaillée de la panne *
                </label>
                <span className="text-[11px] text-[#6e7a72]">{description.length} / 500 car.</span>
              </div>
              <textarea
                required
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez ce qui ne fonctionne pas, les symptômes constatés, si le disjoncteur Eneo saute..."
                className="w-full p-3.5 rounded-xl bg-white border border-[#dbe5dc] text-sm text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946] resize-none"
              />
            </div>

            {/* Photos du problème */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#151e18] uppercase tracking-wider">
                  Photos du problème <span className="text-[#6e7a72] font-normal">(Recommandé)</span>
                </label>
                <span className="text-[11px] font-bold text-[#006946] bg-[#bfecdc]/60 px-2 py-0.5 rounded-full">
                  Accélère le devis
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {photos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden aspect-square bg-[#ecf6ed] border border-[#dbe5dc]"
                  >
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#ba1a1a] transition-colors"
                      title="Supprimer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}

                {/* Add Photo Button */}
                <label className="flex flex-col items-center justify-center aspect-square rounded-xl bg-white hover:bg-[#ecf6ed] transition-colors cursor-pointer border-2 border-dashed border-[#dbe5dc] text-center p-2 group">
                  <input type="file" accept="image/*" onChange={handleAddPhoto} className="hidden" />
                  <div className="w-8 h-8 rounded-full bg-[#bfecdc] flex items-center justify-center text-[#006946] mb-1 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
                  </div>
                  <span className="text-xs font-bold text-[#151e18]">Ajouter</span>
                  <span className="text-[10px] text-[#6e7a72]">Max 5 Mo</span>
                </label>
              </div>
            </div>

            {/* Quartier d'intervention (Douala) */}
            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Quartier d'intervention (Douala) *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-[20px] text-[#006946]">
                  location_on
                </span>
                <select
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-11 pl-10 pr-8 rounded-xl bg-white border border-[#dbe5dc] text-sm text-[#151e18] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#006946]"
                >
                  {DOUALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d} (Douala)
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#6e7a72] pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Type de lieu d'intervention */}
            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Type de bâtiment / lieu *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'appartement', label: 'Logement', sub: 'Appartement', icon: 'apartment' },
                  { id: 'villa', label: 'Maison', sub: 'Villa / Duplex', icon: 'cottage' },
                  { id: 'bureau', label: 'Pro', sub: 'Magasin / Bureau', icon: 'store' },
                ].map((item) => {
                  const isChecked = propertyType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPropertyType(item.id as any)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                        isChecked
                          ? 'bg-[#bfecdc]/50 border-[#006946] shadow-xs'
                          : 'bg-white border-[#e1ebe1] hover:bg-[#ecf6ed]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px] text-[#006946] mb-0.5">
                        {item.icon}
                      </span>
                      <span className="text-xs font-bold text-[#151e18]">{item.label}</span>
                      <span className="text-[10px] text-[#6e7a72]">{item.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Degré d'urgence */}
            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Quand souhaitez-vous l'intervention ?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'urgent', title: 'Urgent (Aujourd’hui)', sub: 'Prioritaire sous 3h', isHot: true },
                  { id: '48h', title: 'Dans les 48h', sub: 'Créneau rapide' },
                  { id: 'semaine', title: 'Cette semaine', sub: 'Jours ouvrés' },
                  { id: 'flexible', title: 'Flexible', sub: 'Selon disponibilité' },
                ].map((item) => {
                  const isChecked = urgency === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setUrgency(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                        isChecked
                          ? 'bg-[#006946] text-white border-[#006946] shadow-xs'
                          : 'bg-white text-[#151e18] border-[#e1ebe1] hover:bg-[#ecf6ed]'
                      }`}
                    >
                      {item.isHot && <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-ping" />}
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight">{item.title}</span>
                        <span className={`text-[10px] ${isChecked ? 'text-white/80' : 'text-[#6e7a72]'}`}>
                          {item.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fourchette budgétaire */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#151e18] uppercase tracking-wider">
                  Budget estimé (Francs CFA)
                </label>
                <span className="text-xs text-[#6e7a72]">Facultatif</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'under_10k', label: '< 10 000 FCFA' },
                  { id: '10k_30k', label: '10k – 30 000 FCFA' },
                  { id: '30k_100k', label: '30k – 100 000 FCFA' },
                  { id: 'quote', label: 'Sur devis artisan' },
                ].map((item) => {
                  const isChecked = budgetRange === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBudgetRange(item.id)}
                      className={`h-10 px-2 rounded-xl text-xs font-bold border transition-all ${
                        isChecked
                          ? 'bg-[#bfecdc] text-[#006946] border-[#006946]'
                          : 'bg-white text-[#3e4942] border-[#e1ebe1] hover:bg-[#ecf6ed]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reassurance Banner */}
            <div className="bg-[#ecf6ed] rounded-2xl p-3.5 flex items-start gap-3 border border-[#bfecdc]">
              <span className="material-symbols-outlined text-[#006946] text-[22px] shrink-0">
                shield_lock
              </span>
              <div className="text-xs text-[#3e4942] leading-relaxed">
                <strong className="font-bold text-[#151e18] block">Devis 100% gratuit &amp; engagement zéro</strong>
                Vos coordonnées personnelles ne seront partagées qu'après votre validation à l'étape suivante.
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-12 px-5 rounded-xl bg-white border border-[#dbe5dc] text-[#151e18] font-bold text-xs hover:bg-[#ecf6ed]"
              >
                Précédent
              </button>
              <button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <span>Continuer vers l'Étape 3 (Date)</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 3: PLANIFICATION & DATE ================= */}
        {step === 3 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(4);
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <h2 className="text-lg font-bold text-[#151e18]">Date &amp; Modalités d'intervention</h2>
              <p className="text-xs text-[#6e7a72]">Indiquez vos disponibilités pour l'accueil de l'artisan</p>
            </div>

            {/* Date selection */}
            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Jour d'intervention souhaité *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Aujourd’hui', 'Demain', 'Ce week-end'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setPreferredDate(d)}
                    className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                      preferredDate === d
                        ? 'bg-[#006946] text-white border-[#006946]'
                        : 'bg-white text-[#3e4942] border-[#e1ebe1] hover:bg-[#ecf6ed]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot selection */}
            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Créneau horaire préféré *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'Matin (08h00 - 12h00)', label: 'Matinée', time: '08h00 - 12h00' },
                  { id: '14h00 - 16h00 (Après-midi)', label: 'Après-midi', time: '14h00 - 17h00' },
                  { id: 'Soir (17h00 - 19h00)', label: 'Fin de journée', time: '17h00 - 19h30' },
                ].map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setTimeSlot(slot.id)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      timeSlot === slot.id
                        ? 'bg-[#bfecdc] text-[#006946] border-[#006946] font-bold'
                        : 'bg-white text-[#3e4942] border-[#e1ebe1] hover:bg-[#ecf6ed]'
                    }`}
                  >
                    <span className="block text-xs font-bold">{slot.label}</span>
                    <span className="text-[11px] opacity-80">{slot.time}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Repère / Adresse précise */}
            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Adresse précise et repère à {district} *
              </label>
              <textarea
                required
                rows={2}
                value={exactAddress}
                onChange={(e) => setExactAddress(e.target.value)}
                placeholder="Ex : Derrière la pharmacie du Centre, 2e portail noir à droite..."
                className="w-full p-3.5 rounded-xl bg-white border border-[#dbe5dc] text-sm text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946] resize-none"
              />
              <span className="text-[11px] text-[#6e7a72] mt-1 block">
                Permet à l'artisan d'arriver sans vous appeler à chaque carrefour.
              </span>
            </div>

            {/* Mode de règlement */}
            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Mode de règlement prévu après intervention *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Orange Money / MTN MoMo', 'Espèces en main propre'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentPreference(method)}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all ${
                      paymentPreference === method
                        ? 'bg-[#bfecdc] text-[#006946] border-[#006946]'
                        : 'bg-white text-[#3e4942] border-[#e1ebe1] hover:bg-[#ecf6ed]'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-12 px-5 rounded-xl bg-white border border-[#dbe5dc] text-[#151e18] font-bold text-xs hover:bg-[#ecf6ed]"
              >
                Précédent
              </button>
              <button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2"
              >
                <span>Continuer vers l'Étape 4 (Contact)</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 4: CONTACT & CONFIRMATION ================= */}
        {step === 4 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCompleteSubmission();
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <h2 className="text-lg font-bold text-[#151e18]">Coordonnées de contact</h2>
              <p className="text-xs text-[#6e7a72]">Où l'artisan doit-il vous envoyer le devis chiffré ?</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Nom complet ou Entreprise *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex : Sylvie Kamga"
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#dbe5dc] text-sm text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Numéro WhatsApp / Téléphone *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs font-bold text-[#6e7a72]">+237</span>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="6XX XXX XXX"
                  className="w-full h-11 pl-14 pr-3.5 rounded-xl bg-white border border-[#dbe5dc] text-sm text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151e18] uppercase tracking-wider mb-1">
                Email (Optionnel pour recevoir copie PDF)
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Ex : sylvie@exemple.cm"
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#dbe5dc] text-sm text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              />
            </div>

            {/* Full Summary Box */}
            <div className="bg-white rounded-2xl p-4 border border-[#e1ebe1] shadow-xs space-y-2.5">
              <span className="text-xs font-bold text-[#151e18] uppercase tracking-wider block border-b border-[#e1ebe1] pb-2">
                Récapitulatif de votre demande
              </span>

              <div className="text-xs space-y-1.5 text-[#3e4942]">
                <div className="flex justify-between">
                  <span className="text-[#6e7a72]">Service :</span>
                  <span className="font-bold text-[#151e18]">{selectedCategory.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e7a72]">Intervention :</span>
                  <span className="font-bold text-[#151e18]">
                    {district} • {preferredDate} ({timeSlot})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e7a72]">Paiement :</span>
                  <span className="font-bold text-[#006946]">{paymentPreference}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="h-12 px-5 rounded-xl bg-white border border-[#dbe5dc] text-[#151e18] font-bold text-xs hover:bg-[#ecf6ed]"
              >
                Précédent
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                    <span>Validation du dossier...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Valider ma demande de devis</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
