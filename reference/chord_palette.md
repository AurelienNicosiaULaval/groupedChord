# Stable named colours for circular diagrams

Generate a deterministic colour for each label. The result for a label
does not depend on the other labels in the vector. Explicit palettes can
also be passed to \[grouped_chord()\]. Names and the table supplement
colour encoding.

## Usage

``` r
chord_palette(labels, type = c("group", "source"))
```

## Arguments

- labels:

  Character labels to colour.

- type:

  Palette role, either \`"group"\` or \`"source"\`.

## Value

A named character vector of hexadecimal colours.

## Examples

``` r
chord_palette(c("Maison", "Jardin"))
#>    Maison    Jardin 
#> "#00708B" "#00765D" 
```
