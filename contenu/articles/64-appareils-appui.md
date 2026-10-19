---
titre: Bases de calcul des appareils d’appui
ordre: 64
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), annexe G (normative), formules (G.1) à (G.8) et tableau G.3 lus sur le texte le 2026-10-18, sans autre amendement ni corrigendum pris en compte ; première génération : règles de l’EN 1337-1:2000, non détenue, citée de mémoire ; état d’amendement non encore vérifié.
redige: 2026-10-18
revise: 2026-10-18
resume: Les règles de calcul des efforts et des déplacements des appareils d’appui quittent la norme de produit EN 1337-1 pour une annexe normative de l’EN 1990, avec un schéma type des appareils d’appui, une incertitude géométrique de ± 20 mm et des coefficients de frottement modulés selon le nombre d’appareils.
motscles: actions, analyse-structurale
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Une annexe normative nouvelle.** En première génération, les règles de calcul des forces et des mouvements d’appareils d’appui se trouvaient pour l’essentiel dans l’EN 1337-1, norme de produit. L’annexe G de l’EN 1990 les reprend comme bases de calcul des ponts ; l’EN 1337 (ou un document d’évaluation européen) reste la spécification du produit.

**Ce que contient l’annexe G :**

- un **plan d’agencement** et un **schéma des appareils d’appui** au format type (tableaux G.1 et G.2) : réactions et déplacements caractéristiques par action, puis valeurs de calcul à l’ELU et à l’ELS ;
- la règle que les appareils ne doivent pas être tendus sous la combinaison caractéristique ;
- un **espace de levage** d’au moins 10 mm pour le remplacement ;
- les **incertitudes** à couvrir : installation, phasage, température initiale et sa plage (EN 1991-1-5), tassements, position des éléments, avec une incertitude géométrique de ± 20 mm sur la position de l’appareil (G.7.4.2) ;
- la **force de frottement** des appareils à glissement, $F_{bd} = \gamma_{Sd}\,\mu_d\,N_d$ (G.1) avec $\mu_d = \mu_{max}$ (G.4), et la **force élastique** des appareils en élastomère, $F_{bd} = \gamma_{Sd}\,(G_d\,A_{eff}/t_{el,eff})\,u_d$ (G.3) ;
- les **déplacements de calcul** de contraction et de dilatation ((G.7), (G.8)).

**Frottements opposés.** Quand les appareils situés de part et d’autre d’un point fixe frottent en sens contraires, il est permis d’utiliser des coefficients modifiés :

$$
\mu_d = 0.5\,\mu_{max}\,(1 + \alpha_n) \qquad \text{(G.5)} \qquad\qquad \mu_{d,fav} = 0.5\,\mu_{max}\,(1 - \alpha_n) \qquad \text{(G.6)}
$$

avec $\alpha_n$ = 1 jusqu’à 4 appareils, $(16 - n)/12$ entre 4 et 10, et 0,5 au-delà (tableau G.3).

## Pourquoi

Les efforts sur les appareils d’appui dépendent du calcul de la structure (combinaisons, températures, fluage) autant que du produit. Les placer dans l’EN 1990 rend le concepteur du pont responsable de leur détermination et fixe un format d’échange commun avec le fournisseur.

## L’exemple type : point fixe d’un viaduc

Un viaduc a un point fixe sur une pile centrale ; six appareils à glissement de part et d’autre, chacun sous 2000 kN, avec $\mu_{max}$ = 0,03. Sous une variation de température, les frottements de chaque côté s’opposent.

```exemple
{
  "nom": "point-fixe",
  "mecanisme": "appui-frottement",
  "entree": { "mumax": 0.03, "Nd": 2000, "nu": 6, "nf": 6 },
  "attendus": {
    "en1990-2023/sans-compensation.sollicitation": "360",
    "en1990-2023/compense.sollicitation": "300",
    "en1990-2023/compense.μ_d": "0,0275"
  }
}
```

Sans compensation, le point fixe reprend {{point-fixe:en1990-2023/sans-compensation.sollicitation}} kN. Avec les coefficients modifiés ($\mu_d$ = {{point-fixe:en1990-2023/compense.μ_d}} d’un côté, 0,0025 de l’autre), il reprend {{point-fixe:en1990-2023/compense.sollicitation}} kN : la règle admet une compensation partielle, jamais totale.

{{calculateur:point-fixe}}

## L’effet sur une note de calcul existante

- La note du pont doit produire le schéma des appareils d’appui au format des tableaux G.1 et G.2.
- Les déplacements intègrent l’incertitude géométrique de ± 20 mm et la plage de température initiale.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les valeurs de $\gamma_{Sd}$, de l’espace de levage, de $\Delta d$ et de $k_\varphi$ ; les formats des tableaux G.1 et G.2.
