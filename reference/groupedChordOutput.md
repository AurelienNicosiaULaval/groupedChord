# Shiny bindings for grouped circular diagrams

Shiny bindings for grouped circular diagrams

## Usage

``` r
groupedChordOutput(outputId, width = "100%", height = "auto")

renderGroupedChord(expr, env = parent.frame(), quoted = FALSE)
```

## Arguments

- outputId:

  Output identifier.

- width, height:

  CSS dimensions; the default height lets content adapt.

- expr:

  Expression creating a \[grouped_chord()\] widget.

- env:

  Environment in which to evaluate \`expr\`.

- quoted:

  Whether \`expr\` has already been quoted.

## Value

An output tag or a Shiny render function.

## Examples

``` r
if (interactive() && requireNamespace("shiny", quietly = TRUE)) {
  run_grouped_chord_demo()
}
```
