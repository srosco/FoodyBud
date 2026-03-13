# Design Spec — Application de Tracking Alimentaire (MFP)
Date : 2026-03-13

## Contexte

Application web de tracking alimentaire personnelle (usage mono-utilisateur), style MyFitnessPal / Yazio. Accessible sur PC et smartphone via PWA.

---

## Stack technique

| Couche | Techno | Hébergement |
|--------|--------|-------------|
| Frontend | Angular PWA | Vercel (gratuit) |
| Backend | NestJS (TypeScript) | Railway Hobby (~0$/mois) |
| Base de données | PostgreSQL | Railway (inclus) |
| Scan produits | Open Food Facts API | Externe, gratuit |
| Lecture barcode | @zxing/browser | Dans le PWA |

**Railway sleep-on-idle :** acceptable pour usage perso. Un ping keep-alive (ex. cron UptimeRobot gratuit) peut être ajouté si la latence au réveil devient gênante.

---

## Architecture générale

```
[Angular PWA]  ←→  [NestJS REST API]  ←→  [PostgreSQL]
   Vercel              Railway              Railway
                           ↕
                   [Open Food Facts API]
                      (externe, gratuit)
```

### Flux scan barcode
1. PWA accède à la caméra (mobile) ou saisie manuelle (desktop)
2. Envoi du code-barres au backend NestJS
3. NestJS interroge Open Food Facts
4. Les données sont retournées au frontend pour **confirmation/édition** par l'utilisateur
5. L'utilisateur valide → sauvegarde en DB → aliment disponible dans la bibliothèque

**Gestion d'erreur OFF :**
- Produit non trouvé → message d'erreur + redirection vers le formulaire de création manuelle pré-rempli avec le code-barres
- OFF inaccessible → même comportement (fallback manuel)

**Hors-ligne :** non prévu (YAGNI).

---

## Modèle de données

### Food (aliment)
```
id              uuid PK
name            string
barcode         string?           -- null si aliment custom
source          enum(OFF, CUSTOM) -- OFF = Open Food Facts
created_at      timestamp
// Valeurs pour 100g
calories        float
proteins        float
carbs           float
fat             float
fiber           float
sugars          float
saturated_fat   float
salt            float
// Micronutriments optionnels (stockés tels quels depuis OFF)
vitamins        jsonb?            -- structure variable selon OFF
minerals        jsonb?            -- structure variable selon OFF
deleted_at      timestamp?        -- soft-delete
```

**Note vitamins/minerals :** valeurs affichées brutes (clé → valeur en g/mg). Pas de schema fixe côté Angular pour v1 — rendu générique (liste clé/valeur).

### Recipe (recette)
```
id              uuid PK
name            string
total_weight_g  float             -- poids total préparé (ex: 800g pour une casserole)
created_at      timestamp
recipe_items    RecipeItem[]
```

**Calcul nutritionnel d'une recette pour 100g :**
```
valeur_nutriment_pour_100g = sum(food.nutriment_pour_100g * recipeItem.quantity_g / 100) / total_weight_g * 100
```
Exemple : recette 800g, contient 200g de riz (3.5g protéines/100g) → contribution riz = 3.5 * 200/100 = 7g de protéines. Total recette = sum(contributions) / 800 * 100.

### RecipeItem
```
id              uuid PK
recipe_id       uuid → Recipe (CASCADE DELETE)
food_id         uuid → Food (RESTRICT — ne peut pas supprimer un aliment utilisé dans une recette)
quantity_g      float
```

### Meal (repas)
```
id              uuid PK
name            string?           -- optionnel, affiché dans le dashboard (ex: "Déj au bureau")
date            date
meal_type       enum(BREAKFAST, LUNCH, DINNER, SNACK)
created_at      timestamp
meal_items      MealItem[]
```

### MealItem
```
id              uuid PK
meal_id         uuid → Meal (CASCADE DELETE)
food_id         uuid? → Food (RESTRICT)
recipe_id       uuid? → Recipe (RESTRICT)
quantity_g      float
-- Contrainte applicative (NestJS) : food_id XOR recipe_id obligatoire
-- Contrainte DB : CHECK (
--   (food_id IS NOT NULL AND recipe_id IS NULL) OR
--   (food_id IS NULL AND recipe_id IS NOT NULL)
-- )
```

### Activity (activité physique)
```
id              uuid PK
name            string
date            date
calories_burned float
created_at      timestamp
```

### Goal (objectifs journaliers)
```
id              uuid PK DEFAULT gen_random_uuid()
singleton       boolean NOT NULL DEFAULT true UNIQUE  -- garantit une seule ligne
-- Stratégie upsert : INSERT ... ON CONFLICT (singleton) DO UPDATE SET ...
-- Seed initial via migration avec des valeurs par défaut raisonnables
calories        float DEFAULT 2000
proteins        float DEFAULT 150
carbs           float DEFAULT 250
fat             float DEFAULT 65
fiber           float DEFAULT 25
sugars          float DEFAULT 50
saturated_fat   float DEFAULT 20
salt            float DEFAULT 6
```

**Note :** Pas de table DailyLog — la synthèse journalière est calculée à la volée.

---

## API REST (contrat simplifié)

### Foods
```
GET    /foods?search=<query>   recherche insensible à la casse sur le nom ;
                               si query est une chaîne numérique → recherche barcode exact en OR ;
                               exclut toujours les enregistrements soft-deleted (deleted_at IS NOT NULL)
GET    /foods/:id
POST   /foods/scan             body: { barcode } → retourne les données OFF non sauvegardées
POST   /foods                  crée un aliment (après confirmation scan ou custom)
PATCH  /foods/:id
DELETE /foods/:id              soft-delete (deleted_at = now())
```

### Recipes
```
GET    /recipes
GET    /recipes/:id
POST   /recipes
PATCH  /recipes/:id
DELETE /recipes/:id    soft-delete (deleted_at) — bloqué si la recette est référencée dans un MealItem actif
```

**Note :** `Recipe` reçoit aussi un champ `deleted_at timestamp?` (même stratégie que `Food`). Les recettes soft-deleted n'apparaissent plus dans la bibliothèque mais les MealItems existants les référençant restent intacts.

### Meals
```
GET    /meals?date=YYYY-MM-DD
GET    /meals/:id
POST   /meals
PATCH  /meals/:id
DELETE /meals/:id
```

### Activities
```
GET    /activities?date=YYYY-MM-DD
POST   /activities
PATCH  /activities/:id
DELETE /activities/:id
```

### Goals
```
GET    /goals
PUT    /goals                  upsert
```

### Summary
```
GET    /summary?date=YYYY-MM-DD
```
Réponse :
```json
{
  "date": "2026-03-13",
  "totals": { "calories": 1450, "proteins": 82, "carbs": 160, "fat": 45, "fiber": 18 },
  "byMealType": {
    "BREAKFAST": { "calories": 400, "proteins": 20, "carbs": 50, "fat": 12, "fiber": 5 },
    "LUNCH":     { "calories": 650, "proteins": 40, "carbs": 70, "fat": 22, "fiber": 8 },
    "DINNER":    { "calories": 350, "proteins": 18, "carbs": 35, "fat": 10, "fiber": 4 },
    "SNACK":     { "calories": 50,  "proteins": 4,  "carbs": 5,  "fat": 1,  "fiber": 1 }
  },
  "meals": [
    {
      "id": "uuid",
      "name": "Déj au bureau",
      "meal_type": "LUNCH",
      "items": [
        {
          "id": "uuid",
          "quantity_g": 150,
          "food": { "id": "uuid", "name": "Riz cuit", "calories": 130, "proteins": 2.7, "carbs": 28, "fat": 0.3, "fiber": 0.4 },
          "recipe": null,
          // valeurs nutritionnelles de l'item = food/recipe valeur_pour_100g * quantity_g / 100
          "computed": { "calories": 195, "proteins": 4.05, "carbs": 42, "fat": 0.45, "fiber": 0.6 }
        }
      ]
    }
  ],
  "activities": [ { "id": "uuid", "name": "Marche", "calories_burned": 200 } ],
  "goals": { "calories": 2000, "proteins": 150, "carbs": 250, "fat": 65, "fiber": 25 }
}
```

**Calcul des valeurs d'un MealItem :** `SummaryModule` recompute à la volée depuis les lignes `RecipeItem` pour les items de type recette. Pas de valeur stockée.

**Note calories activités :** affichées **séparément** (calories brûlées), non soustraites du total. Dashboard : "Consommé : 1450 kcal | Brûlé : 200 kcal".

**Dashboard vs Journal :** le dashboard utilise uniquement `totals`, `byMealType`, `activities` et `goals`. Le champ `meals` (détail des items) est utilisé uniquement dans une future vue détail (hors-scope v1 — disponible dans la réponse API mais non affiché sur le dashboard).

---

## Fonctionnalités

### Aliments
- Scanner un code-barres → confirmation/édition → sauvegarde
- Créer un aliment custom (nom + macros obligatoires + micros optionnels)
- Bibliothèque : liste + recherche par nom (insensible à la casse), sans pagination pour v1
- Modifier / supprimer (soft-delete) un aliment

### Recettes
- Créer une recette : nom, poids total, ingrédients (aliments + quantités)
- Calcul automatique des valeurs nutritionnelles pour 100g
- Modifier / supprimer une recette
- Bibliothèque de recettes

### Repas
- Créer un repas : date, type, nom optionnel
- Ajouter des aliments individuels depuis la bibliothèque (quantité en grammes)
- Ajouter des recettes depuis la bibliothèque (quantité en grammes)
- Modifier / supprimer un repas

### Activités
- Ajouter une activité : nom, date, calories brûlées
- Modifier / supprimer une activité

### Objectifs
- Configurer les cibles journalières (calories, macros, fibres, sel, sucres, graisses saturées)

### Dashboard (page principale)
- Anneau de progression calories (consommées / objectif)
- Macros du jour : totaux agrégés (protéines, glucides, lipides, fibres)
- Détail par période : **macros agrégées** par meal_type (pas de liste détaillée d'items)
- Activités du jour avec calories brûlées (affiché séparément)
- Bouton rapide "Ajouter un repas"

### Journal
- Vue calendrier pour naviguer entre les jours
- Clic sur une date → redirige vers le dashboard filtré sur cette date (`/?date=YYYY-MM-DD`)

---

## Navigation (pages)

```
/                      Dashboard — synthèse du jour (param ?date= pour jours passés)
/journal               Vue calendrier
/aliments              Bibliothèque d'aliments (liste + recherche)
/aliments/nouveau      Créer un aliment custom
/aliments/:id/edit     Modifier un aliment
/recettes              Bibliothèque de recettes
/recettes/nouveau      Créer une recette
/recettes/:id/edit     Modifier une recette
/repas/nouveau         Créer un repas
/repas/:id/edit        Modifier un repas
/activites/nouveau     Ajouter une activité
/activites/:id/edit    Modifier une activité
/objectifs             Configurer les objectifs
```

---

## Structure du code

### NestJS — modules
```
FoodsModule      → CRUD aliments + intégration Open Food Facts
RecipesModule    → CRUD recettes + calcul nutritionnel
MealsModule      → CRUD repas + meal_items + validation XOR
ActivitiesModule → CRUD activités
GoalsModule      → lecture/upsert objectifs
SummaryModule    → calcul synthèse journalière
```

### Angular — structure
```
core/
  services/        → HTTP clients, interceptors
features/
  dashboard/       → synthèse jour + navigation date
  journal/         → calendrier
  foods/           → bibliothèque + create/edit + scan
  recipes/         → bibliothèque + create/edit
  meals/           → create/edit + food-picker
  activities/      → create/edit
  goals/           → formulaire objectifs
shared/
  components/      → food-picker, macro-bar, progress-ring...
  models/          → interfaces TypeScript
```

---

## Hors-scope v1

- Authentification / multi-utilisateurs
- Suivi du poids / mensurations
- Mode hors-ligne
- Notifications / rappels
- Import/export de données
- App native mobile (PWA suffit)
- Pagination des listes
- Historique des repas (vue dédiée) — accessible via journal uniquement
