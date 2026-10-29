import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DOUALA_DISTRICTS, YAOUNDE_DISTRICTS, DISTRICT_COORDINATES, CITY_COORDINATES } from '../data/mockData';
import { sanitizeInput, validateCameroonPhone } from '../utils/security';

interface RegisterBusinessViewProps {
  onNavigate: (tab: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const RegisterBusinessView: React.FC<RegisterBusinessViewProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const { user, registerNewBusiness } = useAuth();

  const [name, setName] = useState('');
  const [job, setJob] = useState('');
  const [category, setCategory] = useState('plomberie');
  const [city, setCity] = useState<'Douala' | 'Yaoundé'>('Douala');
  const [district, setDistrict] = useState('Akwa');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [startingPrice, setStartingPrice] = useState(5000);
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const districtsList = city === 'Douala' ? DOUALA_DISTRICTS : YAOUNDE_DISTRICTS;

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#dbe5dc] shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ecf6ed] text-[#006946] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">add_business</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#151e18]">Inscrire mon commerce sur MboaFacile</h2>
          <p className="text-xs sm:text-sm text-[#6e7a72]">
            Veuillez créer un compte commerçant ou vous connecter pour soumettre votre établissement.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('inscription')}
              className="w-full h-11 rounded-2xl bg-[#006946] text-white text-xs font-bold"
            >
              Créer mon compte commerçant
            </button>
            <button
              type="button"
              onClick={() => onNavigate('connexion')}
              className="w-full h-11 rounded-2xl bg-[#f2fcf2] text-[#006946] border border-[#dbe5dc] text-xs font-bold"
            >
              Déjà un compte ? Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = sanitizeInput(name.trim(), 120);
    const cleanJob = sanitizeInput(job.trim(), 120);
    const cleanAddress = sanitizeInput(address.trim(), 200);
    const cleanBio = sanitizeInput(bio.trim(), 1000);

    if (!cleanName || !cleanJob || !phone.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const phoneCheck = validateCameroonPhone(phone);
    if (!phoneCheck.isValid) {
      setError(phoneCheck.error || 'Numéro de téléphone principal invalide.');
      return;
    }

    if (whatsapp.trim()) {
      const waCheck = validateCameroonPhone(whatsapp);
      if (!waCheck.isValid) {
        setError('Numéro WhatsApp invalide.');
        return;
      }
    }

    // Determine default coordinates based on chosen district
    const coords = DISTRICT_COORDINATES[district] || CITY_COORDINATES[city] || CITY_COORDINATES['Douala'];

    setIsLoading(true);
    try {
      await registerNewBusiness({
        name: cleanName,
        job: cleanJob,
        category,
        city,
        district,
        address: cleanAddress || `${district}, ${city}`,
        lat: coords.lat,
        lng: coords.lng,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || undefined,
        bio: cleanBio,
        startingPrice: Number(startingPrice) || 3000,
      });

      onShowToast('Votre fiche a été soumise avec succès ! Elle sera validée sous 24h par notre équipe.', 'success');
      onNavigate('espace-commercant');
    } catch (err: any) {
      console.error('Erreur ajout business:', err);
      setError(err.message || 'Impossible d’enregistrer le commerce pour le moment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dbe5dc] shadow-sm space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onNavigate('espace-commercant')}
            className="text-xs font-bold text-[#006946] hover:underline inline-flex items-center gap-1 mb-2"
          >
            ← Retour à mon espace
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecf6ed] text-[#006946] text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">add_business</span>
            <span>Nouveau Commerce / Atelier</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#151e18]">
            Inscrire mon établissement sur MboaFacile
          </h1>
          <p className="text-xs sm:text-sm text-[#6e7a72]">
            Remplissez les informations de votre fiche. Une fois validée par notre équipe opérationnelle, elle apparaîtra sur la carte interactive et dans le flux de recherche.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="biz-name">
                Nom commercial ou enseigne *
              </label>
              <input
                id="biz-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Talla Électricité Générale"
                className="w-full h-11 px-3.5 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="biz-job">
                Activité principale *
              </label>
              <input
                id="biz-job"
                type="text"
                required
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="Ex: Électricien Bâtiment & Dépannage"
                className="w-full h-11 px-3.5 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="biz-cat">
                Catégorie de service
              </label>
              <select
                id="biz-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-semibold text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              >
                <option value="electricite">Électricité & Dépannage</option>
                <option value="plomberie">Plomberie & Sanitaire</option>
                <option value="froid">Climatisation & Froid</option>
                <option value="menuiserie">Menuiserie & Ebénisterie</option>
                <option value="electronique">Smartphones & PC</option>
                <option value="nettoyage">Nettoyage & Canapés</option>
                <option value="mecanique">Garage & Mécanique Auto</option>
                <option value="beaute">Coiffure & Salons</option>
                <option value="autre">Autre commerce de proximité</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="biz-city">
                Ville
              </label>
              <select
                id="biz-city"
                value={city}
                onChange={(e) => {
                  const c = e.target.value as 'Douala' | 'Yaoundé';
                  setCity(c);
                  setDistrict(c === 'Douala' ? 'Akwa' : 'Bastos');
                }}
                className="w-full h-11 px-3 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-semibold text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              >
                <option value="Douala">Douala</option>
                <option value="Yaoundé">Yaoundé</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="biz-district">
                Quartier d'implantation *
              </label>
              <select
                id="biz-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-semibold text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              >
                {districtsList.map((d: string) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="biz-addr">
              Repère ou adresse précise (ex: Face Total Énergies, Rue Pau)
            </label>
            <input
              id="biz-addr"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Face station Tradex, Rue Pau, Akwa"
              className="w-full h-11 px-3.5 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="biz-phone">
                Téléphone principal *
              </label>
              <input
                id="biz-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="6XX XX XX XX"
                className="w-full h-11 px-3.5 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="biz-wa">
                Numéro WhatsApp
              </label>
              <input
                id="biz-wa"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="237 6XX XX XX XX"
                className="w-full h-11 px-3.5 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="biz-price">
                Tarif indicatif de départ (FCFA)
              </label>
              <input
                id="biz-price"
                type="number"
                min="1000"
                step="500"
                value={startingPrice}
                onChange={(e) => setStartingPrice(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-semibold text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="biz-bio">
              Description de vos compétences, prestations et garanties
            </label>
            <textarea
              id="biz-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Décrivez votre expérience, vos délais d'intervention, vos spécialités et vos garanties offertes aux clients..."
              className="w-full p-3.5 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-[#ecf6ed] border border-[#bfecdc] text-xs text-[#006946] flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] shrink-0">verified_user</span>
            <p>
              Votre fiche sera soumise au statut <strong>« En attente de validation »</strong>. Un agent MboaFacile vérifiera votre CNI et vos informations avant publication sur la carte.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('espace-commercant')}
              className="flex-1 h-12 rounded-2xl bg-[#ecf6ed] text-[#3e4942] text-xs font-bold hover:bg-[#e1ebe1]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-2 h-12 rounded-2xl bg-[#006946] hover:bg-[#16845b] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <span>Soumettre ma fiche à validation</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
