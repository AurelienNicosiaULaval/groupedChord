# Architecture du composant

Une fonction R valide et agrège les lignes de liens, puis fournit un
objet htmlwidgets. Le widget possède son SVG, sa liste étroite et son
tableau de secours. Shiny possède les filtres et les données de chaque
application. D3 7.9.0 et les styles sont livrés localement dans le
package.

Le contrat est générique : source, destination, groupe optionnel et
poids. Une destination ne peut appartenir à plusieurs groupes. Les zéros
sont retirés; les poids négatifs, manquants ou non finis sont refusés.
Les deux extrémités d’un ruban partagent une unité angulaire. Les arcs
de groupes incluent de l’espace pour les noms et ne constituent pas une
mesure de poids.

Les noms sont droits, orientés vers l’extérieur et retournés sur la
moitié gauche. Sous 480 pixels de largeur de dessin, une clé remplace
les noms par leurs repères. La largeur du conteneur pilote le calcul,
avec une table en secours lorsqu’un dessin est trop chargé. Chaque
instance possède ses propres identifiants SVG, événements, clé, export
et observateur de redimensionnement. Deux instances sont prévues dans la
vérification du navigateur.

Les clics émettent `<outputId>_click` dans Shiny et un événement DOM
`groupedchord:select`. L’export émet `<outputId>_svg` avec le XML et le
contexte fourni en R. Le package ne décide ni des filtres ni de leur
stockage URL. L’application peut donc garder ses signets et un
téléchargement Shiny normal.

Les exemples décrivent exclusivement des ateliers et des objets
inventés. Ils sont déterministes, sans reprise ni transformation de
données du projet. La nouvelle application utilise séparément ses
agrégats locaux et ses propres correspondances, en passant les noms et
les couleurs au composant.
