# Génération des JDD

Alimenter le fichier .env à partir de sample.env
Exécuter `npm run generate-dataset`

# Exécution des test

## Pré-requis :

Faire tourner l'API en désactivant reCAPTCHA et MailJet. [PR #478](https://github.com/1024pix/pix/pull/478)

## Procédure :

```
npm ci
npm start
npm report
```

