HTMLWidgets.widget({
  name: 'groupedChord',
  type: 'output',
  factory: function(el, width, height) {
    return new window.GroupedChordRenderer(el);
  }
});
