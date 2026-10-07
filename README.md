# groupedChord

Un package R pour dessiner des liens pondérés en cercle, avec des noms droits dans le prolongement des secteurs et des groupes inscrits sur un anneau extérieur. Les secteurs d’un groupe partagent sa couleur. Les rubans reprennent la couleur de la source.

Version 0.1.0. Les exemples livrés concernent des ateliers et des objets entièrement inventés.

[Documentation](https://aureliennicosiaulaval.github.io/groupedChord/) · [Vignette illustrée](https://aureliennicosiaulaval.github.io/groupedChord/articles/groupedChord.html)

## Installation

R 4.1.0 ou ultérieur. Installer depuis GitHub :

```r
install.packages("remotes")
remotes::install_github("AurelienNicosiaULaval/groupedChord", build_vignettes = TRUE)
library(groupedChord)
vignette("groupedChord", package = "groupedChord")
```

Une archive source est aussi disponible dans les [versions publiées](https://github.com/AurelienNicosiaULaval/groupedChord/releases). Pour l’installer depuis un fichier téléchargé :

```r
install.packages(c("htmlwidgets", "htmltools", "shiny"))
install.packages("groupedChord_0.1.0.tar.gz", repos = NULL, type = "source")
library(groupedChord)
```

`shiny` est facultatif pour un graphique R ou HTML; il est nécessaire pour la démonstration interactive.

## Exemple fictif

```r
library(groupedChord)
library(htmlwidgets)

donnees <- example_workshops()
donnees <- donnees[donnees$year == 2025, ]
cercle <- grouped_chord(
  donnees,
  source = "workshop", target = "item", value = "quantity", group = "family",
  labels = list(source = "Ateliers", target = "Objets", group = "Familles"),
  title = "Ateliers et objets inventés", unit = "objets fictifs",
  footnote = "Tous les noms et toutes les quantités sont inventés."
)
cercle
saveWidget(cercle, "ateliers-fictifs.html", selfcontained = TRUE)
```

```r
library(groupedChord)
run_grouped_chord_demo()
```

La démonstration inclut trois scénarios annuels, les deux niveaux d’affichage, une sélection par clic, l’export SVG et une seconde instance indépendante. Le générateur est déterministe, sans modifier l’état aléatoire de R. Il produit 108 liens fictifs, 18 objets, 4 ateliers et 4 familles.

## Usage dans Shiny

```r
library(shiny)
library(groupedChord)

donnees <- example_workshops()
ui <- fluidPage(
  selectInput("year", "Scénario fictif", 2024:2026, selected = 2025),
  groupedChordOutput("cercle"),
  verbatimTextOutput("selection")
)
server <- function(input, output, session) {
  output$cercle <- renderGroupedChord({
    grouped_chord(donnees[donnees$year == as.integer(input$year), ],
      "workshop", "item", "quantity", group = "family", unit = "objets fictifs")
  })
  output$selection <- renderPrint(input$cercle_click)
}
shinyApp(ui, server)
```

Les clics émettent `input$<outputId>_click` :

| type | champs utiles |
|---|---|
| `source` | `label`, `value` |
| `target` | `label`, `group`, `value` |
| `group` | `label`, `group`, `value` |
| `link` | `source`, `target`, `group`, `view`, `value` |

Le package émet la sélection; l’application décide comment filtrer ses données. Un événement JavaScript `groupedchord:select` permet aussi les interactions dans une page HTML ordinaire.

`input$<outputId>_svg` fournit `xml`, `total`, `view` et `context` pour un `downloadHandler()` Shiny. Cet objet est annulé quand la sélection est vide. `context` peut contenir l’année ou d’autres métadonnées propres à l’application. L’export conserve les noms, les valeurs, la légende mobile et les notes.

## Contrat des données et lecture

Chaque ligne donne une source, une destination, un poids et, facultativement, le groupe de la destination. Une destination appartient à un seul groupe. Les liens dupliqués sont additionnés; les poids nuls sont omis. Les valeurs absentes, négatives ou non finies sont refusées. Les nombres ordinaires de R sont requis.

`view = "targets"` affiche les destinations avec leur regroupement; `view = "groups"` additionne les destinations par groupe. Un diagramme sans groupe est aussi possible. Les palettes nommées `source_colours` et `group_colours` peuvent couvrir tout le jeu de données pour conserver les couleurs après filtrage. `group_labels` fournit des abréviations pour les écrans étroits, avec les noms complets dans la légende.

Les deux extrémités d’un ruban utilisent la même échelle angulaire. Les secteurs intérieurs représentent les poids. L’anneau extérieur réserve de la place aux noms : il sert à classer, sa longueur ne mesure pas un poids. L’échelle est recalculée pour chaque sélection; comparer les valeurs numériques entre deux vues.

Les noms sont radiaux sur les écrans suffisamment larges. Sur les petits écrans, des numéros renvoient aux noms complets dans une légende cliquable. Les arcs, noms et rubans sont utilisables avec Entrée ou Espace. Un tableau des liens accompagne le cercle. Sous 220 pixels de largeur, ou si trop de libellés empêchent un dessin lisible, le tableau est ouvert avec un message explicite. Le package représente une relation entre deux ensembles, avec un niveau de regroupement; il ne construit pas un arbre de profondeur arbitraire.

## Dépendances et licence

Le composant suit l’architecture officielle [htmlwidgets](https://www.htmlwidgets.org/develop_intro.html). D3 7.9.0 est livré localement avec sa licence ISC et sa provenance; aucun CDN n’est nécessaire au rendu. Les fonctions et ressources propres au package sont sous licence MIT. Reste compatible avec d’autres widgets sur la même page : les identifiants SVG, événements et exports appartiennent à chaque instance.

## Développement

Le dépôt contient les tests R, la vérification des géométries et la source de la vignette. Les workflows GitHub vérifient le package et reconstruisent le site pkgdown.

```r
install.packages(c("devtools", "pkgdown"))
devtools::test()
devtools::check()
pkgdown::build_site()
```
