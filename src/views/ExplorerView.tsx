import React, { useState, useMemo } from 'react';
import { ARTISANS, DOUALA_DISTRICTS, Artisan } from '../data/mockData';

interface ExplorerViewProps {
  initialQuery?: string;
  initialDistrict?: string;
  onNavigate: (tab: string, artisanId?: string) => void;
  onToggleFavorite: (artisanId: string) => void;
  favorites: Set<string>;
  onStartQuote: (artisan?: Artisan) => void;
  onShowToast: (msg: string) => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  initialQuery = '',
  initialDistrict = '',
  onNavigate,
  onToggleFavorite,
  favorites,
  onStartQuote,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(
    initialDistrict ? [initialDistrict] : ['Akwa', 'Bonapriso']
  );
  const [openNowOnly, setOpenNowOnly] = useState(true);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [maxBudget, setMaxBudget] = useState(30000);
  const [minRating, setMinRating] = useState(4.5);
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price'>('rating');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  // Quick Direct Devis Sheet state
  const [bookingArtisan, setBookingArtisan] = useState<Artisan | null>(null);
  const [quickAddress, setQuickAddress] = useState('Akwa, Douala');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickPhone, setQuickPhone] = useState('699452180');
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);

  // Filter computation
  const filteredArtisans = useMemo(() => {
    return ARTISANS.filter((artisan) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          artisan.name.toLowerCase().includes(q) ||
          artisan.job.toLowerCase().includes(q) ||
          artisan.category.toLowerCase().includes(q) ||
          artisan.district.toLowerCase().includes(q) ||
          artisan.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // District filter (if any selected)
      if (selectedDistricts.length > 0) {
        const matchesDistrict = selectedDistricts.some((d) =>
          artisan.district.toLowerCase().includes(d.toLowerCase())
        );
        if (!matchesDistrict) return false;
      }

      // Open now
      if (openNowOnly && !artisan.availableToday) return false;

      // Verified
      if (verifiedOnly && !artisan.cniVerified) return false;

      // Budget
      if (artisan.startingPrice > maxBudget) return false;

      // Rating
      if (artisan.rating < minRating) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'price') return a.startingPrice - b.startingPrice;
      return 0;
    });
  }, [searchQuery, selectedDistricts, openNowOnly, verifiedOnly, maxBudget, minRating, sortBy]);

  const activeFiltersCount =
    (selectedDistricts.length > 0 ? 1 : 0) +
    (openNowOnly ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (maxBudget < 50000 ? 1 : 0) +
    (minRating > 4.0 ? 1 : 0);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDesc.trim()) return;
    setIsSubmittingQuick(true);
    setTimeout(() => {
      setIsSubmittingQuick(false);
      onShowToast(`Votre demande de devis express a été envoyée à ${bookingArtisan?.name} !`);
      setBookingArtisan(null);
      setQuickDesc('');
    }, 600);
  };

  const handleResetFilters = () => {
    setSelectedDistricts([]);
    setOpenNowOnly(false);
    setVerifiedOnly(false);
    setMaxBudget(50000);
    setMinRating(4.0);
    onShowToast('Filtres réinitialisés');
  };

  return (
    <div className="flex flex-col w-full pb-20">
      {/* 1. Sticky Search & Filter Control Deck */}
      <section className="sticky top-16 z-30 bg-[#f2fcf2]/95 backdrop-blur-md px-4 pt-2.5 pb-3 border-b border-[#e1ebe1] shadow-xs">
        <div className="max-w-4xl mx-auto w-full space-y-2.5">
          {/* Search Input Bar */}
          <div className="relative w-full flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#006946]">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Métier, service, artisan (ex: Plomberie, Talla)..."
              className="w-full h-11 pl-10 pr-24 bg-white text-[#151e18] text-sm rounded-xl shadow-xs border border-[#dbe5dc] focus:outline-none focus:ring-2 focus:ring-[#006946]/40 placeholder:text-[#6e7a72] transition-all"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Effacer la recherche"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#6e7a72] hover:text-[#151e18] hover:bg-[#ecf6ed]"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsFiltersModalOpen(true)}
                className="relative h-8 px-2.5 rounded-lg bg-[#bfecdc] text-[#006946] font-bold text-xs flex items-center gap-1 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#006946] text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Horizontal Tag Rail */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {/* Pill: Quartier */}
            {selectedDistricts.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedDistricts([])}
                className="shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-[#006946] text-white text-xs font-semibold shadow-xs"
              >
                <span className="material-symbols-outlined text-[13px]">location_on</span>
                <span>{selectedDistricts.join(', ')}</span>
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            )}

            {/* Pill: Ouvert */}
            <button
              type="button"
              onClick={() => setOpenNowOnly(!openNowOnly)}
              className={`shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-xs font-semibold shadow-xs transition-all ${
                openNowOnly
                  ? 'bg-[#006946] text-white'
                  : 'bg-white text-[#3e4942] border border-[#dbe5dc] hover:bg-[#ecf6ed]'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">bolt</span>
              <span>Dispo aujourd'hui</span>
              {openNowOnly && <span className="material-symbols-outlined text-[13px]">close</span>}
            </button>

            {/* Pill: Vérifié */}
            <button
              type="button"
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-xs font-semibold shadow-xs transition-all ${
                verifiedOnly
                  ? 'bg-[#006946] text-white'
                  : 'bg-white text-[#3e4942] border border-[#dbe5dc] hover:bg-[#ecf6ed]'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span>Profil Vérifié</span>
              {verifiedOnly && <span className="material-symbols-outlined text-[13px]">close</span>}
            </button>

            {/* Pill: Budget */}
            <button
              type="button"
              onClick={() => setIsFiltersModalOpen(true)}
              className="shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-white text-[#3e4942] border border-[#dbe5dc] hover:bg-[#ecf6ed] text-xs font-semibold shadow-xs"
            >
              <span className="material-symbols-outlined text-[13px]">payments</span>
              <span>&le; {maxBudget.toLocaleString('fr-FR')} FCFA</span>
            </button>

            {/* Pill: Note */}
            <button
              type="button"
              onClick={() => setIsFiltersModalOpen(true)}
              className="shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-white text-[#3e4942] border border-[#dbe5dc] hover:bg-[#ecf6ed] text-xs font-semibold shadow-xs"
            >
              <span className="material-symbols-outlined text-[13px] text-[#ffb955]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span>{minRating}+ ★</span>
            </button>
          </div>

          {/* Counters and Sort Row */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#006946] animate-pulse" />
              <p className="text-xs text-[#3e4942]">
                <strong className="font-bold text-[#151e18]">{filteredArtisans.length} artisans vérifiés</strong> à Douala
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1 text-[#151e18] text-xs font-semibold bg-[#ecf6ed] px-2.5 py-1 rounded-lg hover:bg-[#e1ebe1]"
              >
                <span className="text-[#6e7a72]">Tri:</span>
                <span className="text-[#006946]">
                  {sortBy === 'rating' ? 'Les mieux notés' : sortBy === 'distance' ? 'Plus proche' : 'Tarif croissant'}
                </span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl py-1 border border-[#e1ebe1] z-40">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('rating');
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-[#ecf6ed] ${
                      sortBy === 'rating' ? 'text-[#006946] bg-[#ecf6ed]/50' : 'text-[#151e18]'
                    }`}
                  >
                    <span>Les mieux notés</span>
                    {sortBy === 'rating' && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('distance');
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-[#ecf6ed] ${
                      sortBy === 'distance' ? 'text-[#006946] bg-[#ecf6ed]/50' : 'text-[#151e18]'
                    }`}
                  >
                    <span>Plus proche (km)</span>
                    {sortBy === 'distance' && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('price');
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-[#ecf6ed] ${
                      sortBy === 'price' ? 'text-[#006946] bg-[#ecf6ed]/50' : 'text-[#151e18]'
                    }`}
                  >
                    <span>Tarif croissant</span>
                    {sortBy === 'price' && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Feed: Artisan Cards */}
      <section className="px-4 pt-4 max-w-4xl mx-auto w-full space-y-3.5">
        {filteredArtisans.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#e1ebe1] my-4 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#ecf6ed] text-[#006946] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[28px]">search_off</span>
            </div>
            <h3 className="text-base font-bold text-[#151e18]">Aucun artisan ne correspond à ces critères</h3>
            <p className="text-xs text-[#6e7a72] max-w-xs mt-1 mb-4">
              Essayez d'élargir vos filtres de quartier ou d'augmenter le budget maximum.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-[#006946] text-white text-xs font-bold"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        ) : (
          filteredArtisans.map((artisan) => {
            const isFav = favorites.has(artisan.id);
            return (
              <article
                key={artisan.id}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#e1ebe1] hover:border-[#006946]/40 hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Top Row: Photo + Identity + Favorite */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                    onClick={() => onNavigate('artisan', artisan.id)}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={artisan.avatar}
                        alt={artisan.name}
                        className="w-14 h-14 rounded-2xl object-cover bg-[#ecf6ed]"
                      />
                      <span
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#006946] text-white flex items-center justify-center shadow-xs"
                        title="Artisan Certifié CNI + Récépissé"
                      >
                        <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="text-base font-bold text-[#151e18] truncate hover:text-[#006946]">
                          {artisan.name}
                        </h2>
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#bfecdc] text-[#006946] text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            verified_user
                          </span>
                          <span>Certifié CNI</span>
                        </span>
                      </div>
                      <p className="text-xs text-[#3d665a] font-medium truncate mt-0.5">{artisan.job}</p>
                      <div className="flex items-center gap-1.5 text-xs text-[#6e7a72] mt-0.5">
                        <span className="material-symbols-outlined text-[14px] text-[#a06800]">location_on</span>
                        <span className="truncate">{artisan.district}, Douala</span>
                        <span>•</span>
                        <span className="text-[#006946] font-semibold">{artisan.distanceKm} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Favorite Button */}
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(artisan.id)}
                    aria-label="Ajouter aux favoris"
                    className="w-9 h-9 rounded-full bg-[#f2fcf2] flex items-center justify-center text-[#6e7a72] hover:text-[#ba1a1a] active:scale-90 transition-transform shrink-0"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isFav ? 'text-[#ba1a1a]' : 'text-[#6e7a72]'
                      }`}
                      style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>

                {/* Rating & Availability Capsule */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#ecf6ed] mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#ffb955]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span className="text-sm font-bold text-[#151e18]">{artisan.rating}</span>
                    <span className="text-xs text-[#6e7a72]">({artisan.reviewsCount} avis certifiés)</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#006946] text-xs font-semibold bg-white px-2 py-0.5 rounded-full shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006946] animate-ping" />
                    <span>{artisan.availableToday ? 'Dispo cet après-midi' : `Répond en ${artisan.responseTime}`}</span>
                  </div>
                </div>

                {/* Services & Skill Badges */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {artisan.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.8 rounded-lg bg-[#f2fcf2] text-[11px] font-medium text-[#3e4942] border border-[#dbe5dc]"
                    >
                      {skill}
                    </span>
                  ))}
                  <span className="px-2 py-0.8 rounded-lg bg-[#ffddb4]/60 text-[11px] font-bold text-[#7f5200]">
                    Garantie {artisan.guaranteeDays}j Mboa
                  </span>
                </div>

                {/* Pricing Bar */}
                <div className="flex items-baseline justify-between pt-1 pb-2 border-t border-[#e1ebe1]/60">
                  <div>
                    <span className="text-[11px] text-[#6e7a72] block">Intervention &amp; Dépannage dès</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-extrabold text-[#006946]">
                        {artisan.startingPrice.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-xs font-bold text-[#3d665a]">FCFA</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#006946] bg-[#bfecdc]/60 px-2 py-1 rounded-lg">
                    Devis gratuit
                  </span>
                </div>

                {/* Action Buttons Pair */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <a
                    href={`https://wa.me/${artisan.whatsapp}?text=Bonjour%20${encodeURIComponent(
                      artisan.name
                    )},%20je%20vous%20contacte%20depuis%20MboaFacile`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 px-3 rounded-xl bg-[#ecf6ed] hover:bg-[#e1ebe1] text-[#151e18] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#006946]">chat</span>
                    <span>WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setBookingArtisan(artisan)}
                    className="h-11 px-3 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                    <span>Devis direct</span>
                  </button>
                </div>
              </article>
            );
          })
        )}

        {/* Reassurance Banner */}
        <div className="p-4 rounded-2xl bg-[#bfecdc]/40 border border-[#bfecdc] flex items-start gap-3 mt-4">
          <div className="w-10 h-10 rounded-full bg-[#bfecdc] text-[#006946] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">shield_with_heart</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#006946]">Garantie Intervention MboaFacile</h3>
            <p className="text-xs text-[#3e4942] mt-0.5 leading-relaxed">
              Tous nos professionnels à Douala font l’objet d’une vérification d’identité physique et d’un contrôle d’antécédents. Paiement protégé jusqu'à la fin de prestation.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Interactive Slide-Up Filters Drawer / Bottom Sheet Modal */}
      {isFiltersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFiltersModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl z-10 max-h-[85vh] flex flex-col pb-safe">
            {/* Handle & Header */}
            <div className="p-4 pb-2 flex items-center justify-between border-b border-[#e1ebe1]">
              <div className="flex flex-col">
                <div className="w-10 h-1 bg-[#dbe5dc] rounded-full mx-auto mb-2 self-center" />
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#151e18]">Filtrer les résultats</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#bfecdc] text-[#006946] text-xs font-bold">
                    {activeFiltersCount} actifs
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFiltersModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#f2fcf2] flex items-center justify-center text-[#3e4942] hover:bg-[#e6f1e7]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
              {/* 1. Quartiers Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#151e18]">Quartiers de Douala</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedDistricts.length === DOUALA_DISTRICTS.length) {
                        setSelectedDistricts([]);
                      } else {
                        setSelectedDistricts([...DOUALA_DISTRICTS]);
                      }
                    }}
                    className="text-xs text-[#006946] font-semibold hover:underline"
                  >
                    {selectedDistricts.length === DOUALA_DISTRICTS.length ? 'Tout décocher' : 'Tout cocher'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {DOUALA_DISTRICTS.map((d) => {
                    const isChecked = selectedDistricts.includes(d);
                    return (
                      <label
                        key={d}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors border ${
                          isChecked
                            ? 'bg-[#bfecdc]/50 text-[#006946] border-[#006946]/30'
                            : 'bg-[#f2fcf2] text-[#151e18] border-transparent hover:bg-[#e6f1e7]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDistricts([...selectedDistricts, d]);
                            } else {
                              setSelectedDistricts(selectedDistricts.filter((item) => item !== d));
                            }
                          }}
                          className="w-4 h-4 rounded text-[#006946] accent-[#006946]"
                        />
                        <span className="truncate">{d}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. Budget Range Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[#151e18]" htmlFor="budgetSlider">
                    Budget maximum
                  </label>
                  <span className="text-sm font-extrabold text-[#006946]">
                    {maxBudget.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <input
                  id="budgetSlider"
                  type="range"
                  min="3000"
                  max="50000"
                  step="1000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full h-2 bg-[#dbe5dc] rounded-lg appearance-none cursor-pointer accent-[#006946]"
                />
                <div className="flex justify-between text-[11px] text-[#6e7a72]">
                  <span>3 000 FCFA</span>
                  <span>25 000 FCFA</span>
                  <span>50 000 FCFA</span>
                </div>
              </div>

              {/* 3. Note minimale */}
              <div className="space-y-2">
                <span className="text-sm font-bold text-[#151e18]">Note minimale des clients</span>
                <div className="grid grid-cols-3 gap-2">
                  {[4.0, 4.5, 4.8].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setMinRating(score)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        minRating === score
                          ? 'bg-[#006946] text-white border-[#006946]'
                          : 'bg-[#f2fcf2] text-[#3e4942] border-[#dbe5dc] hover:bg-[#e6f1e7]'
                      }`}
                    >
                      {score}+ ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-white border-t border-[#e1ebe1] shadow-lg flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-11 px-4 rounded-xl bg-[#ecf6ed] text-[#3e4942] font-semibold text-xs hover:bg-[#e1ebe1]"
              >
                Réinitialiser
              </button>
              <button
                type="button"
                onClick={() => setIsFiltersModalOpen(false)}
                className="flex-1 h-11 px-4 rounded-xl bg-[#006946] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <span>Afficher {filteredArtisans.length} résultats</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Quick Devis Direct Mobile Sheet */}
      {bookingArtisan && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setBookingArtisan(null)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl z-10 max-h-[85vh] flex flex-col pb-safe">
            <div className="p-4 pb-2 flex items-center justify-between border-b border-[#e1ebe1]">
              <div className="flex items-center gap-3">
                <img
                  src={bookingArtisan.avatar}
                  alt={bookingArtisan.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-[#151e18]">Devis direct avec {bookingArtisan.name}</h3>
                  <p className="text-xs text-[#006946] font-medium">
                    {bookingArtisan.job} • Réponse express &lt; 15 min
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBookingArtisan(null)}
                className="w-9 h-9 rounded-full bg-[#f2fcf2] flex items-center justify-center text-[#3e4942]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleQuickSubmit} className="p-4 space-y-3.5 overflow-y-auto no-scrollbar">
              <div>
                <label className="block text-xs font-bold text-[#151e18] mb-1">
                  Votre quartier à Douala
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-[#6e7a72]">
                    location_on
                  </span>
                  <input
                    type="text"
                    required
                    value={quickAddress}
                    onChange={(e) => setQuickAddress(e.target.value)}
                    placeholder="Ex: Akwa, Rue Pau, derrière la pharmacie"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#f2fcf2] text-sm text-[#151e18] border border-[#dbe5dc] focus:outline-none focus:ring-2 focus:ring-[#006946]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151e18] mb-1">
                  Description rapide du problème
                </label>
                <textarea
                  required
                  rows={3}
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  placeholder="Ex : Disjoncteur principal qui saute dès que j'allume le split..."
                  className="w-full p-3 rounded-xl bg-[#f2fcf2] text-sm text-[#151e18] border border-[#dbe5dc] focus:outline-none focus:ring-2 focus:ring-[#006946] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151e18] mb-1">
                  Numéro Téléphone / WhatsApp
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs font-bold text-[#6e7a72]">+237</span>
                  <input
                    type="tel"
                    required
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    placeholder="6XX XXX XXX"
                    className="w-full h-11 pl-14 pr-3 rounded-xl bg-[#f2fcf2] text-sm text-[#151e18] border border-[#dbe5dc] focus:outline-none focus:ring-2 focus:ring-[#006946]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingQuick}
                  className="w-full h-12 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  {isSubmittingQuick ? (
                    <>
                      <span className="inline-block animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">send</span>
                      <span>Envoyer la demande gratuitement</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-[#6e7a72] mt-2">
                  Zéro engagement financier • Réponse garantie sous 15 min.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
