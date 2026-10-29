import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BusinessDocument } from '../types/auth';

interface MerchantDashboardViewProps {
  onNavigate: (tab: string, artisanId?: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const MerchantDashboardView: React.FC<MerchantDashboardViewProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const { user, userProfile, merchantBusinesses, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#dbe5dc] shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ecf6ed] text-[#006946] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">storefront</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#151e18]">Espace Pro Commerçant</h2>
          <p className="text-xs sm:text-sm text-[#6e7a72]">
            Connectez-vous avec votre compte professionnel pour gérer vos fiches d'établissements et vos demandes de devis.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('connexion')}
              className="w-full h-11 rounded-2xl bg-[#006946] text-white text-xs font-bold"
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => onNavigate('inscription')}
              className="w-full h-11 rounded-2xl bg-[#f2fcf2] text-[#006946] border border-[#dbe5dc] text-xs font-bold"
            >
              Créer un compte commerçant
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Dashboard Banner */}
      <div className="bg-gradient-to-r from-[#006946] to-[#16845b] text-white rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
            Tableau de Bord Professionnel
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold">
            Bienvenue, {userProfile?.displayName || user.displayName} !
          </h1>
          <p className="text-xs text-[#bfecdc]">
            Gérez la visibilité de vos commerces, services et vos interventions à Douala et Yaoundé.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('inscrire-mon-commerce')}
            className="px-4 py-2.5 rounded-xl bg-white text-[#006946] hover:bg-[#ecf6ed] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Ajouter une fiche</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              await logout();
              onShowToast('Vous êtes déconnecté.', 'info');
              onNavigate('accueil');
            }}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center"
            aria-label="Se déconnecter"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#dbe5dc] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#6e7a72] block">Commerces enregistrés</span>
          <span className="text-2xl font-black text-[#006946] mt-1 block">
            {merchantBusinesses.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#dbe5dc] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#6e7a72] block">Fiches Validées</span>
          <span className="text-2xl font-black text-[#006946] mt-1 block">
            {merchantBusinesses.filter((b) => b.status === 'approved').length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#dbe5dc] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#6e7a72] block">En attente d'audit</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {merchantBusinesses.filter((b) => b.status === 'pending').length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#dbe5dc] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#6e7a72] block">Vérification CNI</span>
          <span className="text-xs font-bold text-[#006946] mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Équipe Douala</span>
          </span>
        </div>
      </div>

      {/* 3. Establishments List */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#dbe5dc] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#151e18]">Mes Établissements & Fiches Publiques</h2>
            <p className="text-xs text-[#6e7a72] mt-0.5">
              Chaque fiche est vérifiée pour garantir la sécurité des utilisateurs avant publication.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('inscrire-mon-commerce')}
            className="text-xs font-bold text-[#006946] hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Nouveau commerce</span>
          </button>
        </div>

        {merchantBusinesses.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6e7a72] bg-[#fbfdfb] rounded-2xl border border-[#e1ebe1] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ecf6ed] text-[#006946] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[26px]">storefront</span>
            </div>
            <div>
              <p className="font-bold text-[#151e18] text-sm">Vous n'avez pas encore publié d'établissement.</p>
              <p className="mt-1 max-w-sm mx-auto">
                Ajoutez votre atelier, boutique ou service pour être visible par des milliers de clients à Douala et Yaoundé.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('inscrire-mon-commerce')}
              className="px-4 py-2.5 rounded-xl bg-[#006946] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">add_business</span>
              <span>Créer ma première fiche</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {merchantBusinesses.map((biz) => {
              const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
                pending: {
                  label: 'En attente d’audit CNI & validation',
                  color: 'text-amber-800',
                  bg: 'bg-amber-50 border-amber-200',
                },
                approved: {
                  label: 'Validé & Visible en ligne',
                  color: 'text-[#006946]',
                  bg: 'bg-[#bfecdc]/50 border-[#006946]/30',
                },
                rejected: {
                  label: 'Dossier à corriger',
                  color: 'text-rose-800',
                  bg: 'bg-rose-50 border-rose-200',
                },
              };

              const st = statusLabels[biz.status] || statusLabels.pending;

              return (
                <div
                  key={biz.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#f2fcf2] border border-[#dbe5dc] space-y-3 hover:border-[#006946]/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-[#151e18]">{biz.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.bg} ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#6e7a72] mt-0.5">{biz.job} • {biz.category}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs font-bold text-[#006946]">
                        Dès {biz.startingPrice.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-[#3e4942]">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#006946]">location_on</span>
                      <span>{biz.district}, {biz.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#006946]">phone</span>
                      <span>{biz.phone}</span>
                    </div>
                    {biz.whatsapp && (
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-[#006946]">chat</span>
                        <span>WhatsApp : {biz.whatsapp}</span>
                      </div>
                    )}
                  </div>

                  {biz.bio && (
                    <p className="text-xs text-[#3e4942] bg-white p-3 rounded-xl border border-[#e1ebe1] leading-relaxed">
                      {biz.bio}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Support & Validation Info */}
      <div className="p-4 rounded-2xl bg-[#bfecdc]/40 border border-[#bfecdc] flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#bfecdc] text-[#006946] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[22px]">policy</span>
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#006946]">Charte de Confiance & Contrôle d'Antécédents</h4>
          <p className="text-xs text-[#3e4942] mt-0.5 leading-relaxed">
            Pour protéger nos utilisateurs contre la fraude et les malfaçons, les établissements soumis sont validés sous 24h par notre équipe opérationnelle à Douala après examen de la CNI et des références professionnelles.
          </p>
        </div>
      </div>
    </div>
  );
};
