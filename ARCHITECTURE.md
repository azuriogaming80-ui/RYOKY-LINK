# 📐 PLAN D’ARCHITECTURE COMPLET
## Fladder (Flutter) → RYOKY-LINK (Vue 3 + TypeScript)

---

## 📁 STRUCTURE DES DOSSIERS

```text
📁 src/
┣ 📁 types/                     # Interfaces TypeScript (ex-models/)
┃ ┣ 📜 jellyfin.ts              # Types API Jellyfin
┃ ┣ 📜 item.ts                  # ItemBaseModel, MediaItem, etc.
┃ ┣ 📜 user.ts                  # User, Account, Credentials
┃ ┣ 📜 playback.ts              # Playback, MediaStreams, Segments
┃ ┣ 📜 settings.ts              # Settings, Preferences
┃ ┣ 📜 library.ts               # Library, Collection, View
┃ ┗ 📜 index.ts                 # Re-exports
┣ 📁 stores/                    # Pinia stores (ex-providers/)
┃ ┣ 📜 auth.ts                  # Auth, login, logout, token
┃ ┣ 📜 user.ts                  # User info, settings, profiles
┃ ┣ 📜 jellyfin.ts              # Service API Jellyfin
┃ ┣ 📜 dashboard.ts             # Dashboard data (resume, nextUp, views)
┃ ┣ 📜 library.ts               # Library browsing, filters, search
┃ ┣ 📜 playback.ts              # Player state, controls, media
┃ ┣ 📜 settings.ts              # App settings, client settings
┃ ┣ 📜 views.ts                 # Views/ libraries list
┃ ┣ 📜 search.ts                # Global search
┃ ┣ 📜 favourites.ts            # Favourites/ likes
┃ ┣ 📜 connectivity.ts          # Online/offline state
┃ ┗ 📜 index.ts                 # Store initialization
┣ 📁 services/                  # Services métier purs
┃ ┣ 📜 jellyfin-api.ts          # HTTP client (axios/fetch)
┃ ┣ 📜 image-service.ts         # URL generation for posters/backdrops
┃ ┣ 📜 playback-service.ts      # Player logic, transcoding
┃ ┣ 📜 sync-service.ts          # Offline sync (IndexedDB)
┃ ┗ 📜 local-storage.ts         # localStorage wrapper
┣ 📁 composables/               # Composables Vue 3 (logique réutilisable)
┃ ┣ 📜 useJellyfin.ts           # Accès API générique
┃ ┣ 📜 usePlayback.ts           # Contrôles player
┃ ┣ 📜 useImageUrl.ts           # Génération URLs images
┃ ┣ 📜 useResponsive.ts         # Breakpoints mobile/tablet/desktop
┃ ┣ 📜 useKeyboardShortcuts.ts  # Raccourcis clavier player
┃ ┣ 📜 useMediaSegments.ts      # Skip intro/credits
┃ ┗ 📜 useFullscreen.ts         # Fullscreen API
┣ 📁 components/                # Composants Vue
┃ ┣ 📁 layout/
┃ ┃ ┣ 📜 AppLayout.vue          # Layout principal (sidebar + content)
┃ ┃ ┣ 📜 Sidebar.vue            # Navigation latérale
┃ ┃ ┣ 📜 TopBar.vue             # Barre supérieure
┃ ┃ ┗ 📜 BottomNav.vue          # Navigation mobile
┃ ┣ 📁 media/
┃ ┃ ┣ 📜 PosterCard.vue         # Carte poster (film/série)
┃ ┃ ┣ 📜 PosterRow.vue          # Ligne de posters scrollable
┃ ┃ ┣ 📜 PosterGrid.vue         # Grille de posters
┃ ┃ ┣ 📜 MediaBanner.vue        # Bannière hero (dashboard top)
┃ ┃ ┣ 📜 MediaInfo.vue          # Info média (titre, année, rating)
┃ ┃ ┣ 📜 ProgressBar.vue        # Barre de progression visionnage
┃ ┃ ┣ 📜 EpisodeCard.vue        # Carte épisode
┃ ┃ ┗ 📜 SeasonList.vue         # Liste des saisons
┃ ┣ 📁 player/
┃ ┃ ┣ 📜 VideoPlayer.vue        # Composant player principal
┃ ┃ ┣ 📜 PlayerControls.vue     # Contrôles overlay
┃ ┃ ┣ 📜 PlayerOverlay.vue      # Overlay (titre, boutons)
┃ ┃ ┣ 📜 ProgressBar.vue        # Barre de progression player
┃ ┃ ┣ 📜 VolumeControl.vue      # Contrôle volume
┃ ┃ ┣ 📜 QualitySelector.vue    # Sélecteur qualité
┃ ┃ ┣ 📜 SubtitleSelector.vue   # Sélecteur sous-titres
┃ ┃ ┣ 📜 AudioSelector.vue      # Sélecteur piste audio
┃ ┃ ┣ 📜 SkipSegment.vue        # Bouton skip intro/credits
┃ ┃ ┗ 📜 KeyboardHandler.vue    # Handler raccourcis
┃ ┣ 📁 detail/
┃ ┃ ┣ 📜 ItemDetail.vue         # Page détail item
┃ ┃ ┣ 📜 CastList.vue           # Liste acteurs
┃ ┃ ┣ 📜 RelatedItems.vue       # Items similaires
┃ ┃ ┣ 📜 Overview.vue           # Synopsis
┃ ┃ ┗ 📜 ActionButtons.vue      # Fav, vu, liste, etc.
┃ ┣ 📁 library/
┃ ┃ ┣ 📜 LibraryView.vue        # Vue bibliothèque
┃ ┃ ┣ 📜 FilterBar.vue          # Barre filtres
┃ ┃ ┣ 📜 SortSelector.vue       # Sélecteur tri
┃ ┃ ┗ 📜 ViewToggle.vue         # Toggle grille/liste
┃ ┣ 📁 search/
┃ ┃ ┣ 📜 SearchBar.vue          # Barre recherche
┃ ┃ ┣ 📜 SearchResults.vue      # Résultats recherche
┃ ┃ ┗ 📜 SearchFilters.vue      # Filtres recherche
┃ ┣ 📁 settings/
┃ ┃ ┣ 📜 SettingsPanel.vue      # Panel settings
┃ ┃ ┣ 📜 PlayerSettings.vue     # Settings player
┃ ┃ ┣ 📜 AppearanceSettings.vue # Settings apparence
┃ ┃ ┗ 📜 ServerSettings.vue     # Settings serveur
┃ ┗ 📁 ui/                      # Composants UI génériques
┃   ┣ 📜 Button.vue
┃   ┣ 📜 Modal.vue
┃   ┣ 📜 LoadingSpinner.vue
┃   ┣ 📜 EmptyState.vue
┃   ┗ 📜 ErrorBoundary.vue
┣ 📁 views/                     # Pages (routées)
┃ ┣ 📜 LoginView.vue            # Connexion
┃ ┣ 📜 DashboardView.vue        # Accueil
┃ ┣ 📜 LibraryView.vue          # Bibliothèque
┃ ┣ 📜 ItemDetailView.vue       # Détail item
┃ ┣ 📜 PlayerView.vue           # Lecteur plein écran
┃ ┣ 📜 SearchView.vue           # Recherche
┃ ┣ 📜 FavouritesView.vue       # Favoris
┃ ┣ 📜 SettingsView.vue         # Paramètres
┃ ┗ 📜 LiveTvView.vue           # TV en direct
┣ 📁 router/
┃ ┗ 📜 index.ts                 # Vue Router config
┣ 📁 assets/                    # Fonts, images, icons
┣ 📁 styles/                    # CSS global, variables, themes
┣ 📁 utils/                     # Fonctions utilitaires
┣ 📜 App.vue                    # Root component
┗ 📜 main.ts                    # Entry point

📁 public/
📜 index.html
📜 package.json
📜 vite.config.ts
📗 tsconfig.json
