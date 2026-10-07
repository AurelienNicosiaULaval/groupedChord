# Run the entirely fictional workshop demonstration

Run the entirely fictional workshop demonstration

## Usage

``` r
run_grouped_chord_demo(...)
```

## Arguments

- ...:

  Arguments forwarded to \[shiny::runApp()\].

## Value

The result of \`shiny::runApp()\`, invisibly.

## Examples

``` r
if (interactive() && requireNamespace("shiny", quietly = TRUE)) {
  run_grouped_chord_demo()
}
```
