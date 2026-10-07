/* Chaque instance possède ses éléments, événements, identifiants et export. */
(function(root) {
  'use strict';
  let instanceCount = 0;
  const d3 = root.GroupedChordD3;
  root.GroupedChordRenderer = function(el) {
    const prefix = 'groupedChord-' + (++instanceCount);
    el.classList.add('gc-widget'); el.style.height = 'auto';
    el.replaceChildren();
    const header=document.createElement('div'); header.className='gc-header';
    const heading=document.createElement('div'); heading.className='gc-title';
    const download=document.createElement('a'); download.className='gc-download'; download.textContent='Exporter SVG'; download.setAttribute('download','grouped-chord.svg');
    header.append(heading,download);
    const status=document.createElement('div'); status.className='gc-status'; status.setAttribute('role','status'); status.setAttribute('aria-live','polite');
    const host=document.createElement('div'); host.className='gc-chart';
    const key=document.createElement('div'); key.className='gc-key';
    const tableDetails=document.createElement('details'); tableDetails.className='gc-table';
    const summary=document.createElement('summary'); summary.textContent='Voir les liens et les valeurs';
    const tableWrap=document.createElement('div'); tableWrap.className='gc-table-scroll'; tableDetails.append(summary,tableWrap);
    el.append(header,status,host,key,tableDetails);
    let current=null, lastWidth=0, exportUrl=null, selectedId=null;
    const ink='#263f43', muted='#657477';
    function send(name,value) {if (root.Shiny && root.HTMLWidgets.shinyMode) root.Shiny.setInputValue(el.id+'_'+name,value,{priority:'event'});}
    function action(selection,callback) {
      selection.attr('role','button').attr('tabindex',0).on('click',(event,d)=>callback(d))
        .on('keydown',(event,d)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();callback(d);}});
    }
    function emit(event) {send('click',event);el.dispatchEvent(new CustomEvent('groupedchord:select',{detail:event}));}
    function renderTable(data,number) {
      tableWrap.replaceChildren();
      const table=document.createElement('table'), thead=document.createElement('thead'), tr=document.createElement('tr');
      const columns=[data.options.labels.source,data.options.labels.target,data.options.labels.group,data.options.unit];
      columns.forEach(label=>{const th=document.createElement('th');th.scope='col';th.textContent=label;tr.append(th);});
      thead.append(tr);table.append(thead);
      const tbody=document.createElement('tbody');
      (data.table||[]).forEach(row=>{
        const tr=document.createElement('tr');
        [row.source,row.target,row.group,number.format(row.value)].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td);});
        tbody.append(tr);
      });
      table.append(tbody);tableWrap.append(table);
    }
    function wrapSource(label,limit) {
      const lines=[];let line='';
      label.split(/\s+/).forEach(word=>{if(line && (line+' '+word).length>limit){lines.push(line);line=word;}else line=line ? line+' '+word : word;});
      if(line) lines.push(line);
      return lines.length ? lines : [label];
    }
    function render(data) {
      current=data;
      const width=Math.round(el.getBoundingClientRect().width);
      if(!width) return;
      lastWidth=width;
      if(exportUrl){URL.revokeObjectURL(exportUrl);exportUrl=null;}
      download.removeAttribute('href');download.setAttribute('aria-disabled','true');download.tabIndex=-1;
      send('svg',null);
      host.replaceChildren();key.replaceChildren();
      const options=data.options, number=new Intl.NumberFormat(options.locale,{maximumSignificantDigits:8});
      heading.textContent=options.title||''; heading.hidden=!options.title;
      download.hidden=!options.showControls;header.hidden=!options.title&&!options.showControls;
      tableDetails.hidden=!options.showTable;tableDetails.open=false;
      renderTable(data,number);
      if(!data.links.length){status.textContent='Aucun lien positif pour cette sélection.';return;}
      if(width<220){status.textContent='Espace trop étroit pour le cercle. Les liens et les valeurs restent dans le tableau.';key.hidden=true;tableDetails.hidden=false;tableDetails.open=true;return;}
      try {
        const narrow=width<620;let compact=width<480;
        const detailed=data.grouped && data.level==='targets';
        const nameFont=width>900 ? 12.5 : 12, groupFont=narrow ? 10.5 : 11.5;
        const groupLabels={};
        (data.nodes||[]).filter(d=>d.role==='target').forEach(node=>{
          const full=node.family;
          groupLabels[full]=narrow ? ((data.groupLabels||{})[full]||(full.length>12 ? full.slice(0,9)+'…' : full)) : full;
        });
        const groupColor=label=>(data.groupColours||{})[label]||'#657477';
        const measure=d3.select(host).append('svg').attr('aria-hidden','true').attr('font-family','system-ui, -apple-system, sans-serif')
          .style('position','absolute').style('visibility','hidden');
        const textWidth=(text,size)=>measure.append('text').attr('font-size',size).text(text).node().getComputedTextLength();
        const familyLabelWidths={},nameWidths={},lines={};
        [...new Set(data.nodes.filter(d=>d.role==='target').map(d=>d.family))].forEach(label=>{
          familyLabelWidths[label]=textWidth(groupLabels[label]||label,groupFont);
        });
        data.nodes.forEach(node=>{
          lines[node.id]=node.role==='source' ? wrapSource(node.label,options.sourceLabelWidth) : [node.label];
          const parts=lines[node.id].map((line,i)=>line+(i===lines[node.id].length-1 ? ' · '+number.format(node.total) : ''));
          nameWidths[node.id]=Math.max(...parts.map(line=>textWidth(line,nameFont)));
        });
        measure.remove();
        let radius=compact ? Math.min(108,width*.27) : Math.min(214,width*.28),model,labels,bounds;
        function layout() {
          const spacing=(compact ? 24 : nameFont+2)/(radius+(detailed ? 48 : 16));
          model=root.GroupedChordLayout.derive(data,{familyLabelRadius:radius+27,familyLabels:groupLabels,familyLabelWidths,
            nodeGap:Math.max(.055,spacing),familyGap:Math.max(.055,spacing+.012)});
          labels=model.nodes.map(node=>root.GroupedChordLayout.radialLabel(node,radius,
            detailed&&node.role==='target' ? 48 : 16,compact ? 24 : nameWidths[node.id],compact ? 24 : Math.max(18,lines[node.id].length*15)));
          const track=radius+(detailed ? 39 : 9);
          bounds={minX:Math.min(-track,...labels.map(d=>d.box.minX)),maxX:Math.max(track,...labels.map(d=>d.box.maxX)),
            minY:Math.min(-track,...labels.map(d=>d.box.minY)),maxY:Math.max(track,...labels.map(d=>d.box.maxY))};
        }
        for(;radius>=55;radius-=3){layout();if(bounds.maxX-bounds.minX<=width-24 || compact || radius<58)break;}
        if(!compact && bounds.maxX-bounds.minX>width-24){compact=true;radius=Math.min(108,width*.27);layout();}
        const height=Math.ceil(Math.max(compact ? 360 : 480,bounds.maxY-bounds.minY+110));
        const cx=(width-bounds.maxX-bounds.minX)/2,cy=(height-bounds.maxY-bounds.minY)/2;
        const left=model.nodes.filter(d=>d.role==='source'),right=model.nodes.filter(d=>d.role!=='source');
        if(selectedId && !model.nodes.some(d=>d.id===selectedId) && !model.families.some(d=>d.id===selectedId))selectedId=null;
        status.textContent=`${number.format(model.links.length)} liens · ${data.level==='groups' ? options.labels.group : options.labels.target} : ${number.format(right.length)}`+
          (detailed ? ` · ${options.labels.group} : ${number.format(model.families.length)}` : '');
        const svg=d3.select(host).append('svg').attr('xmlns','http://www.w3.org/2000/svg').attr('viewBox',`0 0 ${width} ${height}`)
          .attr('width',width).attr('height',height).attr('role','group').attr('aria-label',options.title||`${options.labels.source} et ${options.labels.target}`)
          .attr('data-total',model.total).attr('data-nodes',model.nodes.length).attr('data-links',model.links.length)
          .attr('data-groups',model.families.length).attr('data-label-layout',compact ? 'radial-numbers' : 'radial-names')
          .attr('font-family','system-ui, -apple-system, sans-serif');
        svg.append('title').text(options.title||`${options.labels.source} et ${options.labels.target}`);
        svg.append('desc').text(`${number.format(model.total)} ${options.unit}. Les rubans portent la couleur des sources; les groupes et leurs destinations partagent une couleur. L'anneau de classification comprend de l'espace pour les noms et ne mesure pas un poids. ${(options.footnote||[]).join(' ')}`);
        svg.append('rect').attr('width',width).attr('height',height).attr('fill','#fff');
        svg.append('text').attr('x',12).attr('y',22).attr('fill',muted).attr('font-size',10).attr('letter-spacing',.6).text(options.labels.source.toLocaleUpperCase(options.locale));
        svg.append('text').attr('x',width-12).attr('y',22).attr('text-anchor','end').attr('fill',muted).attr('font-size',10).attr('letter-spacing',.6)
          .text((data.level==='groups' ? options.labels.group : options.labels.target).toLocaleUpperCase(options.locale));
        const plot=svg.append('g').attr('transform',`translate(${cx},${cy})`);
        const ribbons=plot.append('g').selectAll('path').data(model.links).join('path').attr('class','gc-ribbon')
          .attr('d',d3.ribbon().radius(radius-2)).attr('fill',d=>d.color).attr('fill-opacity',.36).attr('stroke','#fff').attr('stroke-width',.65).attr('stroke-opacity',.72)
          .attr('data-value',d=>d.value).attr('data-from',d=>d.from).attr('data-to',d=>d.to)
          .attr('aria-label',d=>`${d.sourceLabel}, ${d.targetLabel}, ${number.format(d.value)} ${options.unit}.`);
        ribbons.append('title').text(d=>`${d.sourceLabel} ↔ ${d.targetLabel} : ${number.format(d.value)} ${options.unit}`);
        const sectors=plot.append('g').selectAll('path').data(model.nodes).join('path').attr('class','gc-node-sector')
          .attr('d',d3.arc().innerRadius(radius).outerRadius(radius+9).cornerRadius(1)).attr('fill',d=>d.color)
          .attr('data-node',d=>d.id).attr('data-group',d=>d.family).attr('data-value',d=>d.total)
          .attr('aria-label',d=>`${d.label}, ${number.format(d.total)} ${options.unit}. Sélectionner.`);
        sectors.append('title').text(d=>`${d.label} : ${number.format(d.total)} ${options.unit}`);
        const groups=plot.append('g').selectAll('g').data(model.families).join('g').attr('class','gc-group')
          .attr('data-group',d=>d.label).attr('data-value',d=>d.total).attr('aria-label',d=>`${d.label}, ${d.nodeIds.length} destinations, ${number.format(d.total)} ${options.unit}.`);
        groups.append('path').attr('class','gc-group-sector').attr('d',d3.arc().innerRadius(radius+16).outerRadius(radius+39).cornerRadius(2)).attr('fill',d=>groupColor(d.label));
        groups.append('title').text(d=>`${d.label} : ${number.format(d.total)} ${options.unit}`);
        const groupRadius=radius+27;
        groups.append('path').attr('id',(d,i)=>prefix+'-group-'+i).attr('fill','none').attr('stroke','none').attr('d',d=>{
          const reverse=d.mid>Math.PI/2&&d.mid<3*Math.PI/2;
          const point=a=>[Math.sin(a)*groupRadius,-Math.cos(a)*groupRadius];
          return `M${point(reverse ? d.endAngle : d.startAngle)}A${groupRadius},${groupRadius} 0 ${d.endAngle-d.startAngle>Math.PI ? 1 : 0},${reverse ? 0 : 1} ${point(reverse ? d.startAngle : d.endAngle)}`;
        });
        groups.append('text').attr('class','gc-group-text').attr('fill','#fff').attr('font-size',groupFont).attr('text-anchor','middle')
          .append('textPath').attr('href',(d,i)=>'#'+prefix+'-group-'+i).attr('startOffset','50%').text(d=>d.displayLabel);
        model.nodes.forEach((d,i)=>{d.keyNumber=i+1;});
        const byId=new Map(model.nodes.map(d=>[d.id,d]));
        const labelGroups=svg.append('g').selectAll('g').data(labels).join('g').attr('class','gc-node-label').attr('data-node',d=>d.id)
          .attr('transform',d=>`translate(${cx+d.x},${cy+d.y}) rotate(${d.rotate})`).attr('aria-label',d=>`${d.label}, ${number.format(d.total)} ${options.unit}. Sélectionner.`);
        labelGroups.each(function(d){
          const g=d3.select(this),lineCount=lines[d.id].length,labelHeight=compact ? 26 : Math.max(26,lineCount*15+4),w=compact ? 30 : nameWidths[d.id]+8;
          g.append('rect').attr('class','gc-label-hit').attr('x',compact ? -15 : (d.flip ? -w+4 : -4)).attr('y',-labelHeight/2).attr('width',w).attr('height',labelHeight).attr('rx',3).attr('fill','transparent');
          if(compact){g.append('circle').attr('r',10).attr('fill',d.color);g.append('text').attr('y',3.5).attr('text-anchor','middle').attr('font-size',10).attr('fill','#fff').text(byId.get(d.id).keyNumber);}
          else {
            const text=g.append('text').attr('text-anchor',d.flip ? 'end' : 'start').attr('fill',ink).attr('font-size',nameFont);
            lines[d.id].forEach((line,i)=>{
              const span=text.append('tspan').attr('x',0).attr('y',4-(lineCount-1)*7.5+i*15).text(line);
              if(i===lineCount-1)span.append('tspan').attr('fill',muted).text(' · '+number.format(d.total));
            });
          }
        });
        function highlight(id){
          const group=model.families.find(d=>d.id===id),ids=new Set(group ? group.nodeIds : [id]);
          const related=link=>ids.has(link.from)||ids.has(link.to);
          ribbons.attr('fill-opacity',d=>!id ? .36 : (related(d) ? .72 : .055));
          sectors.attr('fill-opacity',d=>!id||ids.has(d.id)||model.links.some(l=>related(l)&&(l.from===d.id||l.to===d.id)) ? 1 : .3);
          groups.select('.gc-group-sector').attr('fill-opacity',d=>!id||d.id===id||d.nodeIds.some(child=>ids.has(child))||model.links.some(l=>related(l)&&d.nodeIds.includes(l.to)) ? 1 : .3);
        }
        function selectNode(node){selectedId=selectedId===node.id ? null : node.id;highlight(selectedId);emit({type:node.role==='source' ? 'source' : (node.role==='target' ? 'target' : 'group'),id:node.id,label:node.label,group:node.role==='source' ? null : (node.family||node.label),value:node.total});}
        [sectors,labelGroups].forEach(selection=>{action(selection,selectNode);selection.on('pointerenter',(event,d)=>highlight(d.id)).on('pointerleave',()=>highlight(selectedId)).on('focus',(event,d)=>highlight(d.id)).on('blur',()=>highlight(selectedId));});
        action(groups,d=>{selectedId=d.id;highlight(d.id);emit({type:'group',id:d.id,label:d.label,group:d.label,value:d.total});});
        groups.on('pointerenter',(event,d)=>highlight(d.id)).on('pointerleave',()=>highlight(selectedId)).on('focus',(event,d)=>highlight(d.id)).on('blur',()=>highlight(selectedId));
        action(ribbons,d=>emit({type:'link',source:d.sourceLabel,target:d.targetLabel,group:d.group,view:data.level,value:d.value}));
        ribbons.on('pointerenter',(event,d)=>ribbons.attr('fill-opacity',link=>link===d ? .8 : .055)).on('pointerleave',()=>highlight(selectedId));
        const hasKey=compact||narrow&&model.families.some(d=>d.displayLabel!==d.label);
        key.hidden=!hasKey;
        if(hasKey){
          function addNode(d){const b=document.createElement('button');b.type='button';b.className='gc-key-node';b.dataset.node=d.id;
            const index=document.createElement('span');index.className='gc-key-index';index.style.background=d.color;index.textContent=d.keyNumber;
            const label=document.createElement('span');label.textContent=d.label;
            const value=document.createElement('span');value.className='gc-key-value';value.textContent=number.format(d.total);
            b.append(index,label,value);b.addEventListener('click',()=>selectNode(d));key.append(b);}
          left.forEach(addNode);
          if(detailed)model.families.forEach(group=>{
            const b=document.createElement('button');b.type='button';b.className='gc-key-group';b.dataset.group=group.label;b.style.borderLeftColor=groupColor(group.label);
            const name=document.createElement('span');name.textContent=group.label;
            const value=document.createElement('span');value.textContent=number.format(group.total);b.append(name,value);
            b.addEventListener('click',()=>{selectedId=group.id;highlight(group.id);emit({type:'group',id:group.id,label:group.label,group:group.label,value:group.total});});key.append(b);
            right.filter(d=>d.family===group.label).forEach(addNode);
          }); else right.forEach(addNode);
        }
        svg.append('text').attr('x',width/2).attr('y',height-14).attr('text-anchor','middle').attr('font-size',10).attr('fill',muted).text(`${number.format(model.total)} ${options.unit}`);
        const exported=svg.node().cloneNode(true);let exportHeight=height;
        function exportText(text,x,y,size){const e=document.createElementNS('http://www.w3.org/2000/svg','text');e.setAttribute('x',x);e.setAttribute('y',y);e.setAttribute('font-size',size);e.setAttribute('fill',muted);e.textContent=text;exported.append(e);}
        if(hasKey){let row=0;left.forEach(d=>exportText(`${d.keyNumber}. ${d.label} · ${number.format(d.total)}`,12,height+22+row++*22,11));
          if(detailed)model.families.forEach(group=>{exportText(`${options.labels.group} : ${group.label}`,12,height+22+row++*22,11);right.filter(d=>d.family===group.label).forEach(d=>exportText(`${d.keyNumber}. ${d.label} · ${number.format(d.total)}`,22,height+22+row++*22,11));});
          else right.forEach(d=>exportText(`${d.keyNumber}. ${d.label} · ${number.format(d.total)}`,12,height+22+row++*22,11));exportHeight+=row*22+16;}
        const notes=[...(detailed ? ['Anneau extérieur : classification; espaces réservés aux noms.'] : []),...(options.footnote||[])];
        notes.forEach(note=>{const words=note.split(/\s+/);let line='';const limit=Math.max(32,Math.floor((width-24)/5.3));words.forEach(word=>{if(line&&(line+' '+word).length>limit){exportText(line,12,exportHeight+=16,9.5);line=word;}else line=line ? line+' '+word : word;});if(line)exportText(line,12,exportHeight+=16,9.5);});
        exportHeight+=12;exported.setAttribute('height',exportHeight);exported.setAttribute('viewBox',`0 0 ${width} ${exportHeight}`);exported.querySelector('rect').setAttribute('height',exportHeight);
        const xml=new XMLSerializer().serializeToString(exported);
        exportUrl=URL.createObjectURL(new Blob([xml],{type:'image/svg+xml;charset=utf-8'}));download.href=exportUrl;download.removeAttribute('aria-disabled');download.tabIndex=0;
        send('svg',{xml,total:model.total,view:data.level,context:data.context||{}});highlight(selectedId);
      }catch(error){host.replaceChildren();key.replaceChildren();key.hidden=true;status.textContent='Le dessin ne peut pas tenir dans cet espace. Les liens et les valeurs restent dans le tableau.';tableDetails.hidden=false;tableDetails.open=true;console.error(error);}
    }
    download.addEventListener('click',event=>{if(!download.getAttribute('href'))event.preventDefault();});
    const observer=new ResizeObserver(()=>{const width=Math.round(el.getBoundingClientRect().width);if(current&&width&&width!==lastWidth)render(current);});observer.observe(el);
    return {renderValue:render,resize:function(){const width=Math.round(el.getBoundingClientRect().width);if(current&&width&&width!==lastWidth)render(current);},destroy:function(){observer.disconnect();if(exportUrl)URL.revokeObjectURL(exportUrl);}};
  };
})(window);
