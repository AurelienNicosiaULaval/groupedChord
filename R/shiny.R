#' Shiny bindings for grouped circular diagrams
#' @param outputId Output identifier.
#' @param width,height CSS dimensions; the default height lets content adapt.
#' @param expr Expression creating a [grouped_chord()] widget.
#' @param env Environment in which to evaluate `expr`.
#' @param quoted Whether `expr` has already been quoted.
#' @return An output tag or a Shiny render function.
#' @examples
#' if (interactive() && requireNamespace("shiny", quietly = TRUE)) {
#'   run_grouped_chord_demo()
#' }
#' @export
groupedChordOutput <- function(outputId, width = "100%", height = "auto") {
  htmlwidgets::shinyWidgetOutput(outputId, "groupedChord", width, height, package = "groupedChord")
}

#' @rdname groupedChordOutput
#' @export
renderGroupedChord <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) expr <- substitute(expr)
  htmlwidgets::shinyRenderWidget(expr, groupedChordOutput, env, quoted = TRUE)
}

#' Run the entirely fictional workshop demonstration
#' @param ... Arguments forwarded to [shiny::runApp()].
#' @return The result of `shiny::runApp()`, invisibly.
#' @examples
#' if (interactive() && requireNamespace("shiny", quietly = TRUE)) {
#'   run_grouped_chord_demo()
#' }
#' @export
run_grouped_chord_demo <- function(...) {
  if (!requireNamespace("shiny", quietly = TRUE)) stop("Install the shiny package to run this demonstration.", call. = FALSE)
  invisible(shiny::runApp(system.file("examples", "shiny", package = "groupedChord"), ...))
}
