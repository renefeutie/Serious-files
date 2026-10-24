import React, { useState } from 'react';
import { Artisan, ServiceItem } from '../data/mockData';

interface ArtisanDetailViewProps {
  artisan: Artisan;
  onBack: () => void;
  onStartQuote: (artisan: Artisan, selectedServiceId?: string) => void;
  onShowToast: (msg: string) => void;
  onNavigate?: (tab: string, artisanId?: string) => void;
}

export const ArtisanDetailView: React.FC<ArtisanDetailViewProps> = ({
  artisan,
  onBack,
  onStartQuote,
  onShowToast,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'presentation' | 'services' | 'realisations' | 'avis' | 'zone'>(
    'presentation'
  );
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>(
    artisan.services[0]?.title || 'Diagnostic / Panne de courant'
  );
  const [quoteDistrict, setQuoteDistrict] = useState(artisan.district + ', Douala');
  const [quotePhone, setQuotePhone] = useState('699452180');
  const [quoteDetails, setQuoteDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${artisan.name} - ${artisan.job} sur MboaFacile`,
          text: `Contactez ${artisan.name}, artisan certifié à Douala : ${artisan.startingPriceLabel}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      onShowToast('Lien du profil copié dans le presse-papier !');
    }
  };

  const handleModalQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsQuoteModalOpen(false);
      onShowToast(`Votre devis express a été transmis à ${artisan.name} ! Il vous répondra d’ici 15 min.`);
    }, 700);
  };

  return (
    <div className="flex flex-col w-full pb-28">
      {/* Sub-header / Top Navigation Bar */}
      <div className="sticky top-16 z-30 bg-[#f2fcf2]/95 backdrop-blur-md px-4 py-2 border-b border-[#e1ebe1] flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#006946] hover:text-[#16845b] py-1 px-2 rounded-lg hover:bg-[#ecf6ed]"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Retour aux artisans</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#3e4942] hover:bg-[#ecf6ed] border border-[#e1ebe1] shadow-2xs"
            title="Partager"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        {/* Cover Picture & Avatar */}
        <div className="relative w-full">
          <div
            className="w-full h-44 sm:h-56 bg-cover bg-center"
            style={{ backgroundImage: `url('${artisan.coverImage}')` }}
          >
            <div className="w-full h-full bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>

          {/* Floating Avatar with Trust Halo */}
          <div className="px-4 -mt-14 relative z-10 flex items-end justify-between">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1 shadow-md border border-[#e1ebe1]">
                <img
                  src={artisan.avatar}
                  alt={artisan.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div
                className="absolute -bottom-1 -right-1 bg-[#006946] text-white rounded-full p-1 shadow flex items-center justify-center"
                title="Vérifié CNI MboaFacile"
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-1">
              <span className="inline-flex items-center gap-1 bg-[#bfecdc] text-[#006946] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#006946] animate-pulse" />
                <span>{artisan.availableToday ? 'Disponible aujourd’hui' : `Réponse ${artisan.responseTime}`}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Identity & Credibility Block */}
        <div className="px-4 pt-3 flex flex-col gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 text-[#006946]">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span className="text-xs font-bold uppercase tracking-wider">
                Artisan Certifié MboaFacile
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#151e18] mt-0.5">{artisan.name}</h1>
            <p className="text-sm font-semibold text-[#3d665a]">{artisan.job}</p>
          </div>

          {/* Rating & Location */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#3e4942]">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-[#ffb955]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="font-bold text-sm text-[#151e18]">{artisan.rating}</span>
              <span className="text-[#6e7a72] underline cursor-pointer" onClick={() => setActiveTab('avis')}>
                ({artisan.reviewsCount} avis vérifiés)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-[#a06800]">location_on</span>
              <span>
                {artisan.city} ({artisan.district} et environs...)
              </span>
            </div>
          </div>

          {/* Trust Seals */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
            <span className="inline-flex items-center gap-1.5 bg-white text-[#3e4942] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#e1ebe1] shrink-0">
              <span className="material-symbols-outlined text-[16px] text-[#006946]">badge</span>
              CNI &amp; Casier vérifiés
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white text-[#3e4942] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#e1ebe1] shrink-0">
              <span className="material-symbols-outlined text-[16px] text-[#006946]">security</span>
              Garantie {artisan.guaranteeDays} jours
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white text-[#3e4942] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#e1ebe1] shrink-0">
              <span className="material-symbols-outlined text-[16px] text-[#006946]">workspace_premium</span>
              +{artisan.experienceYears} ans d'expérience
            </span>
          </div>

          {/* Direct Contact Buttons Pair */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <a
              href={`https://wa.me/${artisan.whatsapp}?text=Bonjour%20${encodeURIComponent(
                artisan.name
              )},%20je%20souhaite%20un%20devis%20depuis%20MboaFacile.`}
              target="_blank"
              rel="noreferrer"
              className="h-12 bg-[#bfecdc] hover:bg-[#a4d0c0] text-[#006946] rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span>WhatsApp Pro</span>
            </a>
            <a
              href={`tel:${artisan.phone}`}
              className="h-12 bg-white hover:bg-[#ecf6ed] text-[#151e18] border border-[#dbe5dc] rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[20px] text-[#006946]">call</span>
              <span>Appel direct</span>
            </a>
          </div>
        </div>

        {/* Ergonomic Tabs */}
        <div className="mt-4 px-4 sticky top-28 z-20 bg-[#f2fcf2]/95 backdrop-blur-md py-2 border-b border-[#e1ebe1]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'presentation', label: 'Présentation' },
              { id: 'services', label: `Services & Tarifs (${artisan.services.length})` },
              { id: 'realisations', label: `Réalisations (${artisan.realisations.length})` },
              { id: 'avis', label: `Avis (${artisan.reviewsCount})` },
              { id: 'zone', label: 'Zone couverte' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.8 rounded-full text-xs font-bold shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#006946] text-white shadow-xs'
                      : 'bg-white text-[#3e4942] border border-[#dbe5dc] hover:bg-[#ecf6ed]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Panes */}
        <div className="px-4 pt-3 flex flex-col gap-4">
          {/* 1. Présentation */}
          {activeTab === 'presentation' && (
            <div className="space-y-4">
              {/* Bio Summary Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#e1ebe1] flex flex-col gap-3">
                <h3 className="text-sm font-bold text-[#151e18] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006946] text-[20px]">person_outline</span>
                  <span>À propos de {artisan.name}</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#3e4942] leading-relaxed">{artisan.bio}</p>

                <div className="pt-2 grid grid-cols-2 gap-2.5">
                  <div className="bg-[#ecf6ed] p-3 rounded-xl flex flex-col gap-0.5">
                    <span className="text-[11px] text-[#6e7a72]">Temps de réponse moyen</span>
                    <span className="text-sm font-bold text-[#006946]">{artisan.responseTime}</span>
                  </div>
                  <div className="bg-[#ecf6ed] p-3 rounded-xl flex flex-col gap-0.5">
                    <span className="text-[11px] text-[#6e7a72]">Garantie intervention</span>
                    <span className="text-sm font-bold text-[#006946]">{artisan.guaranteeDays} jours inclus</span>
                  </div>
                </div>
              </div>

              {/* Working Hours & Practical Details */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#e1ebe1] flex flex-col gap-3">
                <h3 className="text-sm font-bold text-[#151e18] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006946] text-[20px]">schedule</span>
                  <span>Informations pratiques</span>
                </h3>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between py-2 bg-[#f2fcf2] px-3 rounded-xl">
                    <span className="text-[#3e4942]">Lundi — Samedi</span>
                    <span className="font-bold text-[#151e18]">07h30 – 18h30</span>
                  </div>
                  <div className="flex items-center justify-between py-2 bg-[#bfecdc]/40 px-3 rounded-xl">
                    <span className="text-[#006946] font-medium">Dimanche</span>
                    <span className="font-bold text-[#006946]">Urgences &amp; Pannes prioritaires</span>
                  </div>
                  <div className="flex items-start gap-2 pt-2 text-[#3e4942]">
                    <span className="material-symbols-outlined text-[18px] text-[#006946] shrink-0">translate</span>
                    <div>
                      <span className="font-bold text-[#151e18]">Langues parlées : </span>
                      <span>{artisan.languages.join(', ')}.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-[#3e4942]">
                    <span className="material-symbols-outlined text-[18px] text-[#006946] shrink-0">payments</span>
                    <div>
                      <span className="font-bold text-[#151e18]">Paiements acceptés : </span>
                      <span>{artisan.paymentMethods.join(', ')}.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charte Banner */}
              <div className="bg-[#bfecdc] text-[#006946] rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-white shrink-0 text-[#006946] shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">verified</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">Charte d'Excellence MboaFacile</h4>
                  <p className="text-xs opacity-90">Tarifs verrouillés au devis, pas de mauvaise surprise sur place.</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. Services & Tarifs */}
          {activeTab === 'services' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-sm font-bold text-[#151e18]">Grille tarifaire indicative</h3>
                <span className="text-xs text-[#6e7a72]">Devis préalable gratuit</span>
              </div>

              {artisan.services.map((svc) => (
                <div
                  key={svc.id}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-[#e1ebe1] hover:border-[#006946]/40 transition-all flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#151e18]">{svc.title}</h4>
                        {svc.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-[#ffddb4] text-[#7f5200] text-[10px] font-bold">
                            {svc.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6e7a72] mt-0.5">{svc.desc}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-[#006946] block">
                        {svc.price.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-[10px] font-bold text-[#6e7a72] uppercase">{svc.priceUnit}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#f2fcf2]">
                    <div className="flex items-center gap-2 text-[11px] text-[#6e7a72]">
                      <span className="material-symbols-outlined text-[15px] text-[#006946]">timer</span>
                      <span>Durée : {svc.duration}</span>
                      {svc.note && <span>• {svc.note}</span>}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedService(svc.title);
                        setIsQuoteModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#ecf6ed] hover:bg-[#bfecdc] text-[#006946] text-xs font-bold transition-colors"
                    >
                      Choisir ce service
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Réalisations */}
          {activeTab === 'realisations' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-sm font-bold text-[#151e18]">Chantiers vérifiés récents</h3>
                <span className="text-xs text-[#6e7a72]">{artisan.realisations.length} photos certifiées</span>
              </div>

              {artisan.realisations.length === 0 ? (
                <div className="p-6 bg-white rounded-2xl text-center text-xs text-[#6e7a72] border border-[#e1ebe1]">
                  Les photos des chantiers récents sont en cours de validation par nos inspecteurs.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {artisan.realisations.map((real) => (
                    <div
                      key={real.id}
                      className="bg-white rounded-2xl overflow-hidden border border-[#e1ebe1] shadow-xs flex flex-col group"
                    >
                      <div className="h-32 sm:h-44 overflow-hidden bg-[#ecf6ed]">
                        <img
                          src={real.image}
                          alt={real.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3 flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-[#151e18] line-clamp-1">{real.title}</span>
                        <span className="text-[11px] text-[#6e7a72]">
                          {real.location} • {real.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Avis clients */}
          {activeTab === 'avis' && (
            <div className="space-y-3.5">
              {/* Ratings breakdown card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#e1ebe1] flex items-center gap-5">
                <div className="flex flex-col items-center justify-center pr-4 border-r border-[#e1ebe1]">
                  <span className="text-3xl font-extrabold text-[#151e18]">{artisan.rating}</span>
                  <div className="flex text-[#ffb955] my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-[#6e7a72]">{artisan.reviewsCount} avis réels</span>
                </div>

                <div className="flex-1 flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-4 font-bold text-[#151e18]">5★</span>
                    <div className="flex-1 h-2 rounded-full bg-[#ecf6ed] overflow-hidden">
                      <div className="bg-[#006946] h-full w-[92%] rounded-full" />
                    </div>
                    <span className="w-7 text-right text-[#6e7a72]">92%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 font-bold text-[#151e18]">4★</span>
                    <div className="flex-1 h-2 rounded-full bg-[#ecf6ed] overflow-hidden">
                      <div className="bg-[#006946] h-full w-[8%] rounded-full" />
                    </div>
                    <span className="w-7 text-right text-[#6e7a72]">8%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 font-bold text-[#151e18]">3★</span>
                    <div className="flex-1 h-2 rounded-full bg-[#ecf6ed] overflow-hidden">
                      <div className="bg-[#006946] h-full w-0 rounded-full" />
                    </div>
                    <span className="w-7 text-right text-[#6e7a72]">0%</span>
                  </div>
                </div>
              </div>

              {/* Review items */}
              {artisan.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-[#e1ebe1] flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#bfecdc] text-[#006946] flex items-center justify-center font-bold text-xs">
                        {rev.avatarInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#151e18]">{rev.author}</span>
                          <span className="material-symbols-outlined text-[#006946] text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            verified
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6e7a72]">
                          {rev.location} • {rev.date}
                        </span>
                      </div>
                    </div>
                    <div className="flex text-[#ffb955]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#3e4942] leading-relaxed">{rev.comment}</p>

                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006946] bg-[#ecf6ed] px-2.5 py-1 rounded-lg w-fit">
                    <span className="material-symbols-outlined text-[13px]">build</span>
                    <span>Prestation : {rev.serviceTitle}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. Zone couverte */}
          {activeTab === 'zone' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#e1ebe1] flex flex-col gap-3">
              <h3 className="text-sm font-bold text-[#151e18] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006946] text-[20px]">explore</span>
                <span>Périmètre d'action à Douala</span>
              </h3>
              <p className="text-xs text-[#6e7a72] leading-relaxed">
                {artisan.name} intervient avec tout son outillage dans un rayon de {artisan.interventionRadiusKm} km sans frais de déplacement majeurs :
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {artisan.coveredDistricts.map((cd) => (
                  <span
                    key={cd.name}
                    className="bg-[#ecf6ed] text-[#151e18] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 border border-[#dbe5dc]"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#006946]">check_circle</span>
                    <span>{cd.name}</span>
                    {cd.extraFee ? (
                      <span className="text-[10px] text-[#a06800] font-bold">
                        (+ {cd.extraFee.toLocaleString('fr-FR')} F transport)
                      </span>
                    ) : null}
                  </span>
                ))}
              </div>

              {/* Map Preview Graphic */}
              <div
                className="w-full h-44 rounded-xl bg-cover bg-center mt-2 relative overflow-hidden shadow-inner border border-[#e1ebe1]"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDXTyItXiMFD7CwMa1QXYO-f0PO9J9vPQVHfjgH3GehbFUMTc2nuo8xKqROAdc7oShwS4A6vl_aQpUlvgUjR6hSYqrrZb97stuoHO100SWJfPApk4-wSqy8IdLsub8bnylf39cDxyi8V0wYdUUt7Ti9O-DGeLiKrUaTtF7anR9lknc_xBT7JRtgHOD0ZaQyOpkHbFuzO5VDPxXMursMJ-ujNOmiYG3XOvb9LmZjLJbN-XuBgQBj40gqGA')",
                }}
              >
                <div className="absolute inset-0 bg-[#006946]/10 backdrop-brightness-95 flex items-center justify-center">
                  <span className="bg-white/95 px-3 py-1.5 rounded-full text-xs font-bold text-[#006946] flex items-center gap-1.5 shadow-md">
                    <span className="material-symbols-outlined text-[16px] text-[#006946]">pin_drop</span>
                    {artisan.district} &amp; Région Littoral couverte
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Conversion Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#e1ebe1] px-4 py-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#6e7a72]">Tarif indicatif</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-[#3e4942]">Dès</span>
              <span className="text-lg font-extrabold text-[#006946]">
                {artisan.startingPrice.toLocaleString('fr-FR')}
              </span>
              <span className="text-[11px] font-bold text-[#3d665a]">FCFA</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsQuoteModalOpen(true)}
            className="flex-1 h-12 bg-[#006946] hover:bg-[#16845b] text-white rounded-xl font-bold text-sm px-4 flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">request_quote</span>
            <span>Demander un devis</span>
          </button>
        </div>
      </div>

      {/* Interactive Quote Request Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsQuoteModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl z-10 max-h-[88vh] overflow-y-auto no-scrollbar p-5 flex flex-col gap-4 pb-safe">
            <div className="flex items-center justify-between pb-2 border-b border-[#e1ebe1]">
              <div>
                <h3 className="text-base font-bold text-[#151e18]">Demande de devis express</h3>
                <p className="text-xs text-[#006946] font-medium">Artisan : {artisan.name} ({artisan.job})</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#f2fcf2] flex items-center justify-center text-[#3e4942]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleModalQuoteSubmit} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#151e18] mb-1">
                  Quel est votre besoin ?
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full h-11 bg-[#f2fcf2] border border-[#dbe5dc] rounded-xl px-3 text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
                >
                  {artisan.services.map((svc) => (
                    <option key={svc.id} value={svc.title}>
                      {svc.title} ({svc.price.toLocaleString('fr-FR')} FCFA)
                    </option>
                  ))}
                  <option value="Autre prestation sur mesure">Autre prestation sur mesure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151e18] mb-1">
                  Votre quartier à Douala
                </label>
                <input
                  type="text"
                  required
                  value={quoteDistrict}
                  onChange={(e) => setQuoteDistrict(e.target.value)}
                  placeholder="Ex : Akwa, Rue Pau, face hôtel..."
                  className="w-full h-11 bg-[#f2fcf2] border border-[#dbe5dc] rounded-xl px-3 text-sm text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151e18] mb-1">
                  Numéro de téléphone WhatsApp
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs font-bold text-[#6e7a72]">+237</span>
                  <input
                    type="tel"
                    required
                    value={quotePhone}
                    onChange={(e) => setQuotePhone(e.target.value)}
                    placeholder="6XX XXX XXX"
                    className="w-full h-11 pl-14 pr-3 bg-[#f2fcf2] border border-[#dbe5dc] rounded-xl text-sm text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151e18] mb-1">
                  Détails du problème (optionnel)
                </label>
                <textarea
                  rows={2}
                  value={quoteDetails}
                  onChange={(e) => setQuoteDetails(e.target.value)}
                  placeholder="Décrivez les symptômes de la panne..."
                  className="w-full p-3 bg-[#f2fcf2] border border-[#dbe5dc] rounded-xl text-sm text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946] resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#006946] hover:bg-[#16845b] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                      <span>Transmission en cours...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">send</span>
                      <span>Envoyer la demande gratuitement</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-[#6e7a72] mt-2">
                  Réponse garantie sous 15 minutes sur WhatsApp.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
