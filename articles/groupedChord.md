# Dessiner et explorer un cercle avec groupedChord

`groupedChord` représente des liens pondérés entre deux ensembles. Les
destinations peuvent être réunies en groupes, inscrits sur un anneau
extérieur. Les noms des destinations restent droits dans le prolongement
des secteurs; les noms des groupes suivent les arcs.

Cette vignette utilise seulement des ateliers et des objets inventés.
Les quantités sont des valeurs de démonstration, sans données observées.

## Préparer les liens

Une ligne contient une source, une destination et un poids numérique.
Une colonne facultative indique le groupe de la destination. Une
destination appartient à un seul groupe.

``` r

donnees <- example_workshops()
liens <- donnees[donnees$year == 2025, ]
head(liens)
#>    year          workshop    item family quantity
#> 37 2025 Atelier Ceramique     Bol Maison       39
#> 38 2025     Atelier Metal     Bol Maison       16
#> 39 2025 Atelier Ceramique    Vase Maison       53
#> 40 2025     Atelier Metal    Vase Maison       24
#> 41 2025   Atelier Textile Coussin Maison       65
#> 42 2025      Atelier Bois Coussin Maison       30
```

Le générateur produit trois scénarios annuels. On sélectionne un
scénario avant de dessiner : additionner les années répondrait à une
autre question.

``` r

data.frame(
  liens = nrow(liens),
  ateliers = length(unique(liens$workshop)),
  objets = length(unique(liens$item)),
  familles = length(unique(liens$family)),
  quantite_totale = sum(liens$quantity)
)
#>   liens ateliers objets familles quantite_totale
#> 1    36        4     18        4            1312
```

## Dessiner les objets et leurs familles

Les noms de colonnes sont fournis sous forme de chaînes de caractères.
La palette est construite sur l’ensemble des libellés afin de garder les
mêmes couleurs après un filtrage.

``` r

couleurs_ateliers <- chord_palette(unique(donnees$workshop), type = "source")
couleurs_familles <- chord_palette(unique(donnees$family), type = "group")
```

``` r

cercle <- grouped_chord(
  liens,
  source = "workshop", target = "item", value = "quantity", group = "family",
  source_colours = couleurs_ateliers, group_colours = couleurs_familles,
  labels = list(source = "Ateliers", target = "Objets", group = "Familles"),
  title = "Fabrication fictive : scénario 2025",
  unit = "objets fictifs",
  footnote = "Noms et quantités entièrement inventés."
)
cercle
```

La largeur des rubans et les secteurs intérieurs représentent les poids.
Les rubans portent la couleur de leur source. Chaque famille et ses
objets partagent une couleur. L’anneau extérieur comprend de l’espace
pour les noms : sa longueur sert au regroupement et ne mesure pas une
quantité.

Un clic sur un nom, un secteur ou un ruban met les liens correspondants
en évidence dans cette page. Entrée et Espace permettent les mêmes
sélections au clavier. Sur un petit écran, des repères numériques
renvoient aux noms complets dans une légende cliquable. Le tableau
conserve les valeurs des liens.

## Regrouper les objets par famille

`view = "groups"` additionne les poids par atelier et famille. Le total
est conservé; les destinations individuelles sont réunies dans leurs
groupes.

``` r

par_famille <- grouped_chord(
  liens,
  source = "workshop", target = "item", value = "quantity", group = "family",
  view = "groups",
  source_colours = couleurs_ateliers, group_colours = couleurs_familles,
  labels = list(source = "Ateliers", target = "Objets", group = "Familles"),
  title = "Les mêmes liens regroupés par famille",
  unit = "objets fictifs",
  footnote = "Noms et quantités entièrement inventés."
)
par_famille
```

``` r

stopifnot(
  cercle$x$total == sum(liens$quantity),
  par_famille$x$total == cercle$x$total
)
aggregate(quantity ~ workshop + family, data = liens, FUN = sum)
#>             workshop  family quantity
#> 1       Atelier Bois  Bureau       88
#> 2  Atelier Ceramique  Bureau       98
#> 3      Atelier Metal  Bureau      125
#> 4    Atelier Textile  Bureau       59
#> 5       Atelier Bois  Jardin      111
#> 6  Atelier Ceramique  Jardin      101
#> 7      Atelier Metal  Jardin      103
#> 8       Atelier Bois Loisirs      125
#> 9  Atelier Ceramique Loisirs       81
#> 10     Atelier Metal Loisirs       12
#> 11   Atelier Textile Loisirs       51
#> 12      Atelier Bois  Maison       59
#> 13 Atelier Ceramique  Maison      103
#> 14     Atelier Metal  Maison      131
#> 15   Atelier Textile  Maison       65
```

Les deux extrémités d’un ruban utilisent la même unité angulaire.
L’échelle est recalculée pour chaque sélection : pour comparer deux
années ou deux vues, comparer les valeurs numériques plutôt que les
longueurs de deux cercles. Le diagramme est bipartite, avec un niveau
facultatif de regroupement. Il ne représente pas un arbre de profondeur
arbitraire.

## Enregistrer le résultat

Le contrôle « Exporter SVG » enregistre le cercle affiché, avec ses
noms, valeurs et notes. Pour partager un fichier HTML autonome depuis R
:

``` r

library(htmlwidgets)
saveWidget(cercle, "ateliers-fictifs.html", selfcontained = TRUE)
```

## Ajouter des filtres dans Shiny

Dans une page HTML, la sélection met les liens en évidence. Dans Shiny,
le package transmet les événements à l’application, qui choisit les
filtres à appliquer. Cet exemple permet de choisir une année, de cliquer
sur une famille pour afficher ses objets, puis de revenir à la vue
complète.

``` r

library(shiny)
library(groupedChord)

donnees <- example_workshops()
couleurs_ateliers <- chord_palette(unique(donnees$workshop), "source")
couleurs_familles <- chord_palette(unique(donnees$family), "group")

ui <- fluidPage(
  selectInput("year", "Scénario fictif", 2024:2026, selected = 2025),
  actionButton("reset", "Toutes les familles"),
  groupedChordOutput("cercle")
)

server <- function(input, output, session) {
  famille <- reactiveVal(NULL)
  observeEvent(input$reset, famille(NULL))
  observeEvent(input$cercle_click, {
    choix <- input$cercle_click
    if (identical(choix$type, "group")) famille(choix$label)
  })
  output$cercle <- renderGroupedChord({
    liens <- donnees[donnees$year == as.integer(input$year), ]
    if (!is.null(famille())) {
      liens <- liens[liens$family == famille(), ]
    }
    grouped_chord(
      liens, "workshop", "item", "quantity", group = "family",
      source_colours = couleurs_ateliers,
      group_colours = couleurs_familles,
      labels = list(source = "Ateliers", target = "Objets", group = "Familles"),
      unit = "objets fictifs", context = list(year = as.integer(input$year)),
      footnote = "Noms et quantités entièrement inventés."
    )
  })
}

shinyApp(ui, server)
```

Les événements sont disponibles dans `input$<outputId>_click`, avec un
`type` parmi `source`, `target`, `group` et `link`, ainsi que les
libellés associés. Chaque instance possède ses propres événements. Pour
un téléchargement Shiny, `input$<outputId>_svg` fournit `xml`, `total`,
`view` et `context`. Une sélection vide annule cet objet, afin de ne pas
exporter un ancien cercle.

## Vérifier les données

Les liens dupliqués sont additionnés; les poids nuls sont omis. Les
poids absents, négatifs ou non finis provoquent une erreur explicite.
Les données ne sont pas corrigées silencieusement.

``` r

petit_exemple <- data.frame(
  atelier = c("Atelier A", "Atelier A", "Atelier B"),
  objet = c("Bol", "Bol", "Bol"),
  famille = "Cuisine",
  quantite = c(2, 3, 4)
)
petit_cercle <- grouped_chord(
  petit_exemple, "atelier", "objet", "quantite", group = "famille"
)
stopifnot(petit_cercle$x$total == 9)
do.call(rbind, lapply(petit_cercle$x$table, as.data.frame))
#>      source target   group value
#> 1 Atelier A    Bol Cuisine     5
#> 2 Atelier B    Bol Cuisine     4
```

Une application réelle reste responsable de la provenance, de l’unité
des poids, des valeurs manquantes et des filtres. Les notes peuvent être
précisées avec `footnote` et seront incluses dans l’export SVG.
