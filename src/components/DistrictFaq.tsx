import React, { useState, useMemo } from 'react';
import { removeAccents } from '../utils/textUtils';

interface FaqItem {
  id: string;
  category: 'quartiers' | 'autour_de_moi' | 'tarifs' | 'securite';
  question: string;
  answer: string;
  tags: string[];
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'quartiers',
    question: 'Comment trouver un artisan dans mon quartier parmi les plus de 140 quartiers de Douala ?',
    answer:
      'Dans la barre de recherche ou dans le modal de filtres, saisissez le nom de votre quartier (ex. Akwa, Bonamoussadi, Logpom, Maképè, etc.). La recherche est insensible aux accents et aux majuscules. Vous pouvez également cliquer sur les suggestions de quartiers populaires pour filtrer instantanément.',
    tags: ['quartier', 'recherche', 'douala', '140', 'accent', 'filtre'],
  },
  {
    id: 'faq-2',
    category: 'autour_de_moi',
    question: 'Comment fonctionne la fonctionnalité « Explorer autour de moi » avec Google Maps ?',
    answer:
      'En cliquant sur le bouton « Autour de moi », vous activez la localisation interactive. Une fenêtre de confirmation explicite vous demande votre accord avant d’accéder à vos coordonnées GPS. Dès validation, la carte centre votre position et affiche à la fois les artisans vérifiés MboaFacile et les commerces/services référencés sur Google Places à proximité.',
    tags: ['autour de moi', 'carte', 'google maps', 'gps', 'géolocalisation', 'proximite'],
  },
  {
    id: 'faq-3',
    category: 'securite',
    question: 'Quelle est la différence entre un artisan certifié MboaFacile et un lieu Google Maps ?',
    answer:
      'Les artisans certifiés MboaFacile (pastille verte) ont fait l’objet d’un contrôle physique d’identité (CNI camerounaise vérifiée), d’un contrôle des compétences et bénéficient de la garantie intervention MboaFacile. Les lieux Google Maps (pastille bleue) sont des points d’intérêt publics utiles au quotidien, mais ne sont ni audités, ni partenaires contractuels de MboaFacile.',
    tags: ['certification', 'garantie', 'cni', 'google maps', 'différence', 'vérification'],
  },
  {
    id: 'faq-4',
    category: 'tarifs',
    question: 'Y a-t-il des frais de déplacement supplémentaires selon le quartier d’intervention ?',
    answer:
      'La plupart des artisans interviennent sans frais additionnels dans leur quartier d’attache et les zones adjacentes (ex. Bonanjo, Akwa, Bonapriso). Pour les quartiers plus éloignés (ex. Bonabéri, PK 14, Yassa), des frais de déplacement transparents (entre 500 et 2 000 FCFA) sont clairement indiqués avant toute validation.',
    tags: ['frais', 'déplacement', 'tarif', 'prix', 'bonabéri', 'akwa', 'fcfa'],
  },
  {
    id: 'faq-5',
    category: 'autour_de_moi',
    question: 'Que faire si je refuse la géolocalisation ou si mon GPS est désactivé ?',
    answer:
      'Aucun problème ! Vous pouvez utiliser l’application sans aucune restriction en sélectionnant manuellement votre quartier dans la liste déroulante ou en choisissant un quartier repère (Akwa, Bonanjo, Makepe, etc.). Vos données de navigation restent privées et ne sont jamais enregistrées sans votre accord.',
    tags: ['refus', 'confidentialité', 'manuel', 'gps', 'rgpd', 'vie privée'],
  },
  {
    id: 'faq-6',
    category: 'quartiers',
    question: 'Les artisans de Douala peuvent-ils aussi intervenir à Yaoundé ou dans les périphéries ?',
    answer:
      'Chaque artisan indique sur son profil son rayon d’action maximal (généralement entre 15 et 30 km). Pour basculer vers Yaoundé ou une autre ville, utilisez le sélecteur de ville situé en haut à droite de l’écran. Les artisans référencés sur cette zone apparaîtront automatiquement.',
    tags: ['yaounde', 'douala', 'rayon', 'distance', 'ville'],
  },
];

export const DistrictFaq: React.FC = () => {
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Text search filter
      if (faqSearch.trim()) {
        const q = removeAccents(faqSearch.trim().toLowerCase());
        const matchQ = removeAccents(item.question.toLowerCase()).includes(q);
        const matchA = removeAccents(item.answer.toLowerCase()).includes(q);
        const matchTags = item.tags.some((t) => removeAccents(t.toLowerCase()).includes(q));
        return matchQ || matchA || matchTags;
      }
      return true;
    });
  }, [faqSearch, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="bg-white rounded-3xl p-5 md:p-7 border border-[#dbe5dc] shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecf6ed] text-[#006946] text-xs font-bold mb-1.5">
            <span className="material-symbols-outlined text-[16px]">help</span>
            <span>Aide & Foire Aux Questions</span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold text-[#151e18]">
            Recherche de Quartiers & Proximité
          </h2>
          <p className="text-xs text-[#6e7a72] mt-0.5">
            Toutes les réponses pour trouver facilement un professionnel près de chez vous à Douala et Yaoundé.
          </p>
        </div>

        {/* Live Search Input inside FAQ */}
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#006946]" aria-hidden="true">
            search
          </span>
          <input
            type="search"
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            placeholder="Filtrer les questions (ex: GPS, tarif, CNI)..."
            className="w-full h-10 pl-9 pr-8 bg-[#f2fcf2] text-xs font-medium text-[#151e18] rounded-xl border border-[#dbe5dc] focus:outline-none focus:ring-2 focus:ring-[#006946]"
          />
          {faqSearch && (
            <button
              type="button"
              onClick={() => setFaqSearch('')}
              className="absolute right-2.5 top-2.5 text-[#6e7a72] hover:text-[#151e18]"
              aria-label="Effacer le filtre FAQ"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'Toutes les questions' },
          { id: 'quartiers', label: 'Quartiers de Douala' },
          { id: 'autour_de_moi', label: 'Autour de moi & Google Maps' },
          { id: 'securite', label: 'Vérification & Sécurité' },
          { id: 'tarifs', label: 'Frais & Déplacements' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#006946] text-white shadow-xs'
                : 'bg-[#f2fcf2] text-[#3e4942] hover:bg-[#e1ebe1] border border-[#dbe5dc]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion Questions List */}
      <div className="divide-y divide-[#e1ebe1] border border-[#e1ebe1] rounded-2xl overflow-hidden">
        {filteredFaqs.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#6e7a72] bg-[#fbfdfb]">
            <span className="material-symbols-outlined text-3xl text-[#006946] mb-1">sentiment_dissatisfied</span>
            <p>Aucune question ne correspond à « {faqSearch} ».</p>
            <button
              type="button"
              onClick={() => {
                setFaqSearch('');
                setSelectedCategory('all');
              }}
              className="mt-2 text-[#006946] font-bold underline"
            >
              Réinitialiser la recherche FAQ
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div key={faq.id} className="bg-white transition-colors">
                <button
                  type="button"
                  onClick={() => toggleExpand(faq.id)}
                  aria-expanded={isExpanded}
                  className="w-full text-left p-4 md:py-4.5 flex items-center justify-between gap-3 hover:bg-[#fbfdfb] transition-colors"
                >
                  <span className="text-xs md:text-sm font-bold text-[#151e18] leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      isExpanded ? 'bg-[#bfecdc] text-[#006946] rotate-180' : 'bg-[#f2fcf2] text-[#6e7a72]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 md:px-5 md:pb-5 text-xs text-[#3e4942] leading-relaxed border-t border-[#f2fcf2] bg-[#fbfdfb]">
                    <p className="pt-2">{faq.answer}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-[#e1ebe1]/60">
                      <span className="text-[10px] uppercase font-bold text-[#6e7a72]">Mots-clés :</span>
                      {faq.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-[#e1ebe1]/50 text-[#3e4942] text-[10px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
