import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { DOUALA_DISTRICTS, YAOUNDE_DISTRICTS } from '../data/mockData';
import { sanitizeInput, validateCameroonPhone } from '../utils/security';

interface RegisterViewProps {
  onNavigate: (tab: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  initialRole?: UserRole;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onNavigate,
  onShowToast,
  initialRole = 'client',
}) => {
  const { registerWithEmail, loginWithGoogle } = useAuth();
  const [role, setRole] = useState<UserRole>(initialRole);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<'Douala' | 'Yaoundé'>('Douala');
  const [district, setDistrict] = useState('Akwa');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const districtsList = city === 'Douala' ? DOUALA_DISTRICTS : YAOUNDE_DISTRICTS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = sanitizeInput(displayName.trim(), 100);
    const cleanEmail = sanitizeInput(email.trim(), 120);

    if (!cleanName || !cleanEmail || !password) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (phone.trim()) {
      const phoneCheck = validateCameroonPhone(phone);
      if (!phoneCheck.isValid) {
        setError(phoneCheck.error || 'Numéro de téléphone camerounais invalide.');
        return;
      }
    }

    setIsLoading(true);
    try {
      await registerWithEmail(cleanEmail, password, cleanName, role, city, district);
      onShowToast(
        role === 'merchant'
          ? 'Compte commerçant créé avec succès ! Un e-mail de confirmation vous a été envoyé.'
          : 'Compte client créé avec succès ! Bienvenue sur MboaFacile.',
        'success'
      );
      if (role === 'merchant') {
        onNavigate('inscrire-mon-commerce');
      } else {
        onNavigate('accueil');
      }
    } catch (err: any) {
      console.error('Erreur inscription:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Cette adresse e-mail est déjà associée à un compte. Veuillez vous connecter.');
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe choisi est trop faible.');
      } else {
        setError(err.message || "Échec de l'inscription.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(role);
      onShowToast('Compte créé et connecté via Google !', 'success');
      if (role === 'merchant') {
        onNavigate('inscrire-mon-commerce');
      } else {
        onNavigate('accueil');
      }
    } catch (err: any) {
      console.error('Erreur Google Sign-Up:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError("Échec de l'inscription Google. Veuillez réessayer.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#dbe5dc] shadow-sm space-y-6">
        {/* Heading */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ecf6ed] text-[#006946] flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-[28px]">person_add</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#151e18]">Rejoindre MboaFacile</h1>
          <p className="text-xs sm:text-sm text-[#6e7a72]">
            Créez votre compte en quelques instants pour profiter de tous les services.
          </p>
        </div>

        {/* Role Selector Tabs (Client vs Commerçant) */}
        <div className="grid grid-cols-2 p-1.5 bg-[#f2fcf2] rounded-2xl border border-[#dbe5dc]">
          <button
            type="button"
            onClick={() => setRole('client')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              role === 'client'
                ? 'bg-[#006946] text-white shadow-xs'
                : 'text-[#3e4942] hover:text-[#151e18]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span>Client Particulier</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('merchant')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              role === 'merchant'
                ? 'bg-[#006946] text-white shadow-xs'
                : 'text-[#3e4942] hover:text-[#151e18]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            <span>Commerçant / Artisan</span>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Google Quick Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-12 rounded-2xl border border-[#dbe5dc] bg-white hover:bg-[#f2fcf2] text-[#151e18] text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-98 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {isGoogleLoading
                ? 'Inscription Google...'
                : `S'inscrire avec Google (${role === 'merchant' ? 'Commerçant' : 'Client'})`}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#e1ebe1]" />
          <span className="text-[11px] uppercase font-bold text-[#6e7a72]">ou avec e-mail</span>
          <div className="flex-1 h-px bg-[#e1ebe1]" />
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="reg-name">
              {role === 'merchant' ? "Nom du gérant / de l'établissement *" : 'Nom et Prénom *'}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-[#6e7a72]">
                badge
              </span>
              <input
                id="reg-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={role === 'merchant' ? 'Ex: Talla Éric (Atelier Électricité)' : 'Ex: Patrick Kamga'}
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="reg-email">
              Adresse e-mail *
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-[#6e7a72]">
                mail
              </span>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              />
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="reg-password">
                Mot de passe *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-[#6e7a72]">
                  lock
                </span>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 caractères"
                  className="w-full h-11 pl-10 pr-9 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="reg-confirm">
                Confirmation *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-[#6e7a72]">
                  lock_reset
                </span>
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer"
                  className="w-full h-11 pl-10 pr-9 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
                />
              </div>
            </div>
          </div>

          {/* City & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="reg-city">
                Ville
              </label>
              <select
                id="reg-city"
                value={city}
                onChange={(e) => {
                  const newCity = e.target.value as 'Douala' | 'Yaoundé';
                  setCity(newCity);
                  setDistrict(newCity === 'Douala' ? 'Akwa' : 'Bastos');
                }}
                className="w-full h-11 px-3 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-semibold text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              >
                <option value="Douala">Douala</option>
                <option value="Yaoundé">Yaoundé</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="reg-district">
                Quartier principal
              </label>
              <select
                id="reg-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-semibold text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              >
                {districtsList.slice(0, 50).map((d: string) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="reg-phone">
              Numéro de téléphone (facultatif mais recommandé pour devis)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-[#6e7a72]">
                phone_iphone
              </span>
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="6XX XX XX XX (Orange / MTN)"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full h-12 rounded-2xl bg-[#006946] hover:bg-[#16845b] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Création du compte...</span>
              </>
            ) : (
              <span>Créer mon compte {role === 'merchant' ? 'Commerçant' : 'Client'}</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 border-t border-[#e1ebe1] text-center">
          <p className="text-xs text-[#6e7a72]">
            Vous avez déjà un compte ?{' '}
            <button
              type="button"
              onClick={() => onNavigate('connexion')}
              className="font-bold text-[#006946] hover:underline"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
