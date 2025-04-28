<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# 🕵️‍♂️ Détection de Fraudes à l’Aide des Graphes dans des Systèmes Financiers

## 📌 Contexte du Projet

Ce projet vise à identifier des comportements frauduleux dans des systèmes financiers complexes à l'aide de **graphes** et d'algorithmes de **machine learning**, en particulier ceux liés à la **détection d’anomalies**.

## 🎯 Objectif Principal

Mettre en œuvre une **approche basée sur les graphes** pour modéliser les transactions financières et identifier automatiquement les activités suspectes ou frauduleuses.

## 🧠 Technologies & Concepts Utilisés

- **Python** pour le développement  
- **NetworkX** pour la construction et l’analyse des graphes  
- **Scikit-learn** pour les algorithmes de détection d’anomalies (Isolation Forest, etc.)  
- **Pandas** & **NumPy** pour la manipulation des données  
- **Matplotlib / Seaborn** pour la visualisation  

Concepts :
- Graphe orienté / non orienté  
- Centralité (degré, intermédiarité…)  
- Comportements anormaux (anomalies)  
- Apprentissage non supervisé  

## 📊 Données

- Transactions financières simulées ou issues d’un dataset public (ex : European card fraud dataset, PaySim, etc.)
- Chaque transaction inclut :
  - ID source
  - ID destination
  - Montant
  - Date / heure
  - Type de transaction

## 🧩 Approche par Graphe

1. **Modélisation** des entités comme des nœuds (clients, comptes)  
2. **Création d’arêtes** entre nœuds selon les transactions  
3. **Calcul de métriques** de graphe pour chaque nœud ou arête :
   - Degré, centralité, densité locale  
4. **Détection d’anomalies** via :
   - Seuils définis manuellement  
   - Algorithmes de machine learning (ex. Isolation Forest)

## 📈 Exemple de Résultats

- Graphes de réseaux financiers illustrant les échanges  
- Nœuds suspects mis en évidence par couleur  
- Taux de détection de fraude  
- Visualisation des communautés ou clusters anormaux  

## 🔮 Prochaine étape

- Intégration d’un algorithme **semi-supervisé** pour affiner la détection  
- Comparaison avec des approches traditionnelles (SVM, KMeans, etc.)  
- Interface simple pour visualiser les transactions frauduleuses  

>>>>>>> 17743004846558f35021b830d84acd3433908b71
