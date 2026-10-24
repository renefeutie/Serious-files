import React, { useState } from 'react';
import { ARTISANS, CATEGORIES, DOUALA_DISTRICTS, Artisan } from '../data/mockData';

interface HomeViewProps {
  onNavigate: (tab: string, artisanId?: string) => void;
  onOpenCitySelector: () => void;
  currentDistrict: string;
  currentCity: string;
  onOpenProModal: () => void;
  onToggleFavorite: (artisanId: string) => void;
  favorites: Set<string>;
  onStartQuote: (artisan?: Artisan, categoryId?: string, urgency?: string) => void;
  onSearch: (query: string, district?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenCitySelector,
  currentDistrict,
  currentCity,
  onOpenProModal,
  onToggleFavorite,
  favorites,
  onStartQuote,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(currentDistrict);
  const [expandedCategories, setExpandedCategories] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const displayedCategories = expandedCategories ? CATEGORIES : CATEGORIES.slice(0, 6);
  const featuredArtisans = ARTISANS.slice(0, 3);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, selectedDistrict);
    onNavigate('explorer');
  };

  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    onSearch(tag, selectedDistrict);
    onNavigate('explorer');
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* 1. Hero Section */}
      <section className="px-4 pt-4 pb-6 max-w-4xl mx-auto w-full flex flex-col gap-4">
        {/* Reassurance pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#bfecdc] text-[#006946] w-fit shadow-xs">
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            workspace_premium
          </span>
          <span className="text-xs font-bold tracking-wide">
            N°1 des services de proximité au Cameroun
          </span>
        </div>

        {/* Hero Title & Value Proposition */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#151e18] tracking-tight leading-tight">
            Le bon professionnel,{' '}
            <span className="text-[#006946] underline decoration-[#ffb955] decoration-wavy decoration-2">
              sans perdre
            </span>{' '}
            votre temps.
          </h1>
          <p className="text-sm sm:text-base text-[#3e4942] leading-relaxed max-w-2xl">
            Trouvez des artisans et prestataires vérifiés à Douala et Yaoundé, comparez les tarifs en FCFA et recevez votre devis sans frais.
          </p>
        </div>

        {/* Quick Search Widget Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-[#e1ebe1] flex flex-col gap-3">
          <form onSubmit={handleHeroSubmit} className="flex flex-col gap-3">
            {/* Search Input */}
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-[#ecf6ed] text-[#151e18] focus-within:ring-2 focus-within:ring-[#006946] transition-all">
              <span className="material-symbols-outlined text-[22px] text-[#006946]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quel service recherchez-vous ? (ex: Plombier, Clim, Serrure)"
                className="bg-transparent border-0 outline-none w-full text-sm font-medium text-[#151e18] placeholder:text-[#6e7a72]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[#6e7a72] hover:text-[#151e18]"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </button>
              )}
            </div>

            {/* City & District Selectors Row */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onOpenCitySelector}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#ecf6ed] text-[#3e4942] text-xs font-semibold hover:bg-[#e1ebe1] text-left"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="material-symbols-outlined text-[18px] text-[#006946]">location_city</span>
                  <span className="truncate">{currentCity}</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#6e7a72]">swap_horiz</span>
              </button>

              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full h-full px-3.5 py-2.5 rounded-xl bg-[#ecf6ed] text-xs font-semibold text-[#151e18] outline-none appearance-none cursor-pointer pr-8 hover:bg-[#e1ebe1]"
                >
                  {DOUALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      Quartier : {d}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-[18px] text-[#3e4942] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">manage_search</span>
              <span>Trouver un professionnel</span>
            </button>
          </form>

          {/* Instant Suggestions Badges */}
          <div className="pt-1 flex flex-col gap-1.5">
            <span className="text-xs text-[#6e7a72] font-medium">Recherches fréquentes à Douala :</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {['Plombier', 'Électricien', 'Clim & Froid', 'Réparateur smartphone', 'Menuisier', 'Nettoyage'].map(
                (term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleQuickTagClick(term)}
                    className="px-3 py-1 rounded-full bg-[#ecf6ed] text-[#3e4942] text-xs font-semibold whitespace-nowrap hover:bg-[#bfecdc] hover:text-[#006946] transition-colors"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Catégories Populaires */}
      <section className="px-4 py-4 max-w-4xl mx-auto w-full flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#151e18]">Catégories Populaires</h2>
            <p className="text-xs text-[#6e7a72]">Des spécialistes vérifiés dans vos quartiers</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#bfecdc] text-[#006946] text-xs font-bold">
            {CATEGORIES.length} Métiers
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {displayedCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                onSearch('', currentDistrict);
                onNavigate('explorer');
              }}
              className="bg-white p-3 rounded-2xl flex items-center gap-3 shadow-xs border border-[#e1ebe1] hover:border-[#006946]/40 hover:shadow-sm text-left transition-all active:scale-98"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: cat.bgLight, color: cat.accentColor }}
              >
                <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-bold text-[#151e18] truncate">{cat.name}</span>
                <span className="text-[11px] text-[#6e7a72]">{cat.prosCount} pros certifiés</span>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setExpandedCategories(!expandedCategories)}
          className="w-full h-11 rounded-xl bg-[#ecf6ed] text-[#3e4942] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#e1ebe1] transition-colors"
        >
          <span>{expandedCategories ? 'Réduire la liste' : `Voir les ${CATEGORIES.length} catégories`}</span>
          <span className="material-symbols-outlined text-[18px]">
            {expandedCategories ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </section>

      {/* 3. Trouver par besoin immédiat */}
      <section className="px-4 py-4 max-w-4xl mx-auto w-full flex flex-col gap-3">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-[#151e18]">Votre besoin du moment</h2>
          <p className="text-xs text-[#6e7a72]">Accédez à une solution adaptée à votre situation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Urgence */}
          <div
            onClick={() => onStartQuote(undefined, 'plomberie', 'urgent')}
            className="p-4 rounded-2xl bg-white border border-[#ffdad6] shadow-xs flex items-start gap-3.5 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">emergency</span>
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#151e18]">Panne urgente</span>
                <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold">
                  &lt; 2h à Douala
                </span>
              </div>
              <p className="text-xs text-[#6e7a72]">
                Fuite d'eau, court-circuit, serrure coincée : intervention immédiate prioritaire.
              </p>
              <div className="mt-1 text-xs font-bold text-[#006946] flex items-center gap-1 group-hover:underline">
                <span>Dépannage express</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
            </div>
          </div>

          {/* Réparation Domicile */}
          <div
            onClick={() => onStartQuote(undefined, 'electricite', '48h')}
            className="p-4 rounded-2xl bg-white border border-[#e1ebe1] shadow-xs flex items-start gap-3.5 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#bfecdc] text-[#006946] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">home_repair_service</span>
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#151e18]">Réparation à domicile</span>
                <span className="px-2 py-0.5 rounded-full bg-[#ecf6ed] text-[#3e4942] text-[10px] font-bold">
                  Devis sans frais
                </span>
              </div>
              <p className="text-xs text-[#6e7a72]">
                Climatiseur, frigo, robinetterie avec diagnostic clair et prix fixé à l'avance.
              </p>
              <div className="mt-1 text-xs font-bold text-[#006946] flex items-center gap-1 group-hover:underline">
                <span>Demander une intervention</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
            </div>
          </div>

          {/* Entreprise & Commerce */}
          <div
            onClick={() => onStartQuote(undefined, 'froid', 'semaine')}
            className="p-4 rounded-2xl bg-white border border-[#e1ebe1] shadow-xs flex items-start gap-3.5 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#ffddb4] text-[#7f5200] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">storefront</span>
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#151e18]">Pour mon commerce</span>
                <span className="px-2 py-0.5 rounded-full bg-[#ecf6ed] text-[#3e4942] text-[10px] font-bold">
                  Facture Pro
                </span>
              </div>
              <p className="text-xs text-[#6e7a72]">
                Boutiques, restaurants, bureaux : contrats d'entretien et maintenances sur mesure.
              </p>
              <div className="mt-1 text-xs font-bold text-[#006946] flex items-center gap-1 group-hover:underline">
                <span>Solutions Entreprises</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
            </div>
          </div>

          {/* Grands travaux */}
          <div
            onClick={() => onStartQuote(undefined, 'menuiserie', 'flexible')}
            className="p-4 rounded-2xl bg-white border border-[#e1ebe1] shadow-xs flex items-start gap-3.5 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#ecf6ed] text-[#3e4942] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">architecture</span>
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#151e18]">Chantiers &amp; Travaux</span>
                <span className="px-2 py-0.5 rounded-full bg-[#ecf6ed] text-[#3e4942] text-[10px] font-bold">
                  Planification
                </span>
              </div>
              <p className="text-xs text-[#6e7a72]">
                Rénovation complète, pose aluminium, carrelage et peinture intérieure.
              </p>
              <div className="mt-1 text-xs font-bold text-[#006946] flex items-center gap-1 group-hover:underline">
                <span>Planifier mon devis</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Artisans certifiés à la une */}
      <section className="px-4 py-4 max-w-4xl mx-auto w-full flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#151e18]">Artisans certifiés à la une</h2>
            <p className="text-xs text-[#6e7a72]">Contrôlés à Douala : CNI &amp; compétences</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('explorer')}
            className="text-xs font-bold text-[#006946] flex items-center gap-0.5 hover:underline"
          >
            <span>Voir tous</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {featuredArtisans.map((artisan) => {
            const isFav = favorites.has(artisan.id);
            return (
              <div
                key={artisan.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-[#e1ebe1] hover:border-[#006946]/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Avatar + Identity + Fav */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => onNavigate('artisan', artisan.id)}
                    >
                      <div className="relative w-13 h-13 rounded-2xl overflow-hidden bg-[#ecf6ed] shrink-0">
                        <img
                          src={artisan.avatar}
                          alt={artisan.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#006946] text-white flex items-center justify-center text-[10px]">
                          <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="font-bold text-sm text-[#151e18] truncate hover:text-[#006946]">
                          {artisan.name}
                        </h3>
                        <p className="text-xs text-[#3d665a] font-medium truncate">{artisan.job}</p>
                        <span className="text-[11px] text-[#6e7a72] flex items-center gap-0.5 mt-0.5">
                          <span className="material-symbols-outlined text-[13px] text-[#a06800]">location_on</span>
                          {artisan.district}, Douala
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleFavorite(artisan.id)}
                      aria-label="Favori"
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[#6e7a72] hover:text-[#ba1a1a] active:scale-90 transition-transform"
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

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#bfecdc] text-[#006946] text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      Profil Vérifié CNI
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ecf6ed] text-[#3e4942] text-[11px]">
                      Réponse {artisan.responseTime}
                    </span>
                  </div>

                  {/* Rating & Starting Price */}
                  <div className="flex items-center justify-between pt-3 mt-1 border-t border-[#e1ebe1]/60">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-[#ffb955]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="text-xs font-bold text-[#151e18]">{artisan.rating}</span>
                      <span className="text-[11px] text-[#6e7a72]">({artisan.reviewsCount} avis)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#6e7a72]">Tarif : </span>
                      <span className="text-xs font-bold text-[#006946]">{artisan.startingPriceLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-3 mt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('artisan', artisan.id)}
                    className="h-10 px-2 rounded-xl bg-[#ecf6ed] text-[#151e18] font-bold text-xs hover:bg-[#e1ebe1] transition-colors"
                  >
                    Voir profil
                  </button>
                  <button
                    type="button"
                    onClick={() => onStartQuote(artisan)}
                    className="h-10 px-2 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>Devis direct</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Comment ça marche */}
      <section className="px-4 py-8 max-w-4xl mx-auto w-full my-2 bg-[#ecf6ed] rounded-3xl flex flex-col gap-4">
        <div className="flex flex-col text-center items-center">
          <span className="px-3 py-1 rounded-full bg-white text-[#006946] text-xs font-bold shadow-xs">
            Simple &amp; Garanti
          </span>
          <h2 className="text-xl font-extrabold text-[#151e18] mt-1.5">Comment ça marche ?</h2>
          <p className="text-xs text-[#3e4942] max-w-xs">
            Votre solution en 4 étapes fluides, sans tracasseries ni frais cachés.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {[
            {
              step: '1',
              title: 'Recherchez votre besoin',
              desc: 'Précisez le métier (clim, plomberie, serrure) et votre quartier exact.',
            },
            {
              step: '2',
              title: 'Comparez les profils certifiés',
              desc: 'Consultez leurs réalisations, tarifs indicatifs en FCFA et avis authentiques.',
            },
            {
              step: '3',
              title: 'Demandez un devis sans frais',
              desc: 'Recevez une estimation claire en moins de 15 minutes sur WhatsApp ou l’appli.',
            },
            {
              step: '4',
              title: 'Réglez après satisfaction',
              desc: 'L’artisan intervient chez vous. Vous payez (Cash ou Mobile Money) une fois validé.',
            },
          ].map((item) => (
            <div key={item.step} className="p-4 rounded-2xl bg-white shadow-xs flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-[#006946] text-white font-bold text-sm flex items-center justify-center">
                {item.step}
              </div>
              <h3 className="text-sm font-bold text-[#151e18]">{item.title}</h3>
              <p className="text-xs text-[#6e7a72] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Sécurité & Transparence */}
      <section className="px-4 py-4 max-w-4xl mx-auto w-full flex flex-col gap-3">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-[#151e18]">Sécurité &amp; Transparence locale</h2>
          <p className="text-xs text-[#6e7a72]">Finies les mauvaises surprises et les chantiers inachevés</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white shadow-xs border border-[#e1ebe1] flex flex-col gap-1">
            <div className="w-9 h-9 rounded-xl bg-[#bfecdc] text-[#006946] flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <span className="text-xs font-bold text-[#151e18]">CNI &amp; Références</span>
            <span className="text-[11px] text-[#6e7a72]">Identité et atelier vérifiés physiquement.</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white shadow-xs border border-[#e1ebe1] flex flex-col gap-1">
            <div className="w-9 h-9 rounded-xl bg-[#bfecdc] text-[#006946] flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[20px]">rate_review</span>
            </div>
            <span className="text-xs font-bold text-[#151e18]">Avis 100% Réels</span>
            <span className="text-[11px] text-[#6e7a72]">Seuls les clients ayant fait appel au pro notent.</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white shadow-xs border border-[#e1ebe1] flex flex-col gap-1">
            <div className="w-9 h-9 rounded-xl bg-[#bfecdc] text-[#006946] flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
            <span className="text-xs font-bold text-[#151e18]">Tarifs Clairs en FCFA</span>
            <span className="text-[11px] text-[#6e7a72]">Fourchettes annoncées avant le moindre travail.</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white shadow-xs border border-[#e1ebe1] flex flex-col gap-1">
            <div className="w-9 h-9 rounded-xl bg-[#bfecdc] text-[#006946] flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[20px]">handshake</span>
            </div>
            <span className="text-xs font-bold text-[#151e18]">Paiement Garanti</span>
            <span className="text-[11px] text-[#6e7a72]">Zéro avance suspecte demandée sans contrat.</span>
          </div>
        </div>
      </section>

      {/* 7. Bannière Devenir Prestataire */}
      <section className="px-4 py-4 max-w-4xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-br from-[#7f5200] to-[#a06800] text-white p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffddb4] text-[#7f5200] text-[10px] font-bold">
                Espace Artisans
              </span>
              <span className="text-xs text-white/90">Douala &amp; Yaoundé</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
              Vous êtes artisan qualifié ? Développez votre clientèle.
            </h3>
            <p className="text-xs text-white/90 max-w-md">
              Rejoignez MboaFacile et recevez des demandes de devis qualifiées chaque jour dans votre quartier.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenProModal}
            className="w-full sm:w-auto px-6 h-11 rounded-xl bg-white text-[#7f5200] font-bold text-xs flex items-center justify-center gap-2 shadow-sm shrink-0 active:scale-98 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">engineering</span>
            <span>Créer mon profil Pro</span>
          </button>
        </div>
      </section>

      {/* 8. FAQ Interactive (Accordions) */}
      <section className="px-4 py-4 max-w-4xl mx-auto w-full flex flex-col gap-3">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-[#151e18]">Questions Fréquentes</h2>
          <p className="text-xs text-[#6e7a72]">Tout comprendre sur le fonctionnement de MboaFacile</p>
        </div>

        <div className="flex flex-col gap-2">
          {[
            {
              q: 'La demande de devis est-elle vraiment gratuite ?',
              a: 'Oui, à 100%. Vous pouvez contacter jusqu’à 3 artisans pour un même projet, comparer leurs propositions et vous décider sans aucun engagement financier.',
            },
            {
              q: 'Comment vérifiez-vous les artisans sur le terrain ?',
              a: 'Chaque professionnel doit fournir sa Carte Nationale d’Identité (CNI), un justificatif de domicile ou localisation de son atelier à Douala ou Yaoundé, ainsi que les contacts de clients précédents pour attester de son sérieux.',
            },
            {
              q: 'Comment se déroule le paiement de la prestation ?',
              a: 'Le règlement s’effectue directement avec l’artisan (en espèces, Orange Money ou MTN Mobile Money) une fois le dépannage ou les travaux terminés et validés par vos soins.',
            },
            {
              q: 'Que se passe-t-il en cas de problème ou malfaçon ?',
              a: 'Toutes les interventions réalisées via un profil certifié bénéficient de la garantie MboaFacile (30 à 60 jours selon le métier). En cas de litige, notre service client basé à Akwa intervient pour faire corriger le travail sans frais additionnels.',
            },
          ].map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-[#e1ebe1] shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 flex items-center justify-between text-left text-sm font-bold text-[#151e18]"
                >
                  <span className="pr-2">{faq.q}</span>
                  <span
                    className={`material-symbols-outlined text-[#6e7a72] text-[20px] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#006946]' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-[#3e4942] leading-relaxed border-t border-[#f2fcf2] pt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Footer Compact */}
      <footer className="px-4 pt-6 max-w-4xl mx-auto w-full flex flex-col gap-3 text-center items-center border-t border-[#e1ebe1]/60 mt-4">
        <div className="flex items-center gap-1.5 text-[#006946]">
          <span className="material-symbols-outlined text-[20px]">shield</span>
          <span className="font-extrabold text-sm">MboaFacile Cameroun</span>
        </div>
        <p className="text-xs text-[#6e7a72] max-w-xs leading-relaxed">
          Plateforme dédiée aux artisans de confiance à Douala (Akwa, Bonapriso, Bonamoussadi, Makepe...) et Yaoundé.
        </p>
        <div className="flex items-center gap-4 text-[#6e7a72] text-xs font-medium">
          <button type="button" onClick={() => onNavigate('explorer')} className="hover:text-[#006946]">
            Trouver un pro
          </button>
          <span>•</span>
          <button type="button" onClick={onOpenProModal} className="hover:text-[#006946]">
            Devenir Pro
          </button>
          <span>•</span>
          <button type="button" onClick={() => onNavigate('compte')} className="hover:text-[#006946]">
            Assistance 24/7
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-[#006946] bg-[#ecf6ed] px-3.5 py-1.5 rounded-full border border-[#dbe5dc]">
          <span className="material-symbols-outlined text-[15px]">support_agent</span>
          <span>Assistance MboaFacile :</span>
          <a
            href="https://wa.me/237686942622?text=Bonjour%20MboaFacile,%20j'ai%20besoin%20d'aide"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            WhatsApp 686 94 26 22
          </a>
          <span>•</span>
          <a href="tel:+237654475764" className="hover:underline">
            Appel 654 47 57 64
          </a>
        </div>

        <span className="text-[11px] text-[#6e7a72]">
          © 2025 MboaFacile. Tous droits réservés.
        </span>
      </footer>
    </div>
  );
};
