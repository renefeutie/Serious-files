import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sanitizeInput } from '../utils/security';

interface LoginViewProps {
  onNavigate: (tab: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate, onShowToast }) => {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = sanitizeInput(email.trim(), 120);

    if (!cleanEmail || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(cleanEmail, password);
      onShowToast('Connexion réussie ! Heureux de vous revoir.', 'success');
      onNavigate('accueil');
    } catch (err: any) {
      console.error('Erreur login:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Adresse e-mail ou mot de passe incorrect.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Trop de tentatives infructueuses. Veuillez réessayer dans quelques minutes.');
      } else {
        setError(err.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      onShowToast('Connexion Google réussie !', 'success');
      onNavigate('accueil');
    } catch (err: any) {
      console.error('Erreur Google Sign-In:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Échec de la connexion Google. Veuillez réessayer.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#dbe5dc] shadow-sm space-y-6">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ecf6ed] text-[#006946] flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-[28px]">lock_open</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#151e18]">Connexion à MboaFacile</h1>
          <p className="text-xs sm:text-sm text-[#6e7a72]">
            Accédez à vos demandes, favoris et espace professionnel.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Google Quick Sign-In */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
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
            <span>{isGoogleLoading ? 'Connexion en cours...' : 'Continuer avec Google'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#e1ebe1]" />
          <span className="text-[11px] uppercase font-bold text-[#6e7a72]">ou avec votre e-mail</span>
          <div className="flex-1 h-px bg-[#e1ebe1]" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="login-email">
              Adresse e-mail
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-[#6e7a72]">
                mail
              </span>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#151e18]" htmlFor="login-password">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => onNavigate('mot-de-passe-oublie')}
                className="text-[11px] font-semibold text-[#006946] hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-[#6e7a72]">
                lock
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#6e7a72] hover:text-[#151e18]"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
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
                <span>Connexion...</span>
              </>
            ) : (
              <span>Se connecter</span>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="pt-2 border-t border-[#e1ebe1] text-center space-y-2">
          <p className="text-xs text-[#6e7a72]">
            Pas encore de compte ?{' '}
            <button
              type="button"
              onClick={() => onNavigate('inscription')}
              className="font-bold text-[#006946] hover:underline"
            >
              Créer un compte
            </button>
          </p>
          <p className="text-[11px] text-[#6e7a72]">
            Vous êtes commerçant ou artisan ?{' '}
            <button
              type="button"
              onClick={() => onNavigate('inscrire-mon-commerce')}
              className="font-bold text-[#006946] hover:underline"
            >
              Inscrire mon commerce
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
