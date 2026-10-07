library(shiny)
library(groupedChord)
all_flows <- example_workshops()
source_colours <- c("Atelier Bois"="#397D8D", "Atelier Textile"="#B57950", "Atelier Metal"="#6670A6", "Atelier Ceramique"="#44705B")
group_colours <- c(Maison="#785D91", Jardin="#44705B", Loisirs="#946A3A", Bureau="#3E7187")
ui <- fluidPage(
  tags$head(tags$title("groupedChord | Ateliers et objets fictifs"), tags$meta(name="viewport",content="width=device-width, initial-scale=1"),
    tags$style(HTML("body{background:#f6f5f1;color:#263f43;font-family:system-ui,sans-serif}.demo-shell{max-width:1350px;margin:24px auto;padding:0 18px}.demo-note{color:#657477;font-size:13px}.demo-toolbar{display:flex;align-items:end;gap:20px;flex-wrap:wrap;background:white;padding:18px;margin:20px 0}.demo-toolbar .form-group{margin:0}.demo-main{background:white;padding:20px}.demo-summary{font-size:15px;padding:20px 0}.demo-summary strong{font-size:32px;font-weight:400}.demo-secondary{background:white;padding:20px;margin-top:20px}"))),
  div(class="demo-shell", h1("Ateliers et objets"), p("Exemple entièrement fictif du package groupedChord",class="demo-note"),
    p("Tous les noms et toutes les quantités sont inventés. Un clic explore les objets, les familles et les ateliers.",class="demo-note"),
    div(class="demo-toolbar", selectInput("year","Scénario annuel",2024:2026,selected=2025,selectize=FALSE,width="130px"),
      radioButtons("view","Affichage",c("Objets et familles"="targets","Familles regroupées"="groups"),inline=TRUE),
      actionButton("reset","Tout afficher"),downloadButton("export","Exporter le cercle")),
    fluidRow(column(9,div(class="demo-main",groupedChordOutput("demo"))),column(3,div(class="demo-summary",uiOutput("summary"),textOutput("selection")))),
    checkboxInput("compare","Afficher une seconde vue pour comparer",FALSE),uiOutput("comparison_ui")))
server <- function(input,output,session) {
  scope <- reactiveVal(list(source="",target="",group=""))
  selected <- reactive({
    d <- all_flows[all_flows$year==as.integer(input$year),]
    s <- scope()
    if(nzchar(s$source))d<-d[d$workshop==s$source,]
    if(nzchar(s$target))d<-d[d$item==s$target,]
    if(nzchar(s$group))d<-d[d$family==s$group,]
    d
  })
  observeEvent(input$reset,scope(list(source="",target="",group="")))
  observeEvent(input$demo_click,{
    e<-input$demo_click;s<-scope()
    if(e$type=="source")s$source<-e$label
    if(e$type=="target")s$target<-e$label
    if(e$type=="group"){s$group<-e$label;s$target<-""}
    if(e$type=="link"){s$source<-e$source;if(e$view=="groups")s$group<-e$group else s$target<-e$target}
    scope(s)
  },ignoreInit=TRUE)
  widget <- function(view) grouped_chord(selected(),"workshop","item","quantity",group="family",view=view,
    source_colours=source_colours,group_colours=group_colours,
    labels=list(source="Ateliers",target="Objets",group="Familles"),unit="objets fictifs",show_controls=FALSE,
    footnote=c("Données entièrement fictives, générées par une règle déterministe.",paste("Scénario",input$year)),context=list(year=input$year))
  output$demo<-renderGroupedChord(widget(input$view))
  output$summary<-renderUI(tagList(strong(sum(selected()$quantity)),p("objets fictifs"),p(paste(length(unique(selected()$item)),"objets et",length(unique(selected()$workshop)),"ateliers"))))
  output$selection<-renderText(paste(Filter(nzchar,unlist(scope())),collapse=" / "))
  output$export<-downloadHandler(filename=function(){req(input$demo_svg);paste0("ateliers-fictifs-",input$demo_svg$context$year,".svg")},
    content=function(file){req(input$demo_svg$xml);writeLines(enc2utf8(input$demo_svg$xml),file,useBytes=TRUE)},contentType="image/svg+xml")
  output$comparison_ui<-renderUI({if(isTRUE(input$compare))div(class="demo-secondary",h2("Seconde instance indépendante"),
    groupedChordOutput("comparison"),textOutput("comparison_selection"))})
  output$comparison<-renderGroupedChord(widget(if(input$view=="targets")"groups" else "targets"))
  output$comparison_selection<-renderText({if(!is.null(input$comparison_click))paste("Sélection de la seconde instance :",input$comparison_click$label)})
}
shinyApp(ui,server)
