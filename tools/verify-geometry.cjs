const assert=require('node:assert/strict');
const fs=require('node:fs');
const {derive,radialLabel}=require('../inst/htmlwidgets/lib/groupedChord/layout.js');
const cases=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
let layouts=0, ribbons=0, groups=0;
for(const data of cases)for(const options of [{familyLabelRadius:200,nodeGap:.07,familyGap:.082},{familyLabelRadius:145,nodeGap:.168,familyGap:.18,familyLabels:Object.fromEntries(Object.keys(data.groupColours).map(k=>[k,k.slice(0,8)]))}]){
 const m=derive(data,options);layouts++;assert.equal(m.total,data.total);
 const byId=new Map(m.nodes.map(n=>[n.id,n]));
 for(const l of m.links){
  assert.ok(Math.abs((l.source.endAngle-l.source.startAngle)-(l.target.endAngle-l.target.startAngle))<1e-10);
  assert.ok(Math.abs((l.source.endAngle-l.source.startAngle)/l.value-m.unit)<1e-10);
  for(const [id,s]of [[l.from,l.source],[l.to,l.target]]){assert.ok(s.startAngle>=byId.get(id).startAngle-1e-10);assert.ok(s.endAngle<=byId.get(id).endAngle+1e-10);}
  ribbons++;
 }
 for(const side of ['left','right']){
  const n=m.nodes.filter(n=>n.side===side);assert.equal(n.reduce((s,d)=>s+d.total,0),m.total);
  for(let i=1;i<n.length;i++)assert.ok(n[i].startAngle>n[i-1].endAngle);
 }
 for(const g of m.families){const children=g.nodeIds.map(id=>byId.get(id));assert.equal(g.total,children.reduce((s,d)=>s+d.total,0));
  assert.ok(children.every(n=>n.family===g.label));assert.ok(children[0].startAngle>=g.startAngle-1e-10);assert.ok(children.at(-1).endAngle<=g.endAngle+1e-10);
  assert.ok(g.endAngle-g.startAngle>=g.minSpan-1e-10);groups++;
 }
 for(const n of m.nodes){const l=radialLabel(n,150,48,160,18);assert.ok(Number.isFinite(l.x)&&Number.isFinite(l.y));assert.ok(l.rotate>=-90-1e-10&&l.rotate<=90+1e-10);}
}
assert.deepEqual(derive({nodes:[],links:[],total:0}).links,[]);
console.log(JSON.stringify({cases:cases.length,layouts,ribbons,groups}));
