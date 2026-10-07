# Create a grouped circular flow diagram

Draw a bipartite flow diagram with straight radial labels and an
optional outer grouping ring. Duplicate links are summed. Zero-weight
rows are omitted. A target must belong to exactly one group. Missing,
negative or non-finite weights are rejected rather than silently
changed.

## Usage

``` r
grouped_chord(
  data,
  source = "source",
  target = "target",
  value = "value",
  group = NULL,
  view = c("targets", "groups"),
  source_colours = NULL,
  group_colours = NULL,
  group_labels = NULL,
  labels = list(source = "Sources", target = "Destinations", group = "Groupes"),
  title = NULL,
  unit = "poids",
  footnote = character(),
  locale = "fr-CA",
  show_table = TRUE,
  show_controls = TRUE,
  source_label_width = 22,
  context = list(),
  width = NULL,
  height = NULL,
  elementId = NULL
)
```

## Arguments

- data:

  A data frame containing the links.

- source, target, value:

  Names of the source, target and numeric weight columns.

- group:

  Optional name of a column grouping the targets.

- view:

  Either \`"targets"\` for individual targets or \`"groups"\` for totals
  by group. The latter requires a grouping column.

- source_colours, group_colours:

  Optional named colour vectors. Names must cover all visible source or
  group labels. Extra names are allowed, so the same palette can be used
  for every filtered subset.

- group_labels:

  Optional named character vector of short group labels, used on narrow
  screens. Full labels remain in the key and accessible names.

- labels:

  Named list with \`source\`, \`target\` and \`group\` headings.

- title:

  Optional title included in the widget and its SVG export.

- unit:

  Label for the weight unit, for example \`"fictional objects"\`.

- footnote:

  Character vector describing sources or interpretation limits.

- locale:

  Locale used for numeric labels, default \`"fr-CA"\`.

- show_table:

  Show a collapsible table of the underlying links.

- show_controls:

  Show the widget's SVG download link. Shiny applications may instead
  use a download handler and \`input\$\<outputId\>\_svg\$xml\`.

- source_label_width:

  Approximate maximum characters per source label line. Targets keep
  straight, unwrapped names.

- context:

  Named list of application metadata included with SVG exports, for
  example the selected year. Do not put credentials in this metadata.

- width, height:

  Widget dimensions. Its content height adapts to the labels.

- elementId:

  Optional HTML element identifier.

## Value

An \`htmlwidget\` of class \`groupedChord\`.

## Details

The same angular unit is used at both ends of every ribbon. The scale is
recalculated for each selection. Lengths in different widgets cannot be
compared directly; use the numeric weights. The outer ring is a
classification track: its length includes space for group labels and
does not encode a weight.

Each widget has independent SVG identifiers, selections and exports. In
Shiny, a click emits \`input\$\<outputId\>\_click\`, a list with a
\`type\` (\`source\`, \`target\`, \`group\` or \`link\`) and the
corresponding labels. The SVG snapshot is in
\`input\$\<outputId\>\_svg\`, with \`xml\`, \`total\`, \`view\` and
\`context\`. Non-Shiny pages receive a \`groupedchord:select\` DOM
event.

## Examples

``` r
library(groupedChord)
d <- example_workshops()
d <- d[d$year == 2025, ]
grouped_chord(d, "workshop", "item", "quantity", group = "family",
  title = "Ateliers et objets inventes", unit = "objets fictifs")

{"x":{"nodes":[{"id":"s:Atelier Bois","label":"Atelier Bois","role":"source","family":"","color":"#007657","total":383},{"id":"s:Atelier Ceramique","label":"Atelier Ceramique","role":"source","family":"","color":"#6C680A","total":383},{"id":"s:Atelier Metal","label":"Atelier Metal","role":"source","family":"","color":"#006F8D","total":371},{"id":"s:Atelier Textile","label":"Atelier Textile","role":"source","family":"","color":"#8D5089","total":175},{"id":"t:Boite de rangement","label":"Boite de rangement","role":"target","family":"Bureau","color":"#477028","total":72},{"id":"t:Carnet","label":"Carnet","role":"target","family":"Bureau","color":"#477028","total":50},{"id":"t:Porte-crayons","label":"Porte-crayons","role":"target","family":"Bureau","color":"#477028","total":93},{"id":"t:Presse-papier","label":"Presse-papier","role":"target","family":"Bureau","color":"#477028","total":83},{"id":"t:Support de livre","label":"Support de livre","role":"target","family":"Bureau","color":"#477028","total":72},{"id":"t:Arrosoir","label":"Arrosoir","role":"target","family":"Jardin","color":"#00765D","total":86},{"id":"t:Bac de culture","label":"Bac de culture","role":"target","family":"Jardin","color":"#00765D","total":62},{"id":"t:Etiquette de plantes","label":"Etiquette de plantes","role":"target","family":"Jardin","color":"#00765D","total":106},{"id":"t:Nichoir","label":"Nichoir","role":"target","family":"Jardin","color":"#00765D","total":61},{"id":"t:Jeu de cubes","label":"Jeu de cubes","role":"target","family":"Loisirs","color":"#007384","total":41},{"id":"t:Marionnette","label":"Marionnette","role":"target","family":"Loisirs","color":"#007384","total":77},{"id":"t:Pion","label":"Pion","role":"target","family":"Loisirs","color":"#007384","total":94},{"id":"t:Puzzle","label":"Puzzle","role":"target","family":"Loisirs","color":"#007384","total":57},{"id":"t:Bol","label":"Bol","role":"target","family":"Maison","color":"#00708B","total":55},{"id":"t:Coussin","label":"Coussin","role":"target","family":"Maison","color":"#00708B","total":95},{"id":"t:Lampe","label":"Lampe","role":"target","family":"Maison","color":"#00708B","total":84},{"id":"t:Tablette","label":"Tablette","role":"target","family":"Maison","color":"#00708B","total":47},{"id":"t:Vase","label":"Vase","role":"target","family":"Maison","color":"#00708B","total":77}],"links":[{"from":"s:Atelier Bois","to":"t:Boite de rangement","sourceLabel":"Atelier Bois","targetLabel":"Boite de rangement","group":"Bureau","value":43,"color":"#007657"},{"from":"s:Atelier Textile","to":"t:Boite de rangement","sourceLabel":"Atelier Textile","targetLabel":"Boite de rangement","group":"Bureau","value":29,"color":"#8D5089"},{"from":"s:Atelier Bois","to":"t:Carnet","sourceLabel":"Atelier Bois","targetLabel":"Carnet","group":"Bureau","value":20,"color":"#007657"},{"from":"s:Atelier Textile","to":"t:Carnet","sourceLabel":"Atelier Textile","targetLabel":"Carnet","group":"Bureau","value":30,"color":"#8D5089"},{"from":"s:Atelier Bois","to":"t:Porte-crayons","sourceLabel":"Atelier Bois","targetLabel":"Porte-crayons","group":"Bureau","value":12,"color":"#007657"},{"from":"s:Atelier Ceramique","to":"t:Porte-crayons","sourceLabel":"Atelier Ceramique","targetLabel":"Porte-crayons","group":"Bureau","value":81,"color":"#6C680A"},{"from":"s:Atelier Ceramique","to":"t:Presse-papier","sourceLabel":"Atelier Ceramique","targetLabel":"Presse-papier","group":"Bureau","value":17,"color":"#6C680A"},{"from":"s:Atelier Metal","to":"t:Presse-papier","sourceLabel":"Atelier Metal","targetLabel":"Presse-papier","group":"Bureau","value":66,"color":"#006F8D"},{"from":"s:Atelier Bois","to":"t:Support de livre","sourceLabel":"Atelier Bois","targetLabel":"Support de livre","group":"Bureau","value":13,"color":"#007657"},{"from":"s:Atelier Metal","to":"t:Support de livre","sourceLabel":"Atelier Metal","targetLabel":"Support de livre","group":"Bureau","value":59,"color":"#006F8D"},{"from":"s:Atelier Ceramique","to":"t:Arrosoir","sourceLabel":"Atelier Ceramique","targetLabel":"Arrosoir","group":"Jardin","value":20,"color":"#6C680A"},{"from":"s:Atelier Metal","to":"t:Arrosoir","sourceLabel":"Atelier Metal","targetLabel":"Arrosoir","group":"Jardin","value":66,"color":"#006F8D"},{"from":"s:Atelier Bois","to":"t:Bac de culture","sourceLabel":"Atelier Bois","targetLabel":"Bac de culture","group":"Jardin","value":36,"color":"#007657"},{"from":"s:Atelier Metal","to":"t:Bac de culture","sourceLabel":"Atelier Metal","targetLabel":"Bac de culture","group":"Jardin","value":26,"color":"#006F8D"},{"from":"s:Atelier Bois","to":"t:Etiquette de plantes","sourceLabel":"Atelier Bois","targetLabel":"Etiquette de plantes","group":"Jardin","value":25,"color":"#007657"},{"from":"s:Atelier Ceramique","to":"t:Etiquette de plantes","sourceLabel":"Atelier Ceramique","targetLabel":"Etiquette de plantes","group":"Jardin","value":81,"color":"#6C680A"},{"from":"s:Atelier Bois","to":"t:Nichoir","sourceLabel":"Atelier Bois","targetLabel":"Nichoir","group":"Jardin","value":50,"color":"#007657"},{"from":"s:Atelier Metal","to":"t:Nichoir","sourceLabel":"Atelier Metal","targetLabel":"Nichoir","group":"Jardin","value":11,"color":"#006F8D"},{"from":"s:Atelier Bois","to":"t:Jeu de cubes","sourceLabel":"Atelier Bois","targetLabel":"Jeu de cubes","group":"Loisirs","value":29,"color":"#007657"},{"from":"s:Atelier Metal","to":"t:Jeu de cubes","sourceLabel":"Atelier Metal","targetLabel":"Jeu de cubes","group":"Loisirs","value":12,"color":"#006F8D"},{"from":"s:Atelier Bois","to":"t:Marionnette","sourceLabel":"Atelier Bois","targetLabel":"Marionnette","group":"Loisirs","value":26,"color":"#007657"},{"from":"s:Atelier Textile","to":"t:Marionnette","sourceLabel":"Atelier Textile","targetLabel":"Marionnette","group":"Loisirs","value":51,"color":"#8D5089"},{"from":"s:Atelier Bois","to":"t:Pion","sourceLabel":"Atelier Bois","targetLabel":"Pion","group":"Loisirs","value":27,"color":"#007657"},{"from":"s:Atelier Ceramique","to":"t:Pion","sourceLabel":"Atelier Ceramique","targetLabel":"Pion","group":"Loisirs","value":67,"color":"#6C680A"},{"from":"s:Atelier Bois","to":"t:Puzzle","sourceLabel":"Atelier Bois","targetLabel":"Puzzle","group":"Loisirs","value":43,"color":"#007657"},{"from":"s:Atelier Ceramique","to":"t:Puzzle","sourceLabel":"Atelier Ceramique","targetLabel":"Puzzle","group":"Loisirs","value":14,"color":"#6C680A"},{"from":"s:Atelier Ceramique","to":"t:Bol","sourceLabel":"Atelier Ceramique","targetLabel":"Bol","group":"Maison","value":39,"color":"#6C680A"},{"from":"s:Atelier Metal","to":"t:Bol","sourceLabel":"Atelier Metal","targetLabel":"Bol","group":"Maison","value":16,"color":"#006F8D"},{"from":"s:Atelier Bois","to":"t:Coussin","sourceLabel":"Atelier Bois","targetLabel":"Coussin","group":"Maison","value":30,"color":"#007657"},{"from":"s:Atelier Textile","to":"t:Coussin","sourceLabel":"Atelier Textile","targetLabel":"Coussin","group":"Maison","value":65,"color":"#8D5089"},{"from":"s:Atelier Ceramique","to":"t:Lampe","sourceLabel":"Atelier Ceramique","targetLabel":"Lampe","group":"Maison","value":11,"color":"#6C680A"},{"from":"s:Atelier Metal","to":"t:Lampe","sourceLabel":"Atelier Metal","targetLabel":"Lampe","group":"Maison","value":73,"color":"#006F8D"},{"from":"s:Atelier Bois","to":"t:Tablette","sourceLabel":"Atelier Bois","targetLabel":"Tablette","group":"Maison","value":29,"color":"#007657"},{"from":"s:Atelier Metal","to":"t:Tablette","sourceLabel":"Atelier Metal","targetLabel":"Tablette","group":"Maison","value":18,"color":"#006F8D"},{"from":"s:Atelier Ceramique","to":"t:Vase","sourceLabel":"Atelier Ceramique","targetLabel":"Vase","group":"Maison","value":53,"color":"#6C680A"},{"from":"s:Atelier Metal","to":"t:Vase","sourceLabel":"Atelier Metal","targetLabel":"Vase","group":"Maison","value":24,"color":"#006F8D"}],"total":1312,"level":"targets","grouped":true,"table":[{"source":"Atelier Bois","target":"Boite de rangement","group":"Bureau","value":43},{"source":"Atelier Textile","target":"Boite de rangement","group":"Bureau","value":29},{"source":"Atelier Bois","target":"Carnet","group":"Bureau","value":20},{"source":"Atelier Textile","target":"Carnet","group":"Bureau","value":30},{"source":"Atelier Bois","target":"Porte-crayons","group":"Bureau","value":12},{"source":"Atelier Ceramique","target":"Porte-crayons","group":"Bureau","value":81},{"source":"Atelier Ceramique","target":"Presse-papier","group":"Bureau","value":17},{"source":"Atelier Metal","target":"Presse-papier","group":"Bureau","value":66},{"source":"Atelier Bois","target":"Support de livre","group":"Bureau","value":13},{"source":"Atelier Metal","target":"Support de livre","group":"Bureau","value":59},{"source":"Atelier Ceramique","target":"Arrosoir","group":"Jardin","value":20},{"source":"Atelier Metal","target":"Arrosoir","group":"Jardin","value":66},{"source":"Atelier Bois","target":"Bac de culture","group":"Jardin","value":36},{"source":"Atelier Metal","target":"Bac de culture","group":"Jardin","value":26},{"source":"Atelier Bois","target":"Etiquette de plantes","group":"Jardin","value":25},{"source":"Atelier Ceramique","target":"Etiquette de plantes","group":"Jardin","value":81},{"source":"Atelier Bois","target":"Nichoir","group":"Jardin","value":50},{"source":"Atelier Metal","target":"Nichoir","group":"Jardin","value":11},{"source":"Atelier Bois","target":"Jeu de cubes","group":"Loisirs","value":29},{"source":"Atelier Metal","target":"Jeu de cubes","group":"Loisirs","value":12},{"source":"Atelier Bois","target":"Marionnette","group":"Loisirs","value":26},{"source":"Atelier Textile","target":"Marionnette","group":"Loisirs","value":51},{"source":"Atelier Bois","target":"Pion","group":"Loisirs","value":27},{"source":"Atelier Ceramique","target":"Pion","group":"Loisirs","value":67},{"source":"Atelier Bois","target":"Puzzle","group":"Loisirs","value":43},{"source":"Atelier Ceramique","target":"Puzzle","group":"Loisirs","value":14},{"source":"Atelier Ceramique","target":"Bol","group":"Maison","value":39},{"source":"Atelier Metal","target":"Bol","group":"Maison","value":16},{"source":"Atelier Bois","target":"Coussin","group":"Maison","value":30},{"source":"Atelier Textile","target":"Coussin","group":"Maison","value":65},{"source":"Atelier Ceramique","target":"Lampe","group":"Maison","value":11},{"source":"Atelier Metal","target":"Lampe","group":"Maison","value":73},{"source":"Atelier Bois","target":"Tablette","group":"Maison","value":29},{"source":"Atelier Metal","target":"Tablette","group":"Maison","value":18},{"source":"Atelier Ceramique","target":"Vase","group":"Maison","value":53},{"source":"Atelier Metal","target":"Vase","group":"Maison","value":24}],"groupColours":{"Bureau":"#477028","Jardin":"#00765D","Loisirs":"#007384","Maison":"#00708B"},"groupLabels":[],"options":{"labels":{"source":"Sources","target":"Destinations","group":"Groupes"},"title":"Ateliers et objets inventes","unit":"objets fictifs","footnote":[],"locale":"fr-CA","showTable":true,"showControls":true,"sourceLabelWidth":22},"context":[]},"evals":[],"jsHooks":[]}
```
