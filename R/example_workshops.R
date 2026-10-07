#' Entirely fictional production flows from workshops to objects
#'
#' Invented workshops, objects, families and quantities over three invented
#' annual scenarios. Values are produced by a fixed arithmetic rule; no real
#' project records, labels, proportions or dates were used. The unit is a
#' fictional manufactured object. Values are illustrative, not observations.
#'
#' @return A data frame of 108 rows with columns `year`, `workshop`, `item`,
#'   `family` and `quantity`. There are four workshops, eighteen objects and
#'   four object families. Each object has two workshop links per year.
#' @examples
#' d <- example_workshops()
#' head(d)
#' aggregate(quantity ~ year, d, sum)
#' @export
example_workshops <- function() {
  items <- c("Bol", "Vase", "Coussin", "Lampe", "Tablette",
    "Bac de culture", "Nichoir", "Arrosoir", "Etiquette de plantes",
    "Jeu de cubes", "Puzzle", "Marionnette", "Pion",
    "Porte-crayons", "Carnet", "Boite de rangement", "Support de livre", "Presse-papier")
  family <- rep(c("Maison", "Jardin", "Loisirs", "Bureau"), c(5, 4, 4, 5))
  workshops <- c("Atelier Bois", "Atelier Textile", "Atelier Metal", "Atelier Ceramique")
  primary <- c(4,4,2,3,1,1,1,3,4,1,1,2,4,4,2,1,3,3)
  secondary <- c(3,3,1,4,3,3,3,4,1,3,4,1,1,1,1,2,1,4)
  rows <- list()
  for (year in 2024:2026) for (i in seq_along(items)) for (link in 1:2) {
    workshop <- if (link == 1) primary[i] else secondary[i]
    base <- if (link == 1) 20 + (i * 13L) %% 63L else 4 + (i * 7L) %% 23L
    growth <- 1 + (i + workshop) %% 7L
    rows[[length(rows) + 1L]] <- data.frame(year = year, workshop = workshops[workshop],
      item = items[i], family = family[i], quantity = base + (year - 2024L) * growth,
      stringsAsFactors = FALSE)
  }
  result <- do.call(rbind, rows)
  rownames(result) <- NULL
  result
}
