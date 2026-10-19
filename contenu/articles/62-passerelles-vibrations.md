---
titre: Vibrations des passerelles sous les piétons
ordre: 62
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), A.2.9.3 et annexe H (tableaux H.1 et H.2) ; EN 1991-2:2023, article 7 et annexe G ((G.1) à (G.5), tableaux G.1 et G.2) ; textes lus le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1990:2002 (version française) lue sur le texte le 2026-10-19, mais A2.4.3.2 relève de l’A1:2005 ; A1:2005 et EN 1991-2:2003 (5.7) cités de mémoire, ces textes n’étant pas détenus et restant à relire ; AN-LU:2020 de l’EN 1990:2002+A1:2005 (A1.4.2(2)) lue sur le texte le 2026-10-19 ; état d’amendement non encore vérifié.
redige: 2026-10-18
revise: 2026-10-19
resume: La première génération demandait de vérifier le confort des passerelles sans fournir de modèle de charge. La deuxième génération fournit des classes de trafic, des niveaux de confort et des charges harmoniques, dans l’esprit des guides Sétra et HiVoSS.
motscles: els, actions
historique:
  - 2026-10-18 : première rédaction.
  - 2026-10-19 : corps de l’EN 1990:2002 lu sur le texte ; A2.4.3.2 (A1:2005) et l’EN 1991-2:2003, non détenus, restent cités de mémoire.
  - 2026-10-19 : section sur les fréquences critiques de l’annexe nationale luxembourgeoise (A1.4.2(2)).
---

## Ce qui change

**En 2002–2003**, l’EN 1990 (A2.4.3.2) donnait des accélérations maximales recommandées et demandait une vérification si la fréquence propre était basse ; l’EN 1991-2 (5.7) renvoyait à des modèles dynamiques à définir pour le projet. Les bureaux d’études utilisaient en pratique le guide du Sétra (2006) ou le guide européen HiVoSS (2008).

**En 2023**, le dispositif est complet :

- **Plage critique** (A.2.9.3.3) : vibrations verticales et longitudinales à vérifier si la fréquence propre est comprise entre 1,25 et 2,3 Hz, voire jusqu’à 4,6 Hz pour un pont sensible (second harmonique) ; vibrations latérales entre 0,5 et 1,2 Hz.
- **Niveaux de confort** (tableau H.1) : CL3 (maximal) à CL1 (minimal) et CL0 (sans limite), chacun avec une accélération limite verticale et horizontale.
- **Classes de trafic** (tableau G.1) : TC1 à TC5, du trafic très faible au trafic exceptionnellement dense, avec pour chacune une densité de flux, un groupe de piétons et un groupe de joggeurs.
- **Situations de projet** (tableau H.2) : par exemple, l’inauguration une fois dans la vie de l’ouvrage, le trafic quotidien, le joggeur occasionnel, chacun associé à une classe de trafic et à un niveau de confort.
- **Charges harmoniques** (G.4 à G.7) : flux de piétons, piéton ou groupe, joggeur ou groupe, excitation intentionnelle (cette dernière vérifiée à l’ELU en situation accidentelle).

Le modèle de flux est une charge répartie harmonique :

$$
p_w(t) = P_w\,\cos(2\pi f_s t)\,n'\,\psi_w \qquad \text{(G.1)}
$$

avec $P_w$ = 280 N verticalement, et un nombre équivalent de piétons synchronisés $n' = 10.8\,\sqrt{\xi\,n}/S$ pour une densité inférieure à 1 P/m² (G.2), $n' = 1.85\,\sqrt{n}/S$ au-delà (G.3).

## Pourquoi

Des passerelles légères ont connu des vibrations gênantes, parfois spectaculaires (vibrations latérales à l’ouverture de passerelles très fréquentées). Les guides nationaux et européens qui en ont tiré des méthodes sont désormais intégrés aux Eurocodes. L’amortissement intervient deux fois : il réduit la réponse, mais il entre aussi dans $n'$, parce qu’une structure peu amortie synchronise moins de piétons.

## L’exemple type : passerelle en béton de 40 m

Passerelle sur deux appuis, portée 40 m, largeur 3 m, masse 6000 kg/m, amortissement 1,5 %, fréquence verticale 1,9 Hz (dans la plage critique, $\psi_w$ = 1). Trafic quotidien dense (TC3, 0,5 P/m²) ; confort moyen visé (CL2, 1,0 m/s²).

```exemple
{
  "nom": "passerelle-beton",
  "mecanisme": "passerelle-flux",
  "entree": { "f": 1.9, "L": 40, "b": 3, "m": 6000, "xi": 0.015, "d": 0.5, "psiw": 1, "alim": 1.0 },
  "attendus": {
    "en1991-2-2023/flux.sollicitation": "0,51",
    "en1991-2-2023/flux.p": "23,9"
  }
}
```

La charge harmonique vaut {{passerelle-beton:en1991-2-2023/flux.p}} N/m² et l’accélération à la résonance {{passerelle-beton:en1991-2-2023/flux.sollicitation}} m/s² : le confort CL2 est atteint, le confort maximal CL3 (0,5 m/s²) est tout juste dépassé. La même passerelle en acier (2000 kg/m, amortissement 0,5 %) dépasserait 2,6 m/s² : il faudrait un amortisseur.

{{calculateur:passerelle-beton}}

## Au Luxembourg : deux fréquences critiques

L’AN-LU:2020 (A1.4.2(2)) admet de négliger l’amplification par résonance si les fréquences propres de la passerelle dépassent 4,5 Hz pour les vibrations verticales et 3,5 Hz pour les vibrations horizontales. Ces seuils couvrent le premier et le second harmonique de la marche. En vertical, 4,5 Hz est proche de la borne de 4,6 Hz que 2023 retient pour un pont sensible au second harmonique ; en latéral, 3,5 Hz est nettement plus prudent que la borne de 1,2 Hz. Ils seront confrontés à A2.4.3.2 de l’EN 1990:2002+A1:2005 dès que ce texte sera détenu.

## L’effet sur une note de calcul existante

- Une passerelle justifiée selon le Sétra ou HiVoSS l’a été par une méthode voisine ; il faut reprendre les classes de trafic, les niveaux de confort et les situations de projet du maître d’ouvrage dans les termes de 2023.
- L’excitation intentionnelle (vandalisme) devient une situation accidentelle à vérifier à l’ELU.

## Ce qu’il faudra vérifier dans l’annexe nationale

- L’application des annexes H de l’EN 1990 et G de l’EN 1991-2.
- Les limites de la plage critique et les niveaux de confort.
