import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ARTISANS, DOUALA_DISTRICTS, YAOUNDE_DISTRICTS, Artisan } from '../data/mockData';
import { sanitizeInput, validateCameroonPhone } from '../utils/security';

interface ProfileViewProps {
  onNavigate: (tab: string, artisanId?: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onStartQuote: (artisan?: Artisan) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate, onShowToast, onStartQuote }) => {
  const {
    user,
    userProfile,
    userFavorites,
    toggleFavoriteInDb,
    logout,
    updateProfileData,
    resendVerificationEmail,
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phoneNumber || '');
  const [city, setCity] = useState<'Douala' | 'Yaoundé'>((userProfile?.city as any) || 'Douala');
  const [district, setDistrict] = useState(userProfile?.district || 'Akwa');
  const [isSaving, setIsSaving] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#dbe5dc] shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ecf6ed] text-[#006946] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">account_circle</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#151e18]">Vous n'êtes pas connecté</h2>
          <p className="text-xs sm:text-sm text-[#6e7a72]">
            Connectez-vous pour retrouver vos informations de compte, vos favoris et vos demandes de devis.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('connexion')}
              className="w-full h-11 rounded-2xl bg-[#006946] hover:bg-[#16845b] text-white text-xs font-bold flex items-center justify-center"
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => onNavigate('inscription')}
              className="w-full h-11 rounded-2xl bg-[#f2fcf2] text-[#006946] border border-[#dbe5dc] text-xs font-bold hover:bg-[#e1ebe1]"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Favorite artisans
  const favoriteArtisans = ARTISANS.filter((a) => userFavorites.has(a.id));
  const districtsList = city === 'Douala' ? DOUALA_DISTRICTS : YAOUNDE_DISTRICTS;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    const cleanName = sanitizeInput(displayName.trim(), 100);

    if (!cleanName) {
      setEditError('Le nom ne peut pas être vide.');
      return;
    }

    if (phone.trim()) {
      const phoneCheck = validateCameroonPhone(phone);
      if (!phoneCheck.isValid) {
        setEditError(phoneCheck.error || 'Numéro camerounais invalide.');
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateProfileData({
        displayName: cleanName,
        phoneNumber: phone.trim(),
        city,
        district,
      });
      setIsEditing(false);
      onShowToast('Profil mis à jour avec succès !', 'success');
    } catch (err: any) {
      setEditError(err.message || 'Impossible de sauvegarder.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail();
      onShowToast('E-mail de vérification réexpédié ! Vérifiez vos spams.', 'info');
    } catch (err: any) {
      onShowToast("Erreur lors de l'envoi de l'e-mail.", 'warning');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#dbe5dc] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#006946] text-white flex items-center justify-center text-xl font-extrabold shadow-sm shrink-0">
            {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[#151e18]">
                {userProfile?.displayName || user.displayName || 'Utilisateur MboaFacile'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#bfecdc] text-[#006946] text-[10px] font-extrabold uppercase">
                {userProfile?.role === 'merchant' ? 'Commerçant Pro' : 'Client Particulier'}
              </span>
            </div>
            <p className="text-xs text-[#6e7a72] mt-0.5">{user.email}</p>
            <p className="text-[11px] text-[#3e4942] font-semibold mt-1">
              📍 {userProfile?.district || 'Akwa'}, {userProfile?.city || 'Douala'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userProfile?.role === 'merchant' ? (
            <button
              type="button"
              onClick={() => onNavigate('espace-commercant')}
              className="px-4 py-2.5 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              <span>Mon Espace Commerçant</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('inscrire-mon-commerce')}
              className="px-4 py-2.5 rounded-xl bg-[#ecf6ed] hover:bg-[#dbe5dc] text-[#006946] text-xs font-bold flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add_business</span>
              <span>Devenir Commerçant</span>
            </button>
          )}

          <button
            type="button"
            onClick={async () => {
              await logout();
              onShowToast('Vous êtes déconnecté.', 'info');
              onNavigate('accueil');
            }}
            className="px-3.5 py-2.5 rounded-xl bg-[#f2fcf2] text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-bold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* 2. Email verification reminder if not verified */}
      {!user.emailVerified && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0">mark_email_unread</span>
            <div>
              <p className="font-bold">Adresse e-mail en attente de vérification</p>
              <p className="text-amber-800 mt-0.5">
                Vérifiez votre adresse <strong>{user.email}</strong> pour sécuriser vos demandes et devis.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isResending}
            onClick={handleResendVerification}
            className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-700 shrink-0 shadow-2xs disabled:opacity-50"
          >
            {isResending ? 'Envoi...' : 'Renvoyer l’e-mail'}
          </button>
        </div>
      )}

      {/* 3. Personal Information Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#dbe5dc] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#006946]">manage_accounts</span>
            <h2 className="text-base font-extrabold text-[#151e18]">Informations du profil</h2>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-[#006946] hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Modifier</span>
            </button>
          )}
        </div>

        {editError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {editError}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#151e18] mb-1" htmlFor="edit-name">
                  Nom et prénom
                </label>
                <input
                  id="edit-name"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs font-semibold text-[#151e18]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151e18] mb-1" htmlFor="edit-phone">
                  Numéro de téléphone
                </label>
                <input
                  id="edit-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="6XX XX XX XX"
                  className="w-full h-10 px-3 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs font-semibold text-[#151e18]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151e18] mb-1" htmlFor="edit-city">
                  Ville
                </label>
                <select
                  id="edit-city"
                  value={city}
                  onChange={(e) => {
                    const c = e.target.value as 'Douala' | 'Yaoundé';
                    setCity(c);
                    setDistrict(c === 'Douala' ? 'Akwa' : 'Bastos');
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs font-semibold text-[#151e18]"
                >
                  <option value="Douala">Douala</option>
                  <option value="Yaoundé">Yaoundé</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151e18] mb-1" htmlFor="edit-dist">
                  Quartier
                </label>
                <select
                  id="edit-dist"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs font-semibold text-[#151e18]"
                >
                  {districtsList.slice(0, 50).map((d: string) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-[#ecf6ed] text-[#3e4942] text-xs font-semibold hover:bg-[#e1ebe1]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-[#006946] text-white text-xs font-bold hover:bg-[#16845b]"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
            <div className="p-3 rounded-xl bg-[#f2fcf2] border border-[#dbe5dc]">
              <span className="text-[#6e7a72] block text-[11px]">Rôle du compte</span>
              <span className="font-bold text-[#006946] capitalize mt-0.5 block">
                {userProfile?.role === 'merchant' ? 'Commerçant' : 'Client'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#f2fcf2] border border-[#dbe5dc]">
              <span className="text-[#6e7a72] block text-[11px]">Téléphone</span>
              <span className="font-bold text-[#151e18] mt-0.5 block">
                {userProfile?.phoneNumber || 'Non renseigné'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#f2fcf2] border border-[#dbe5dc]">
              <span className="text-[#6e7a72] block text-[11px]">Ville</span>
              <span className="font-bold text-[#151e18] mt-0.5 block">{userProfile?.city || 'Douala'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#f2fcf2] border border-[#dbe5dc]">
              <span className="text-[#6e7a72] block text-[11px]">Quartier</span>
              <span className="font-bold text-[#151e18] mt-0.5 block">{userProfile?.district || 'Akwa'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Favoris synchronisés Firestore */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#dbe5dc] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#ffb955]" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <h2 className="text-base font-extrabold text-[#151e18]">
              Mes Artisans Favoris ({favoriteArtisans.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('explorer')}
            className="text-xs font-bold text-[#006946] hover:underline"
          >
            Explorer d'autres artisans
          </button>
        </div>

        {favoriteArtisans.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6e7a72] bg-[#fbfdfb] rounded-2xl border border-[#e1ebe1]">
            <span className="material-symbols-outlined text-3xl text-[#006946] mb-1">favorite_border</span>
            <p>Vous n'avez pas encore d'artisan favori enregistré.</p>
            <p className="mt-1">
              Cliquez sur le cœur d'un artisan dans l'onglet « Explorer » pour le retrouver ici.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {favoriteArtisans.map((artisan) => (
              <div
                key={artisan.id}
                className="p-3.5 rounded-2xl bg-[#f2fcf2] border border-[#dbe5dc] flex items-center justify-between gap-3 hover:border-[#006946]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={artisan.avatar}
                    alt={artisan.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#bfecdc]"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-[#151e18]">{artisan.name}</h3>
                    <p className="text-[11px] text-[#6e7a72]">{artisan.job}</p>
                    <p className="text-[10px] text-[#006946] font-semibold mt-0.5">
                      📍 {artisan.district} • Dès {artisan.startingPrice.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onStartQuote(artisan)}
                    className="px-3 py-1.5 rounded-xl bg-[#006946] text-white text-[11px] font-bold hover:bg-[#16845b]"
                  >
                    Devis
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toggleFavoriteInDb(artisan.id);
                      onShowToast('Artisan retiré des favoris.', 'info');
                    }}
                    className="text-[10px] text-rose-600 hover:underline text-center"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
