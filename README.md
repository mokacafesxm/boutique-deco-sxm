# Maison SXM — Boutique en ligne

Maquette codée (Next.js + Tailwind) de la page d'accueil/catalogue. Pas encore connectée à Notion ni à Stripe — c'est la prochaine étape une fois la structure validée.

## 1. Tester en local

Il faut Node.js installé (version 18 ou plus).

```
npm install
npm run dev
```

Puis ouvre http://localhost:3000

## 2. Créer le repo GitHub

```
git init
git add .
git commit -m "Premier jet : page catalogue/accueil"
```

Sur GitHub, crée un nouveau repo vide (sans README ni .gitignore, pour éviter les conflits), par exemple `mokacafesxm/boutique-deco-sxm`. Puis :

```
git remote add origin https://github.com/mokacafesxm/boutique-deco-sxm.git
git branch -M main
git push -u origin main
```

## 3. Importer sur Vercel

1. Sur vercel.com, "Add New" → "Project"
2. Sélectionne le repo `boutique-deco-sxm`
3. Vercel détecte automatiquement Next.js, laisse les réglages par défaut
4. "Deploy" — le site est en ligne en ~1 minute sur une URL `*.vercel.app`

## 4. Ajouter le nom de domaine

Dans le projet Vercel : Settings → Domains → ajoute ton nom de domaine. Vercel te donne les enregistrements DNS à configurer chez ton registrar (OVH, Namecheap, etc.). Le HTTPS se met en place automatiquement une fois les DNS propagés.

## Prochaines étapes

- Connecter Notion comme base produits (API routes Next.js)
- Intégrer Stripe Checkout pour le panier
- Ajouter le routing FR/EN
- Remplacer "Maison SXM" par le vrai nom de la marque
