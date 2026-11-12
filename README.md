# 🤳 Keskecé ?

Jeu de devinettes pour téléphone, inspiré de Heads Up / Olé mains.
Une personne met le téléphone sur son front, les autres lui font deviner le mot affiché.

## Comment jouer
1. Ouvre le jeu sur ton téléphone, en mode paysage.
2. Choisis un thème et appuie sur « C'est parti ».
3. Mets le téléphone sur ton front, écran tourné vers les autres.
4. Écran vers le sol : mot trouvé ✅. Écran vers le plafond : je passe ⏭️.
5. Un maximum de mots en 1 minute !

Si l'inclinaison ne marche pas, touche la moitié gauche de l'écran pour passer et la moitié droite pour valider.

## Thèmes
Mime · Célébrités · Culture française · Devine la chanson · Marques · Netflix & Chill · Stars françaises · Sports · Métiers

## Personnaliser
Les mots et les thèmes sont dans `data.json`. Pour ajouter un mot, complète la liste `w` d'un thème. Pour créer un thème, copie un bloc existant et change son nom (`n`), son emoji (`e`), sa couleur (`c`) et ses mots. La durée d'une partie se règle avec `DURATION` dans `game.js`.

## Lancer en local
`data.json` est chargé avec `fetch`, il faut donc un petit serveur :

    python3 -m http.server

Puis ouvre http://localhost:8000.

## Hébergement
Site statique (HTML, CSS, JS, JSON), compatible GitHub Pages. Le HTTPS est nécessaire pour accéder aux capteurs de mouvement, et GitHub Pages le fournit.

## Fichiers
- `index.html` : structure des écrans
- `style.css` : design
- `game.js` : logique du jeu et détection de l'inclinaison
- `data.json` : thèmes et mots
