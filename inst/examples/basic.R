# Exemple entièrement fictif, indépendant de toute application existante.
library(groupedChord)
flows <- example_workshops()
flows <- flows[flows$year == 2025, ]
plot <- grouped_chord(flows, source = "workshop", target = "item", value = "quantity", group = "family",
  title = "Ateliers et objets fictifs", unit = "objets fictifs",
  footnote = "Noms et quantités entièrement inventés, sans données observées.")
plot
# Export HTML autonome, sans CDN.
# htmlwidgets::saveWidget(plot, "ateliers-fictifs.html", selfcontained = TRUE)
