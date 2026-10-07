test_that("fictional examples are deterministic and describe a different world", {
  d <- example_workshops()
  expect_identical(d, example_workshops())
  expect_equal(nrow(d), 108L)
  expect_equal(length(unique(d$item)), 18L)
  expect_equal(length(unique(d$family)), 4L)
  expect_equal(sort(unique(d$year)), 2024:2026)
  expect_true(all(d$quantity > 0))
})

test_that("aggregation preserves weights and separate source/target identities", {
  d <- data.frame(from=c("Same","Same","Other"),to=c("Same","Same","Else"),g=c("One","One","Two"),w=c(1.25,2.75,4))
  p <- grouped_chord(d,"from","to","w",group="g")
  expect_s3_class(p,"htmlwidget")
  expect_equal(p$x$total,8)
  expect_length(p$x$links,2L)
  expect_true(all(c("s:Same","t:Same") %in% vapply(p$x$nodes,`[[`,character(1),"id")))
  for(role in c("source","target"))expect_equal(sum(vapply(Filter(function(n)n$role==role,p$x$nodes),`[[`,numeric(1),"total")),8)
  p2 <- grouped_chord(d,"from","to","w",group="g",view="groups")
  expect_equal(p2$x$total,p$x$total)
  expect_equal(sum(vapply(p2$x$links,`[[`,numeric(1),"value")),8)
})

test_that("zero weights and ungrouped flows have an honest empty/plain state", {
  d <- data.frame(source="A",target="B",value=0)
  p <- grouped_chord(d)
  expect_length(p$x$nodes,0)
  expect_length(p$x$links,0)
  expect_equal(p$x$total,0)
  d$value <- 2
  expect_false(grouped_chord(d)$x$grouped)
  expect_error(grouped_chord(d,view="groups"),"requires a group")
})

test_that("invalid data do not silently become plausible links", {
  d <- data.frame(source=c("A","A"),target=c("B","B"),group=c("One","Two"),value=c(1,2))
  expect_error(grouped_chord(d,group="group"),"exactly one group")
  d$group <- "One"
  for(bad in c(-1,NA_real_,NaN,Inf)){
    d$value[1] <- bad
    expect_error(grouped_chord(d,group="group"),"finite, non-negative")
  }
  d$value <- c(1,2);d$target[1] <- " "
  expect_error(grouped_chord(d,group="group"),"missing or blank")
  expect_error(grouped_chord(list()),"data frame")
  expect_error(grouped_chord(data.frame(a=1)),"existing column")
})

test_that("palettes are stable across subsets and complete explicit palettes are enforced", {
  expect_identical(chord_palette("Maison"),chord_palette(c("Jardin","Maison"))["Maison"])
  d <- data.frame(source=c("A","B"),target=c("C","D"),group=c("One","Two"),value=c(1,2))
  expect_error(grouped_chord(d,group="group",source_colours=c(A="red")),"covering")
  expect_error(grouped_chord(d,group="group",source_colours=c(A="not-a-colour",B="blue")),"invalid colour")
  p <- grouped_chord(d,group="group",group_colours=c(One="#123456",Two="#654321"))
  expect_equal(p$x$nodes[[3]]$color,"#123456")
  expect_equal(p$x$groupColours$One,"#123456")
})
