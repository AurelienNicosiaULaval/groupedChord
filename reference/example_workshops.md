# Entirely fictional production flows from workshops to objects

Invented workshops, objects, families and quantities over three invented
annual scenarios. Values are produced by a fixed arithmetic rule; no
real project records, labels, proportions or dates were used. The unit
is a fictional manufactured object. Values are illustrative, not
observations.

## Usage

``` r
example_workshops()
```

## Value

A data frame of 108 rows with columns \`year\`, \`workshop\`, \`item\`,
\`family\` and \`quantity\`. There are four workshops, eighteen objects
and four object families. Each object has two workshop links per year.

## Examples

``` r
d <- example_workshops()
head(d)
#>   year          workshop    item family quantity
#> 1 2024 Atelier Ceramique     Bol Maison       33
#> 2 2024     Atelier Metal     Bol Maison       11
#> 3 2024 Atelier Ceramique    Vase Maison       46
#> 4 2024     Atelier Metal    Vase Maison       18
#> 5 2024   Atelier Textile Coussin Maison       59
#> 6 2024      Atelier Bois Coussin Maison       25
aggregate(quantity ~ year, d, sum)
#>   year quantity
#> 1 2024     1162
#> 2 2025     1312
#> 3 2026     1462
```
