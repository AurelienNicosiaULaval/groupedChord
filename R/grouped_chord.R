#' Create a grouped circular flow diagram
#'
#' Draw a bipartite flow diagram with straight radial labels and an optional
#' outer grouping ring. Duplicate links are summed. Zero-weight rows are
#' omitted. A target must belong to exactly one group. Missing, negative or
#' non-finite weights are rejected rather than silently changed.
#'
#' @param data A data frame containing the links.
#' @param source,target,value Names of the source, target and numeric weight columns.
#' @param group Optional name of a column grouping the targets.
#' @param view Either `"targets"` for individual targets or `"groups"` for totals
#'   by group. The latter requires a grouping column.
#' @param source_colours,group_colours Optional named colour vectors. Names must
#'   cover all visible source or group labels. Extra names are allowed, so the
#'   same palette can be used for every filtered subset.
#' @param group_labels Optional named character vector of short group labels,
#'   used on narrow screens. Full labels remain in the key and accessible names.
#' @param labels Named list with `source`, `target` and `group` headings.
#' @param title Optional title included in the widget and its SVG export.
#' @param unit Label for the weight unit, for example `"fictional objects"`.
#' @param footnote Character vector describing sources or interpretation limits.
#' @param locale Locale used for numeric labels, default `"fr-CA"`.
#' @param show_table Show a collapsible table of the underlying links.
#' @param show_controls Show the widget's SVG download link. Shiny applications
#'   may instead use a download handler and `input$<outputId>_svg$xml`.
#' @param source_label_width Approximate maximum characters per source label
#'   line. Targets keep straight, unwrapped names.
#' @param context Named list of application metadata included with SVG exports,
#'   for example the selected year. Do not put credentials in this metadata.
#' @param width,height Widget dimensions. Its content height adapts to the labels.
#' @param elementId Optional HTML element identifier.
#' @return An `htmlwidget` of class `groupedChord`.
#' @details The same angular unit is used at both ends of every ribbon. The
#'   scale is recalculated for each selection. Lengths in different widgets
#'   cannot be compared directly; use the numeric weights. The outer ring is
#'   a classification track: its length includes space for group labels and
#'   does not encode a weight.
#'
#'   Each widget has independent SVG identifiers, selections and exports.
#'   In Shiny, a click emits `input$<outputId>_click`, a list with a `type`
#'   (`source`, `target`, `group` or `link`) and the corresponding labels.
#'   The SVG snapshot is in `input$<outputId>_svg`, with `xml`, `total`, `view`
#'   and `context`. Non-Shiny pages receive a `groupedchord:select` DOM event.
#' @examples
#' library(groupedChord)
#' d <- example_workshops()
#' d <- d[d$year == 2025, ]
#' grouped_chord(d, "workshop", "item", "quantity", group = "family",
#'   title = "Ateliers et objets inventes", unit = "objets fictifs")
#' @export
 grouped_chord <- function(data, source = "source", target = "target", value = "value",
                           group = NULL, view = c("targets", "groups"),
                           source_colours = NULL, group_colours = NULL,
                           group_labels = NULL,
                           labels = list(source = "Sources", target = "Destinations", group = "Groupes"),
                           title = NULL, unit = "poids", footnote = character(),
                           locale = "fr-CA", show_table = TRUE, show_controls = TRUE,
                           source_label_width = 22, context = list(),
                           width = NULL, height = NULL, elementId = NULL) {
  view <- match.arg(view)
  if (!is.data.frame(data)) stop("data must be a data frame.", call. = FALSE)
  column <- function(name, argument) {
    if (!is.character(name) || length(name) != 1L || is.na(name) || !nzchar(name) || !name %in% names(data)) {
      stop(argument, " must name an existing column.", call. = FALSE)
    }
    name
  }
  source <- column(source, "source")
  target <- column(target, "target")
  value <- column(value, "value")
  if (!is.null(group)) group <- column(group, "group")
  if (view == "groups" && is.null(group)) stop("view = 'groups' requires a group column.", call. = FALSE)
  weights <- data[[value]]
  if (!is.numeric(weights) || inherits(weights, "integer64") || any(!is.finite(weights)) || any(weights < 0)) {
    stop("Weights must be finite, non-negative ordinary numeric values.", call. = FALSE)
  }
  text_column <- function(name) {
    values <- as.character(data[[name]])
    if (anyNA(values) || any(!nzchar(trimws(values)))) stop("Labels must not be missing or blank: ", name, call. = FALSE)
    enc2utf8(values)
  }
  sources <- text_column(source)
  targets <- text_column(target)
  groups <- if (is.null(group)) rep("", nrow(data)) else text_column(group)
  if (!is.null(group)) {
    membership <- unique(data.frame(target = targets, group = groups, stringsAsFactors = FALSE))
    if (anyDuplicated(membership$target)) stop("Each target must belong to exactly one group.", call. = FALSE)
  }
  one_text <- function(x, argument, allow_null = FALSE) {
    if (allow_null && is.null(x)) return(invisible(NULL))
    if (!is.character(x) || length(x) != 1L || is.na(x)) stop(argument, " must be a single string.", call. = FALSE)
  }
  one_text(title, "title", TRUE); one_text(unit, "unit"); one_text(locale, "locale")
  if (!is.character(footnote) || anyNA(footnote)) stop("footnote must be a character vector without missing values.", call. = FALSE)
  if (!is.list(labels) || !all(c("source", "target", "group") %in% names(labels))) stop("labels must name source, target and group headings.", call. = FALSE)
  for (name in c("source", "target", "group")) one_text(labels[[name]], paste0("labels$", name))
  if (!is.logical(show_table) || length(show_table) != 1L || is.na(show_table) ||
      !is.logical(show_controls) || length(show_controls) != 1L || is.na(show_controls)) stop("Display flags must be TRUE or FALSE.", call. = FALSE)
  if (!is.numeric(source_label_width) || length(source_label_width) != 1L || !is.finite(source_label_width) || source_label_width < 4) stop("source_label_width must be at least 4.", call. = FALSE)
  if (!is.list(context) || (length(context) && (is.null(names(context)) || any(!nzchar(names(context)))))) stop("context must be a named list.", call. = FALSE)
  if (!is.null(group_labels) && (!is.character(group_labels) || anyNA(group_labels) || is.null(names(group_labels)) || any(!nzchar(names(group_labels))) || anyDuplicated(names(group_labels)))) stop("group_labels must be a uniquely named character vector.", call. = FALSE)
  original <- data.frame(source = sources, target = targets, group = groups, value = weights, stringsAsFactors = FALSE)
  original <- original[original$value > 0, , drop = FALSE]
  if (nrow(original)) {
    original <- stats::aggregate(value ~ source + target + group, original, sum)
    original <- original[order(original$group, original$target, original$source, method = "radix"), , drop = FALSE]
  }
  if (any(!is.finite(original$value)) || !is.finite(sum(original$value))) stop("Aggregated weights exceed finite numeric range.", call. = FALSE)
  source_map <- resolve_colours(unique(original$source), source_colours, "source_colours", "source")
  group_map <- resolve_colours(unique(original$group[nzchar(original$group)]), group_colours, "group_colours", "group")
  plotted <- original
  if (view == "groups" && nrow(plotted)) {
    plotted <- stats::aggregate(value ~ source + group, plotted, sum)
    plotted$target <- plotted$group
    plotted <- plotted[, c("source", "target", "group", "value")]
  }
  links <- lapply(seq_len(nrow(plotted)), function(i) {
    row <- plotted[i, ]
    list(from = paste0("s:", row$source), to = paste0(if (view == "groups") "g:" else "t:", row$target),
         sourceLabel = row$source, targetLabel = row$target, group = row$group,
         value = row$value, color = unname(source_map[row$source]))
  })
  nodes <- list()
  for (label in sort(unique(plotted$source), method = "radix")) {
    nodes[[length(nodes) + 1L]] <- list(id = paste0("s:", label), label = label, role = "source", family = "",
      color = unname(source_map[label]), total = sum(plotted$value[plotted$source == label]))
  }
  target_rows <- unique(plotted[, c("group", "target"), drop = FALSE])
  target_rows <- target_rows[order(target_rows$group, target_rows$target, method = "radix"), , drop = FALSE]
  for (i in seq_len(nrow(target_rows))) {
    label <- target_rows$target[i]; family <- target_rows$group[i]
    color <- if (nzchar(family)) unname(group_map[family]) else "#657477"
    nodes[[length(nodes) + 1L]] <- list(id = paste0(if (view == "groups") "g:" else "t:", label), label = label,
      role = if (view == "groups") "group" else "target", family = family, color = color,
      total = sum(plotted$value[plotted$target == label]))
  }
  payload <- list(nodes = nodes, links = links, total = sum(original$value), level = view, grouped = !is.null(group),
    table = lapply(seq_len(nrow(original)), function(i) as.list(original[i, ])),
    groupColours = as.list(group_map), groupLabels = as.list(group_labels),
    options = list(labels = labels, title = title, unit = unit, footnote = as.list(footnote), locale = locale,
      showTable = show_table, showControls = show_controls, sourceLabelWidth = as.integer(source_label_width)), context = context)
  htmlwidgets::createWidget("groupedChord", payload, width = width, height = height, package = "groupedChord",
    elementId = elementId, sizingPolicy = htmlwidgets::sizingPolicy(defaultWidth = "100%", defaultHeight = 640,
      padding = 0, browser.fill = FALSE, viewer.fill = FALSE))
}

#' Stable named colours for circular diagrams
#'
#' Generate a deterministic colour for each label. The result for a label does
#' not depend on the other labels in the vector. Explicit palettes can also be
#' passed to [grouped_chord()]. Names and the table supplement colour encoding.
#' @param labels Character labels to colour.
#' @param type Palette role, either `"group"` or `"source"`.
#' @return A named character vector of hexadecimal colours.
#' @examples
#' chord_palette(c("Maison", "Jardin"))
#' @export
chord_palette <- function(labels, type = c("group", "source")) {
  type <- match.arg(type)
  labels <- unique(as.character(labels))
  if (anyNA(labels) || any(!nzchar(labels))) stop("Palette labels must be non-missing and non-empty.", call. = FALSE)
  colours <- vapply(labels, function(label) {
    codes <- utf8ToInt(enc2utf8(label))
    hue <- (sum(codes * ((seq_along(codes) * 17) %% 101 + 1)) + if (type == "source") 47 else 0) %% 360
    grDevices::hcl(h = hue, c = 46, l = 43, fixup = TRUE)
  }, character(1))
  stats::setNames(colours, labels)
}

resolve_colours <- function(labels, colours, argument, type) {
  if (is.null(colours)) return(chord_palette(labels, type))
  if (!is.character(colours) || anyNA(colours) || is.null(names(colours)) || any(!nzchar(names(colours))) || anyDuplicated(names(colours)) || !all(labels %in% names(colours))) {
    stop(argument, " must be a uniquely named colour vector covering all visible labels.", call. = FALSE)
  }
  tryCatch(grDevices::col2rgb(colours), error = function(e) stop(argument, " contains an invalid colour.", call. = FALSE))
  colours <- colours[labels]
  css <- vapply(colours, function(colour) {
    rgba <- grDevices::col2rgb(colour, alpha = TRUE)
    if (rgba[4, 1] == 255) grDevices::rgb(rgba[1, 1], rgba[2, 1], rgba[3, 1], maxColorValue = 255)
    else grDevices::rgb(rgba[1, 1], rgba[2, 1], rgba[3, 1], alpha = rgba[4, 1], maxColorValue = 255)
  }, character(1))
  stats::setNames(css, names(colours))
}
