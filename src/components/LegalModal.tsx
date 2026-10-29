import React, { useState, useEffect } from 'react';

export type LegalTab = 'confidentialite' | 'mentions' | 'cgu' | 'litiges' | 'cookies';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
  onOpenCookiePreferences?: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'confidentialite',
  onClose,
  onOpenCookiePreferences,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-[#dbe5dc]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e1ebe1] flex items-center justify-between bg-[#f2fcf2]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#006946] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">policy</span>
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-base sm:text-lg font-bold text-[#151e18]">
                Informations Légales &amp; Conformité
              </h2>
              <p className="text-xs text-[#6e7a72]">Transparence, sécurité et protection de vos droits</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white text-[#3e4942] hover:bg-[#e6f1e7] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#006946] transition-colors"
            aria-label="Fermer la boîte de dialogue légale"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#e1ebe1] bg-white overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('confidentialite')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'confidentialite'
                ? 'bg-[#006946] text-white shadow-xs'
                : 'text-[#3e4942] hover:bg-[#ecf6ed]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">privacy_tip</span>
            <span>Confidentialité &amp; RGPD</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mentions')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'mentions'
                ? 'bg-[#006946] text-white shadow-xs'
                : 'text-[#3e4942] hover:bg-[#ecf6ed]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Mentions Légales</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cgu')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cgu'
                ? 'bg-[#006946] text-white shadow-xs'
                : 'text-[#3e4942] hover:bg-[#ecf6ed]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">gavel</span>
            <span>Conditions d'Utilisation (CGU)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('litiges')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'litiges'
                ? 'bg-[#006946] text-white shadow-xs'
                : 'text-[#3e4942] hover:bg-[#ecf6ed]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">payments</span>
            <span>Paiements, Devis &amp; Litiges</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cookies')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cookies'
                ? 'bg-[#006946] text-white shadow-xs'
                : 'text-[#3e4942] hover:bg-[#ecf6ed]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">cookie</span>
            <span>Cookies &amp; Consentement</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-[#3e4942] space-y-4 leading-relaxed bg-[#fbfdfb]">
          {/* TAB 1: CONFIDENTIALITÉ & RGPD */}
          {activeTab === 'confidentialite' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#ecf6ed] border border-[#bfecdc] text-[#006946]">
                <p className="font-bold text-sm mb-1">Protection des données à caractère personnel</p>
                <p className="text-xs text-[#3e4942]">
                  La présente politique est établie en conformité avec la <strong>Loi camerounaise N° 2010/012 du 21 décembre 2010</strong> relative à la cybersécurité et la cybercriminalité au Cameroun, ainsi qu'avec les principes du <strong>Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679)</strong> pour nos utilisateurs établis dans l'Union Européenne ou la diaspora camerounaise.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">1. Responsable de Traitement</h3>
                <p>
                  Les données collectées sur la plateforme <strong>MboaFacile</strong> sont traitées sous la responsabilité de l'exploitant de la plateforme (voir l'onglet <em>Mentions Légales</em>).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">2. Données collectées &amp; Principe de Minimisation</h3>
                <p>Nous appliquons strictement le principe de minimisation des données : seules les données indispensables à la mise en relation sont requises :</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Pour les clients demandeurs de devis :</strong> Nom ou prénom de contact, numéro de téléphone / WhatsApp (indispensable pour l'envoi du chiffrage et la coordination sur le terrain), quartier d'intervention à Douala ou Yaoundé, description de la panne ou du besoin technique, photos optionnelles fournies de votre plein gré, adresse email (purement facultative).</li>
                  <li><strong>Pour les prestataires et artisans :</strong> Nom et raison commerciale, numéro WhatsApp professionnel, quartier d'atelier, justificatif d'identité (CNI / récépissé officiel) strictement réservé à la vérification physique de sécurité, attestation de compétences ou références.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">3. Finalités et Bases Légales du Traitement</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border border-[#e1ebe1]">
                    <span className="font-bold text-[#006946] block">Mise en relation artisan-client</span>
                    <span className="text-[11px] text-[#6e7a72] block mt-0.5">Base légale : Exécution de mesures précontractuelles à la demande de l'utilisateur.</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#e1ebe1]">
                    <span className="font-bold text-[#006946] block">Vérification de sécurité &amp; CNI</span>
                    <span className="text-[11px] text-[#6e7a72] block mt-0.5">Base légale : Intérêt légitime de protection contre la fraude et garantie de fiabilité des interventions à domicile.</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#e1ebe1]">
                    <span className="font-bold text-[#006946] block">Assistance et médiation en cas de litige</span>
                    <span className="text-[11px] text-[#6e7a72] block mt-0.5">Base légale : Exécution des engagements de service client et garantie intervention.</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#e1ebe1]">
                    <span className="font-bold text-[#006946] block">Préférences locales de navigation</span>
                    <span className="text-[11px] text-[#6e7a72] block mt-0.5">Base légale : Consentement libre et éclairé de l'utilisateur.</span>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">4. Destinataires et Non-revente des Données</h3>
                <p>
                  <strong>Aucune donnée personnelle n'est vendue, louée ou cédée à des fins publicitaires.</strong> Les destinataires exclusifs sont :
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>L'artisan certifié sélectionné ou les professionnels consultés dans votre quartier pour la remise du devis.</li>
                  <li>L'équipe d'assistance client MboaFacile basée à Douala pour le suivi qualité.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">5. Durée de Conservation</h3>
                <p>
                  Les demandes de devis et coordonnées associées sont conservées pendant la durée active du chantier puis archivées pendant <strong>12 mois</strong> à compter de la clôture des travaux pour couvrir la période de garantie d'intervention et de médiation. Les pièces d'identité des artisans sont stockées dans un espace sécurisé à accès restreint et supprimées dès clôture du compte pro.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">6. Vos Droits &amp; Point de Contact</h3>
                <p>
                  Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification, de portabilité, d'effacement de vos données (« droit à l'oubli ») et d'opposition.
                </p>
                <div className="p-3 bg-white rounded-xl border border-[#e1ebe1] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#151e18]">Pour exercer vos droits :</span>
                    <p className="text-[11px] text-[#6e7a72]">Contactez notre délégué à la protection des données ou notre service client.</p>
                  </div>
                  <a
                    href="https://wa.me/237686942622?text=Bonjour,%20je%20souhaite%20exercer%20mon%20droit%20d'acc%C3%A8s%20ou%20suppression%20de%20mes%20donn%C3%A9es"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#006946] text-white text-xs font-bold hover:bg-[#16845b] transition-colors"
                  >
                    WhatsApp DPO
                  </a>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: MENTIONS LÉGALES */}
          {activeTab === 'mentions' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#ffddb4]/40 border border-[#a06800]/30 text-[#7f5200]">
                <p className="font-bold text-xs">Transparence juridique stricte (Anti-simulation)</p>
                <p className="text-[11px] mt-0.5">
                  Conformément aux règles déontologiques, aucune fausse entité commerciale ou faux numéro fiscal n'est inventé. Les champs ci-dessous indiquent avec précision les mentions obligatoires et les informations officielles à renseigner par l'exploitant du service avant le déploiement en production.
                </p>
              </div>

              <section className="space-y-2 bg-white p-4 rounded-2xl border border-[#e1ebe1]">
                <h3 className="font-bold text-sm text-[#151e18]">1. Éditeur de la Plateforme</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#6e7a72] block">Nom du service :</span>
                    <span className="font-bold text-[#151e18]">MboaFacile</span>
                  </div>
                  <div>
                    <span className="text-[#6e7a72] block">Forme juridique / Statut :</span>
                    <span className="font-mono text-[#a06800] bg-[#ecf6ed] px-1.5 py-0.5 rounded text-[11px]">
                      [À compléter par l'exploitant : SAS, SARL ou Entreprise Individuelle]
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6e7a72] block">Registre du Commerce (RCCM) :</span>
                    <span className="font-mono text-[#a06800] bg-[#ecf6ed] px-1.5 py-0.5 rounded text-[11px]">
                      [À renseigner : Ex: RC/DLA/202X/B/...]
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6e7a72] block">Numéro d'Identifiant Fiscal (NIF) :</span>
                    <span className="font-mono text-[#a06800] bg-[#ecf6ed] px-1.5 py-0.5 rounded text-[11px]">
                      [À renseigner : Numéro fiscal DGI Cameroun]
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#6e7a72] block">Siège d'exploitation :</span>
                    <span className="font-bold text-[#151e18]">Douala (Zone Akwa / Bonanjo), Région du Littoral, République du Cameroun</span>
                  </div>
                  <div>
                    <span className="text-[#6e7a72] block">Téléphone d'assistance :</span>
                    <span className="font-bold text-[#006946]">+237 654 47 57 64</span>
                  </div>
                  <div>
                    <span className="text-[#6e7a72] block">WhatsApp officiel :</span>
                    <span className="font-bold text-[#006946]">+237 686 94 26 22</span>
                  </div>
                  <div>
                    <span className="text-[#6e7a72] block">Directeur de la Publication :</span>
                    <span className="font-mono text-[#a06800] bg-[#ecf6ed] px-1.5 py-0.5 rounded text-[11px]">
                      [À compléter par le représentant légal]
                    </span>
                  </div>
                </div>
              </section>

              <section className="space-y-2 bg-white p-4 rounded-2xl border border-[#e1ebe1]">
                <h3 className="font-bold text-sm text-[#151e18]">2. Hébergement de l'Application</h3>
                <div className="text-xs space-y-1">
                  <p>
                    <strong>Hébergeur d'infrastructure Cloud :</strong> Google Cloud Platform / Firebase Hosting (Environnement Google AI Studio Build).
                  </p>
                  <p>
                    <strong>Localisation des centres de données :</strong> Centres de calcul certifiés ISO 27001 et SOC 2.
                  </p>
                  <p className="text-[11px] text-[#6e7a72]">
                    [À adapter par l'exploitant si le nom de domaine personnalisé final est hébergé sur une infrastructure distincte au Cameroun ou en France].
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: CONDITIONS GÉNÉRALES D'UTILISATION */}
          {activeTab === 'cgu' && (
            <div className="space-y-4">
              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">1. Objet de la Plateforme</h3>
                <p>
                  MboaFacile est une plateforme technologique d'intermédiation locale ayant pour mission de faciliter la mise en relation entre des particuliers ou entreprises ayant un besoin technique (plomberie, électricité, froid, serrurerie, maçonnerie, etc.) et des prestataires indépendants qualifiés intervenant à Douala et Yaoundé.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">2. Indépendance des Prestataires</h3>
                <p>
                  Les artisans et entreprises répertoriés exercent leur activité sous leur propre responsabilité juridique, fiscale et professionnelle, en toute indépendance. MboaFacile n'est ni employeur, ni sous-traitant des artisans. Le contrat de prestation de service ou d'intervention technique est conclu directement entre le client et l'artisan choisi.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">3. Vérification des Profils</h3>
                <p>
                  Le badge « Profil Vérifié CNI » atteste que l'artisan a communiqué un titre d'identité officiel valide (Carte Nationale d'Identité ou récépissé officiel) et que son lieu d'exercice ou atelier a fait l'objet d'un contrôle de cohérence. Cette vérification renforce la sécurité des usagers mais ne saurait dispenser le client des vérifications usuelles de bon sens sur place.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">4. Devis Gratuit et Sans Engagement</h3>
                <p>
                  La formulation d'une demande de devis sur MboaFacile est entièrement gratuite pour le client. Aucun frais n'est prélevé au stade de l'estimation. L'acceptation du devis final et des tarifs se fait d'un commun accord entre l'artisan et le client.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">5. Engagements et Usages Interdits</h3>
                <p>Il est strictement interdit aux utilisateurs et artisans :</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>De fournir des informations fausses, diffamatoires ou usurper l'identité d'un tiers.</li>
                  <li>De publier des avis factices, de complaisance ou rémunérés (tolérance zéro).</li>
                  <li>D'utiliser les coordonnées transmises pour du démarchage abusif ou du harcèlement.</li>
                  <li>De contourner les dispositifs de sécurité ou de tenter d'injecter des codes malveillants.</li>
                </ul>
              </section>
            </div>
          )}

          {/* TAB 4: PAIEMENTS, DEVIS & LITIGES */}
          {activeTab === 'litiges' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#bfecdc]/50 border border-[#006946]/30 text-[#006946]">
                <p className="font-bold text-xs">Paiements locaux sécurisés &amp; Réalité terrain au Cameroun</p>
                <p className="text-[11px] mt-0.5 text-[#3e4942]">
                  La politique tarifaire et de règlement est adaptée aux usages camerounais pour garantir la sérénité des deux parties.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">1. Modalités de Règlement</h3>
                <p>
                  Le montant des travaux convenu sur le devis est réglé directement à l'artisan après achèvement des travaux et constatation de bon fonctionnement par le client :
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Orange Money &amp; MTN Mobile Money :</strong> Paiement direct via le numéro professionnel de l'artisan (preuve de transaction traçable par SMS).</li>
                  <li><strong>Espèces en main propre :</strong> Remise contre reçu ou décharge signée.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">2. Règles relatives aux Acomptes &amp; Fournitures</h3>
                <p>
                  Pour les petites interventions et dépannages d'urgence (fuite simple, remplacement disjoncteur), <strong>aucun acompte sur la main-d'œuvre n'est exigible avant l'intervention</strong>.
                </p>
                <p>
                  Pour les chantiers nécessitant l'achat de matériel lourd (ex: compresseur de climatiseur neuf, câblage complet, sanitaires), l'artisan doit obligatoirement fournir une facture proforma ou devis détaillé du fournisseur avant déblocage d'un acompte dédié aux matériaux.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">3. Garantie d'Intervention &amp; Médiation Gratuite</h3>
                <p>
                  Chaque intervention validée bénéficie d'une garantie de suivi (30 à 60 jours selon le corps de métier). En cas de malfaçon ou de persistance de la panne :
                </p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li><strong>Signalement :</strong> Contactez le service d'assistance MboaFacile (WhatsApp 686 94 26 22 ou Appel 654 47 57 64) en mentionnant votre numéro de dossier.</li>
                  <li><strong>Constat contradictoire :</strong> L'artisan est immédiatement convoqué pour revenir constater et corriger gratuitement les malfaçons sans frais additionnels.</li>
                  <li><strong>Médiation :</strong> En cas de refus injustifié de l'artisan, celui-ci est suspendu du réseau MboaFacile et une solution alternative de reprise est étudiée.</li>
                </ol>
              </section>
            </div>
          )}

          {/* TAB 5: COOKIES & TRACEURS */}
          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <section className="space-y-2">
                <h3 className="font-bold text-sm text-[#151e18]">Gestion de vos Préférences de Confidentialité</h3>
                <p>
                  Nous stockons uniquement les données techniques strictement nécessaires dans le stockage local de votre navigateur (LocalStorage) afin de garantir que vous ne perdiez pas l'état de votre devis en cours et vos artisans favoris.
                </p>
                <div className="p-4 bg-white rounded-2xl border border-[#e1ebe1] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#151e18] block">Modifier mes consentements</span>
                      <span className="text-[11px] text-[#6e7a72]">Vous pouvez révoquer ou ajuster vos choix à tout instant.</span>
                    </div>
                    {onOpenCookiePreferences && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenCookiePreferences();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#006946] text-white font-bold text-xs hover:bg-[#16845b] transition-colors focus-visible:ring-2 focus-visible:ring-[#006946]"
                      >
                        Ouvrir le panneau de cookies
                      </button>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e1ebe1] bg-[#f2fcf2] flex items-center justify-between text-xs">
          <span className="text-[#6e7a72]">MboaFacile Cameroun • Dernière mise à jour : Février 2025</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#006946] text-white font-bold hover:bg-[#16845b] transition-colors focus-visible:ring-2 focus-visible:ring-[#006946]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
