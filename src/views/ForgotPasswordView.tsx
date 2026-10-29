import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sanitizeInput } from '../utils/security';

interface ForgotPasswordViewProps {
  onNavigate: (tab: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onNavigate, onShowToast }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = sanitizeInput(email.trim(), 120);

    if (!cleanEmail) {
      setError('Veuillez renseigner votre adresse e-mail.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(cleanEmail);
      setIsSubmitted(true);
      onShowToast('Lien de réinitialisation envoyé ! Vérifiez votre boîte de réception.', 'success');
    } catch (err: any) {
      console.error('Erreur reset password:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Aucun compte n’est associé à cette adresse e-mail.');
      } else {
        setError(err.message || "Échec de l'envoi de l'e-mail de réinitialisation.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#dbe5dc] shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ecf6ed] text-[#006946] flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-[28px]">lock_reset</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#151e18]">Mot de passe oublié</h1>
          <p className="text-xs sm:text-sm text-[#6e7a72]">
            Indiquez votre adresse e-mail pour recevoir les instructions de réinitialisation sécurisée.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success confirmation */}
        {isSubmitted ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#ecf6ed] border border-[#bfecdc] text-xs text-[#006946] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
                <span>E-mail envoyé avec succès !</span>
              </div>
              <p className="text-[#3e4942] leading-relaxed">
                Un lien sécurisé a été transmis à <strong>{email}</strong>. Cliquez sur ce lien pour définir un nouveau mot de passe.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('connexion')}
              className="w-full h-12 rounded-2xl bg-[#006946] hover:bg-[#16845b] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              Retour à la page de connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#151e18] mb-1.5" htmlFor="forgot-email">
                Adresse e-mail de votre compte
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-[#6e7a72]">
                  mail
                </span>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#dbe5dc] bg-[#f2fcf2] text-xs sm:text-sm font-medium text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-[#006946] hover:bg-[#16845b] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <span>Envoyer le lien de réinitialisation</span>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-[#e1ebe1] text-center">
          <button
            type="button"
            onClick={() => onNavigate('connexion')}
            className="text-xs font-bold text-[#006946] hover:underline"
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};
