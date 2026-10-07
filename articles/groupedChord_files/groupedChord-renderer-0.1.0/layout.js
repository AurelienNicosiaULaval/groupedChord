/* Géométrie pondérée : la même unité angulaire aux deux extrémités d'un ruban. */
(function(root) {
  'use strict';
  function derive(data, options = {}) {
    const nodes = (data.nodes || []).map(d => ({...d}));
    const links = (data.links || []).map(d => ({...d}));
    if (!links.length) return {nodes: [], links: [], families: [], total: 0, unit: 0};
    const total = links.reduce((sum, d) => sum + d.value, 0);
    if (!Number.isFinite(total) || total <= 0 || links.some(d => !Number.isFinite(d.value) || d.value <= 0)) throw new Error('Poids invalide');
    const left = nodes.filter(d => d.role === 'source');
    const right = nodes.filter(d => d.role !== 'source');
    const boundary = .34;
    const available = 2 * Math.PI - 2 * boundary;
    const families = [];
    let unit;
    function position(group, center, gap) {
      const span = total * unit + Math.max(0, group.length - 1) * gap;
      let angle = center - span / 2;
      group.forEach((d, index) => {
        d.startAngle = angle;
        d.endAngle = angle + d.total * unit;
        d.mid = (d.startAngle + d.endAngle) / 2;
        d.side = center > Math.PI ? 'left' : 'right';
        d.order = index;
        angle = d.endAngle + gap;
      });
    }
    if (!data.grouped || data.level === 'groups') {
      const gap = options.nodeGap || .065;
      unit = (available - (nodes.length - 2) * gap) / (2 * total);
      position(left, 3 * Math.PI / 2, gap);
      position(right, Math.PI / 2, gap);
    } else {
      // Les espaces de l'anneau de classification accueillent les noms.
      // Seuls les secteurs intérieurs et les rubans encodent des poids.
      const withinGap = options.nodeGap || .025, familyGap = options.familyGap || .055, leftGap = options.nodeGap || .055;
      const labelRadius = options.familyLabelRadius || 200;
      const seen = new Set();
      right.forEach(node => {
        let group = families.at(-1);
        if (!group || group.label !== node.family) {
          if (seen.has(node.family)) throw new Error('Destinations non contiguës par groupe');
          seen.add(node.family);
          const label = node.family;
          const displayLabel = options.familyLabels?.[label] || label;
          const textWidth = options.familyLabelWidths?.[label] ?? displayLabel.length * 7;
          group = {id:'g:'+label,label,displayLabel,total:0,nodeIds:[],minSpan:(textWidth+16)/labelRadius};
          families.push(group);
        }
        group.nodeIds.push(node.id); group.total += node.total;
      });
      const leftSpaces = Math.max(0,left.length-1)*leftGap;
      const rightSpaces = Math.max(0,families.length-1)*familyGap;
      const groupSpan = (family, u) => Math.max(family.minSpan, family.total*u+(family.nodeIds.length-1)*withinGap+.035);
      const used = u => total*u+leftSpaces+rightSpaces+families.reduce((sum,d)=>sum+groupSpan(d,u),0);
      if (used(0) >= available) throw new Error('Espace insuffisant pour les noms des groupes');
      let low=0, high=available/(2*total);
      for (let i=0;i<60;i++) {
        const middle=(low+high)/2;
        if (used(middle)>available) high=middle; else low=middle;
      }
      unit=(low+high)/2;
      position(left,3*Math.PI/2,leftGap);
      const rightSpan = rightSpaces+families.reduce((sum,d)=>sum+groupSpan(d,unit),0);
      let angle=Math.PI/2-rightSpan/2;
      let order=0;
      families.forEach(family => {
        family.startAngle=angle; family.endAngle=angle+groupSpan(family,unit);
        family.mid=(family.startAngle+family.endAngle)/2;
        const children=right.filter(d=>d.family===family.label);
        const childSpan=family.total*unit+(children.length-1)*withinGap;
        let childAngle=angle+(family.endAngle-angle-childSpan)/2;
        children.forEach(node => {
          node.startAngle=childAngle; node.endAngle=childAngle+node.total*unit;
          node.mid=(node.startAngle+node.endAngle)/2; node.side='right'; node.order=order++;
          childAngle=node.endAngle+withinGap;
        });
        angle=family.endAngle+familyGap;
      });
    }
    if (unit <= 0) throw new Error('Trop de secteurs pour ce cercle');
    const byId = new Map(nodes.map(d => [d.id, d]));
    if (byId.size !== nodes.length) throw new Error('Identifiant dupliqué');
    nodes.forEach(node => {
      let angle = node.startAngle;
      const incident = links.filter(d => d.from === node.id || d.to === node.id);
      incident.sort((a, b) => {
        const aOther = byId.get(a.from === node.id ? a.to : a.from);
        const bOther = byId.get(b.from === node.id ? b.to : b.from);
        if (!aOther || !bOther) throw new Error('Extrémité absente');
        return aOther.order - bOther.order;
      });
      incident.forEach(link => {
        const segment = {startAngle: angle, endAngle: angle + link.value * unit};
        if (node.id === link.from) link.source = segment; else link.target = segment;
        angle = segment.endAngle;
      });
      if (Math.abs(angle - node.endAngle) > 1e-9) throw new Error('Total de secteur incohérent');
    });
    return {nodes, links, families, total, unit};
  }
  // Nom droit dans le prolongement du secteur, retourné sur la moitié gauche.
  // La boîte calculée permet de réserver de la place au texte sans le tronquer.
  function radialLabel(node, radius, offset, textWidth, lineHeight = 18) {
    const angle = ((node.mid % (2*Math.PI))+2*Math.PI)%(2*Math.PI);
    const flip = angle > Math.PI;
    const rotate = ((angle*180/Math.PI-90+(flip ? 180 : 0)+180)%360)-180;
    const distance = radius+offset;
    const x = Math.sin(node.mid)*distance, y = -Math.cos(node.mid)*distance;
    const rotation = rotate*Math.PI/180;
    const xs = flip ? [-textWidth,0] : [0,textWidth];
    const ys = [-lineHeight/2,lineHeight/2];
    const corners=xs.flatMap(a=>ys.map(b=>({x:x+a*Math.cos(rotation)-b*Math.sin(rotation),y:y+a*Math.sin(rotation)+b*Math.cos(rotation)})));
    const box={minX:Math.min(...corners.map(d=>d.x)),maxX:Math.max(...corners.map(d=>d.x)),minY:Math.min(...corners.map(d=>d.y)),maxY:Math.max(...corners.map(d=>d.y))};
    return {...node,x,y,rotate,flip,box};
  }
  const api = {derive, radialLabel};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GroupedChordLayout = api;
})(typeof window === 'undefined' ? {} : window);
