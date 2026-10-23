import React, { useState } from 'react';
import { UserRequest } from '../data/mockData';

interface DemandesViewProps {
  requests: UserRequest[];
  onNavigate: (tab: string) => void;
  onShowToast: (msg: string) => void;
  onUpdateRequestStatus: (id: string, newStatus: UserRequest['status'], newStatusLabel: string) => void;
}

export const DemandesView: React.FC<DemandesViewProps> = ({
  requests,
  onNavigate,
  onShowToast,
  onUpdateRequestStatus,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('active');

  const filteredRequests = requests.filter((r) => {
    if (filterTab === 'active') return r.status !== 'termine';
    if (filterTab === 'completed') return r.status === 'termine';
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto w-full px-4 pt-4 pb-24 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#151e18]">Mes Demandes d'Intervention</h1>
          <p className="text-xs text-[#6e7a72]">Suivez en temps réel l'avancement de vos devis et dépannages</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('devis')}
          className="h-9 px-3 rounded-xl bg-[#006946] text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-[#16845b]"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Nouveau devis</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#ecf6ed] rounded-xl text-xs font-bold w-fit">
        <button
          type="button"
          onClick={() => setFilterTab('active')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterTab === 'active' ? 'bg-white text-[#006946] shadow-xs' : 'text-[#3e4942]'
          }`}
        >
          En cours ({requests.filter((r) => r.status !== 'termine').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('completed')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterTab === 'completed' ? 'bg-white text-[#006946] shadow-xs' : 'text-[#3e4942]'
          }`}
        >
          Historique ({requests.filter((r) => r.status === 'termine').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterTab === 'all' ? 'bg-white text-[#006946] shadow-xs' : 'text-[#3e4942]'
          }`}
        >
          Toutes ({requests.length})
        </button>
      </div>

      {/* Requests Feed */}
      <div className="space-y-3.5">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-[#e1ebe1] flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#ecf6ed] text-[#006946] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[28px]">assignment_turned_in</span>
            </div>
            <h3 className="text-base font-bold text-[#151e18]">Aucune demande dans cette vue</h3>
            <p className="text-xs text-[#6e7a72] max-w-xs mt-1 mb-4">
              Besoin d'un artisan pour un dépannage ou des travaux ? Demandez un devis gratuit en 2 minutes.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('devis')}
              className="px-4 py-2.5 rounded-xl bg-[#006946] text-white text-xs font-bold shadow-xs"
            >
              Créer une demande de devis
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#e1ebe1] hover:border-[#006946]/40 transition-all flex flex-col gap-3"
            >
              {/* Header: ID + Category + Status */}
              <div className="flex items-start justify-between gap-2 border-b border-[#f2fcf2] pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-[#006946]">{req.id}</span>
                    <span className="text-xs text-[#6e7a72]">• {req.serviceCategory}</span>
                  </div>
                  <h2 className="text-sm font-bold text-[#151e18] mt-0.5">{req.title}</h2>
                </div>

                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
                  style={{
                    backgroundColor:
                      req.status === 'en_route'
                        ? '#bfecdc'
                        : req.status === 'devis_recu'
                        ? '#ffddb4'
                        : req.status === 'termine'
                        ? '#ecf6ed'
                        : '#ffdad6',
                    color:
                      req.status === 'en_route'
                        ? '#006946'
                        : req.status === 'devis_recu'
                        ? '#7f5200'
                        : req.status === 'termine'
                        ? '#3d665a'
                        : '#ba1a1a',
                  }}
                >
                  {req.status === 'en_route'
                    ? 'Artisan en route'
                    : req.status === 'devis_recu'
                    ? 'Devis reçu'
                    : req.status === 'termine'
                    ? 'Terminé'
                    : 'En attente'}
                </span>
              </div>

              {/* Artisan assigned and location */}
              <div className="flex items-center gap-3 bg-[#f2fcf2] p-3 rounded-xl border border-[#e1ebe1]/60">
                <img
                  src={req.artisanAvatar}
                  alt={req.artisanName}
                  className="w-11 h-11 rounded-full object-cover shrink-0 ring-1 ring-[#006946]/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-[#151e18] truncate">
                      {req.artisanName}
                    </span>
                    {req.amount && (
                      <span className="font-extrabold text-xs text-[#006946]">
                        {req.amount.toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#3d665a] truncate">{req.artisanJob}</p>
                  <span className="text-[11px] text-[#6e7a72] flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[13px] text-[#a06800]">location_on</span>
                    {req.district} • {req.date} ({req.timeSlot})
                  </span>
                </div>
              </div>

              {/* Status Message */}
              <div className="flex items-center gap-2 text-xs font-medium text-[#3e4942]">
                <span className="w-2 h-2 rounded-full bg-[#006946] shrink-0" />
                <span className="leading-tight">{req.statusLabel}</span>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-[#f2fcf2]">
                <a
                  href={`https://wa.me/237699452180?text=Bonjour,%20concernant%20mon%20dossier%20${req.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 rounded-xl bg-[#ecf6ed] hover:bg-[#e1ebe1] text-[#151e18] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[17px] text-[#006946]">chat</span>
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${req.phone}`}
                  className="h-10 rounded-xl bg-[#ecf6ed] hover:bg-[#e1ebe1] text-[#151e18] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[17px] text-[#006946]">call</span>
                  <span>Appeler</span>
                </a>

                {req.status === 'en_route' && (
                  <button
                    type="button"
                    onClick={() => onNavigate('carte')}
                    className="col-span-2 sm:col-span-1 h-10 rounded-xl bg-[#bfecdc] text-[#006946] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#a4d0c0] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px]">near_me</span>
                    <span>Suivi Google Maps</span>
                  </button>
                )}

                {req.status === 'en_route' ? (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateRequestStatus(req.id, 'termine', 'Mission validée et clôturée');
                      onShowToast('Mission validée ! Merci d’avoir utilisé MboaFacile.');
                    }}
                    className="col-span-2 sm:col-span-1 h-10 rounded-xl bg-[#006946] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#16845b]"
                  >
                    <span className="material-symbols-outlined text-[17px]">verified</span>
                    <span>Valider travaux</span>
                  </button>
                ) : req.status === 'devis_recu' ? (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateRequestStatus(req.id, 'en_route', 'Devis accepté ! L’artisan se met en route.');
                      onShowToast('Devis accepté ! L’artisan a été prévenu.');
                    }}
                    className="col-span-2 sm:col-span-1 h-10 rounded-xl bg-[#006946] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#16845b]"
                  >
                    <span className="material-symbols-outlined text-[17px]">thumb_up</span>
                    <span>Accepter le devis</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onShowToast(`Dossier ${req.id} : Artisan en cours de déplacement.`)}
                    className="col-span-2 sm:col-span-1 h-10 rounded-xl bg-white border border-[#dbe5dc] text-[#3e4942] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#ecf6ed]"
                  >
                    <span>Détails dossier</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
