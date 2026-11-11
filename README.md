# One-Board — version application

Ce dossier contient tout ce qu'il faut pour transformer One-Board en vraie application :

- **PWA** : s'installe depuis le navigateur (Android, iPhone, ordinateur), fonctionne hors ligne.
- **Application native** (Android / iOS) via Capacitor, avec de **vrais rappels** même application fermée.

```
www/            ← le site prêt à publier (index.html, manifeste, service worker, icônes)
src/            ← le code source de l'application (one-board.html)
build.py        ← régénère www/index.html depuis src/
capacitor.config.json, package.json   ← pour la version native
icon-source-1024.png                  ← icône d'origine (pour les stores)
```

Après toute modification de `src/one-board.html`, relance `python3 build.py`.

## 1. Mettre l'application en ligne (PWA) — 5 minutes, gratuit

Il faut un site en **HTTPS** (obligatoire pour installer l'appli et recevoir des notifications).
Le plus simple : glisser le dossier `www/` sur l'un de ces services.

- **Netlify** : app.netlify.com/drop, glisse le dossier `www`. Tu obtiens une adresse `https://….netlify.app`.
- **Cloudflare Pages** ou **GitHub Pages** : mets le contenu de `www/` à la racine du dépôt.

Ensuite, sur le téléphone, ouvre l'adresse :
- **Android (Chrome)** : menu ⋮ → « Installer l'application ».
- **iPhone (Safari)** : bouton Partager → « Sur l'écran d'accueil ». Les notifications web exigent iOS 16.4 ou plus, et l'application doit être ajoutée à l'écran d'accueil.

Pour tester en local : `python3 -m http.server 8080 --directory www`, puis http://localhost:8080.

### Ce que les rappels font en version web
Réglages → Rappels. Ils partent **tant que l'application est ouverte** (même en arrière-plan, mais pas si le système la ferme). Pour des rappels application fermée, il faut la version native ci-dessous.

## 2. Version native avec rappels programmés (Capacitor)

Pré-requis : Node.js 18+ ; pour Android, Android Studio ; pour iPhone, un Mac avec Xcode (et un compte Apple Developer, 99 $/an, pour publier).

```bash
npm install
npx cap add android      # et/ou : npx cap add ios
npm run android          # construit, synchronise et ouvre Android Studio (ios : npm run ios)
```

Dans Android Studio : brancher un téléphone → ▶ Run. Pour publier : Build → Generate Signed Bundle (Google Play, 25 $ une fois).

Le nom de l'application et son identifiant se changent dans `capacitor.config.json` (`appId` : `app.oneboard.tracker`, à remplacer par le tien avant publication ; il ne pourra plus changer ensuite).

### Rappels natifs : ce qui est programmé
- Rappel quotidien à l'heure choisie (14 prochains jours, sauté si tout est coché ou en mode vacances)
- Alerte « île en danger » 24 h puis 6 h avant la destruction
- Fin de session de focus et fin de pause

Le planning est recalculé à chaque ouverture et à chaque action. Si l'application n'est pas ouverte pendant plus de 14 jours, les rappels quotidiens s'arrêtent.

Sur **Android 12+**, si les rappels arrivent avec du retard, ajoute dans `android/app/src/main/AndroidManifest.xml` :
`<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />`
Sur Android 13+, l'application demande la permission de notifier au moment d'activer les rappels.

## Données et sauvegarde
Les données restent sur l'appareil (stockage local). Réglages → Sauvegarde exporte un fichier `.json` et le réimporte.
Dans la version native, l'export ouvre la zone de copie (pas de téléchargement de fichier) : copie le texte dans un fichier `.json`.
La synchronisation entre appareils (comptes) n'est pas incluse : les données sont déjà préparées pour (identifiants et dates de modification), mais il manque le service en ligne.

## Limites connues
- Pas testé sur un vrai téléphone ni sur iPhone : tests faits dans un navigateur simulé (installation, hors ligne, rappels).
- Les polices viennent de Google Fonts : la première ouverture se fait en ligne, ensuite elles sont mises en cache.
- L'icône est un dessin simple (`icon-source-1024.png`) : remplace-la par la tienne si tu veux, puis régénère les tailles.

## 3. GitHub
Les workflows sont déjà dans `.github/workflows/` :
- **pages.yml** : publie `www/` sur GitHub Pages à chaque modification (Settings → Pages → Source : « GitHub Actions »).
- **android.yml** : onglet Actions → « Build Android APK » → Run workflow, puis télécharge `one-board-debug-apk` (version de test, à installer en autorisant les sources inconnues).
