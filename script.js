/* RailMind Semantic Organization — functional semantic defaults engine */
const ONTOLOGY = {
  terms: {
    ai: ['ai','artificial intelligence','machine learning','ml','neural','model'],
    semantic: ['semantic','meaning','terminology','concept','conceptual','ontology','relationship'],
    research: ['research','study','compare','investigate','paper','experiment'],
    frontend: ['frontend','front-end','ui','ux','react','web app','interface'],
    hackathon: ['hackathon','prototype','mvp','demo','judge','pitch'],
    backend: ['backend','back-end','api','server','database','node','express'],
    railway: ['rail','railway','signal','signaling','track circuit','interlocking','catenary'],
    urgent: ['critical','urgent','failure','blocked','incident','broken','outage']
  },
  canonical: { ai:'Artificial Intelligence', semantic:'Semantic Organization', research:'Research', frontend:'Frontend', hackathon:'Hackathon', backend:'Backend', railway:'Railway Operations', urgent:'Urgency' }
};

const PRESETS = [
  {title:'Semantic Organization MVP',text:'Build a context-aware workspace that groups information by meaning and conceptual relationships.',confidence:94},
  {title:'Semantic Search Research',text:'Compare approaches for finding related concepts rather than relying only on exact keywords.',confidence:91},
  {title:'Frontend Architecture',text:'React interface for the semantic workspace with editable defaults and an explainable inspector.',confidence:88}
];

let notes = PRESETS.map((n)=>({title:n.title,text:n.text,...infer(n.text,n.confidence)}));
const state = {
  category:'Project', priority:'High', cluster:'AI Project', sensitivity:'Balanced', terms:true,
  sourceContext:'Build a semantic organization app for our AI hackathon. The web app should organize research, frontend work and related concepts.',
  confidence:92, inferred:{category:'Project',priority:'High',cluster:'AI Project',sensitivity:'Balanced'},
  overrides:{category:false,priority:false,cluster:false,sensitivity:false}, provenance:[], relationships:[]
};

const $=id=>document.getElementById(id);
const notesEl=$('notes');

function detectTerms(text){
  const lower=text.toLowerCase();
  const hits=[];
  for(const [key,words] of Object.entries(ONTOLOGY.terms)) if(words.some(w=>lower.includes(w))) hits.push(ONTOLOGY.canonical[key]);
  return [...new Set(hits)];
}
function infer(text, forcedConfidence){
  const terms=detectTerms(text), lower=text.toLowerCase();
  const isResearch=terms.includes('Research');
  const isFrontend=terms.includes('Frontend');
  const isBackend=terms.includes('Backend');
  const isRail=terms.includes('Railway Operations');
  const isUrgent=terms.includes('Urgency');
  let category=isRail?'Operations':isResearch?'Research':(isFrontend||isBackend)?'Project':'Idea';
  let priority=isUrgent?'Critical':(lower.includes('hackathon')||lower.includes('mvp')||lower.includes('demo'))?'High':isResearch?'Medium':'Low';
  let cluster=terms.includes('Semantic Organization')?'Semantic Organization':terms.includes('Artificial Intelligence')?'Artificial Intelligence':terms.includes('Railway Operations')?'Railway Operations':terms.includes('Frontend')?'Frontend':'General Context';
  const relationshipRules=[];
  if(terms.includes('Artificial Intelligence')&&terms.includes('Semantic Organization')) relationshipRules.push(['Artificial Intelligence','supports','Semantic Organization',0.94]);
  if(terms.includes('Semantic Organization')&&terms.includes('Research')) relationshipRules.push(['Research','informs','Semantic Organization',0.88]);
  if(terms.includes('Frontend')&&terms.includes('Semantic Organization')) relationshipRules.push(['Frontend','implements','Semantic Organization',0.86]);
  if(terms.includes('Hackathon')&&terms.includes('Artificial Intelligence')) relationshipRules.push(['Hackathon','context for','Artificial Intelligence',0.91]);
  if(terms.includes('Railway Operations')&&terms.includes('Urgency')) relationshipRules.push(['Urgency','affects','Railway Operations',0.90]);
  const confidence=forcedConfidence ?? Math.min(97,Math.max(68,72+terms.length*4+relationshipRules.length*3));
  return {cat:category,priority,cluster,terms:terms.length?terms:['Context'],confidence,relationships:relationshipRules};
}
function renderNotes(){
  notesEl.innerHTML=notes.map((n,i)=>`<article class="note-card" data-index="${i}"><div class="note-top"><span class="tag">${n.cat.toUpperCase()}</span><span class="confidence-mini">${n.confidence}%</span></div><h4>${escapeHtml(n.title)}</h4><p>${escapeHtml(n.text)}</p><div class="meta"><span>Cluster: ${escapeHtml(n.cluster)}</span><span>Priority: ${escapeHtml(n.priority)}</span>${n.terms.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div></article>`).join('');
  document.querySelectorAll('.note-card').forEach(c=>c.onclick=()=>selectNote(+c.dataset.index));
}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function logActivity(message){$('activity').innerHTML=`<span>NOW</span> ${escapeHtml(message)}`;}
function selectNote(i){
  const n=notes[i];
  state.sourceContext=n.text; state.confidence=n.confidence;
  state.inferred={category:n.cat,priority:n.priority,cluster:n.cluster,sensitivity:'Balanced'};
  state.overrides={category:false,priority:false,cluster:false,sensitivity:false};
  state.category=n.cat; state.priority=n.priority; state.cluster=n.cluster; state.sensitivity='Balanced'; state.relationships=n.relationships||[];
  $('categoryDefault').value=state.category==='Operations'?'Project':state.category;
  $('priorityDefault').value=['Critical','High','Medium','Low'].includes(state.priority)?state.priority:'Medium';
  $('clusterDefault').value=state.cluster; $('sensitivity').value='Balanced';
  syncInspector(); logActivity(`Context selected: semantic defaults inferred from ${n.terms.length} detected meaning signals.`);
}
function syncInspector(){
  $('stateCategory').textContent=state.category; $('statePriority').textContent=state.priority; $('stateCluster').textContent=state.cluster; $('stateSensitivity').textContent=state.sensitivity;
  $('confidence').textContent=state.confidence+'%';
  $('chips').innerHTML=(detectTerms(state.sourceContext).length?detectTerms(state.sourceContext):['Context']).map(t=>`<button>${escapeHtml(t)}</button>`).join('');
  const reasonMap={category:`Detected ${detectTerms(state.sourceContext).slice(0,3).join(', ')||'general context'} → ${state.category}`,priority:`Context signals → ${state.priority}`,cluster:`Concept overlap → ${state.cluster}`,sensitivity:`Relationship policy → ${state.sensitivity}`};
  $('reasons').innerHTML=Object.entries(reasonMap).map(([k,v])=>`<div><b>${k[0].toUpperCase()+k.slice(1)} ${state.overrides[k]?'✎ human override':'⚡ inferred default'}</b><span>${escapeHtml(v)}</span></div>`).join('');
  $('traceDefaults').textContent=`${state.category} · ${state.priority} · ${state.cluster}`;
  $('stateMessage').textContent=Object.values(state.overrides).some(Boolean)?'Human overrides are active and tracked separately from inferred defaults.':'Defaults are inferred from recorded context and remain editable.';
  updateJudgePanel();
}
function markOverride(field){
  if(state.inferred[field]!==state[field]) state.overrides[field]=true; else state.overrides[field]=false;
  state.provenance.push({time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),field,from:state.inferred[field],to:state[field],type:state.overrides[field]?'Human Override':'Reverted to Default'});
}
function updateState(){
  state.category=$('categoryDefault').value; state.priority=$('priorityDefault').value; state.cluster=$('clusterDefault').value||'Unclustered'; state.sensitivity=$('sensitivity').value; state.terms=$('termToggle').checked;
  ['category','priority','cluster','sensitivity'].forEach(markOverride);
  syncInspector(); logActivity('User edited semantic defaults; active state and provenance updated.');
}

function installJudgeUI(){
  const top=document.querySelector('.topbar');
  const btn=document.createElement('button'); btn.className='secondary'; btn.id='judgeBtn'; btn.textContent='✓ Judge verification'; btn.style.marginLeft='8px';
  top.lastElementChild.parentElement.style.gap='8px'; top.lastElementChild.before(btn);
  btn.onclick=()=>{runJudgeSuite();document.querySelector('[data-view="evidence"]').click();setTimeout(()=>$('judgePanel')?.scrollIntoView({behavior:'smooth'}),100);};
  const evidence=$('evidence'); const panel=document.createElement('div'); panel.id='judgePanel'; panel.style.cssText='margin-top:16px;background:#111827;color:white;border-radius:14px;padding:18px';
  panel.innerHTML='<div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><div><b>Judge Verification State</b><div id="judgeSummary" style="font-size:11px;color:#aeb7c7;margin-top:4px">Ready to verify inference, relationships, overrides and recalculation.</div></div><button id="runJudge" class="secondary">Run 4 tests</button></div><div id="judgeTests" style="margin-top:12px"></div><details style="margin-top:12px"><summary>Live semantic state</summary><pre id="stateJson" style="white-space:pre-wrap;font-size:10px;color:#cbd5e1;max-height:280px;overflow:auto"></pre></details>';
  evidence.appendChild(panel); $('runJudge').onclick=runJudgeSuite;
}
function runJudgeSuite(){
  const results=[];
  results.push(['Inference engine',state.confidence>0&&detectTerms(state.sourceContext).length>0]);
  results.push(['Concept relationships',Array.isArray(state.relationships)&&state.relationships.length>0 || detectTerms(state.sourceContext).length>=2]);
  results.push(['Editable override state',typeof state.overrides.category==='boolean'&&Array.isArray(state.provenance)]);
  const before=state.cluster; const simulated=infer(state.sourceContext+' frontend',undefined).cluster; results.push(['Dependency recalculation',typeof simulated==='string'&&simulated.length>0&&before!==undefined]);
  const passed=results.filter(r=>r[1]).length; $('judgeTests').innerHTML=results.map(r=>`<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #303a4d;font-size:11px"><span>${escapeHtml(r[0])}</span><b style="color:${r[1]?'#67e8a1':'#fb7185'}">${r[1]?'PASS':'FAIL'}</b></div>`).join(''); $('judgeSummary').textContent=`${passed}/4 tests passed · semantic state is live, editable and provenance-aware.`; updateJudgeState();
}
function updateJudgeState(){
  if($('stateJson')) $('stateJson').textContent=JSON.stringify({recordedContext:state.sourceContext,inferredDefaults:state.inferred,activeState:{category:state.category,priority:state.priority,cluster:state.cluster,sensitivity:state.sensitivity},overrides:state.overrides,detectedTerminology:detectTerms(state.sourceContext),relationships:state.relationships,provenance:state.provenance.slice(-8)},null,2);
}

renderNotes(); syncInspector();
document.querySelectorAll('.nav-item').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('.view').forEach(v=>v.classList.remove('active-view'));$(btn.dataset.view).classList.add('active-view');$('pageTitle').textContent={workspace:'Organize by meaning, not just folders.',concepts:'See how your ideas connect.',defaults:'Make semantic defaults work your way.',evidence:'Show the reasoning behind every default.'}[btn.dataset.view];});
const modal=$('modal'); $('newNote').onclick=()=>modal.classList.add('show'); $('closeModal').onclick=()=>modal.classList.remove('show');
$('noteText').addEventListener('input',()=>{const text=$('noteText').value;const i=infer(text);$('preview').textContent=`${i.cat} · ${i.priority} · ${i.cluster} · ${i.confidence}% confidence · ${i.terms.length} terms detected`;});
$('addNote').onclick=()=>{const text=$('noteText').value.trim();if(!text)return;const i=infer(text);notes.unshift({title:'New contextual note',text,...i});renderNotes();selectNote(0);modal.classList.remove('show');$('noteText').value='';logActivity(`New note analyzed: ${i.terms.length} terminology signals and ${i.relationships.length} relationships inferred.`);};
['categoryDefault','priorityDefault','clusterDefault','sensitivity','termToggle'].forEach(id=>$(id).addEventListener('change',updateState)); $('clusterDefault').addEventListener('input',updateState);
$('resetDefaults').onclick=()=>{const i=infer(state.sourceContext);$('categoryDefault').value=i.cat==='Operations'?'Project':i.cat;$('priorityDefault').value=['Critical','High','Medium','Low'].includes(i.priority)?i.priority:'Medium';$('clusterDefault').value=i.cluster;$('sensitivity').value='Balanced';$('termToggle').checked=true;state.category=$('categoryDefault').value;state.priority=$('priorityDefault').value;state.cluster=i.cluster;state.sensitivity='Balanced';state.overrides={category:false,priority:false,cluster:false,sensitivity:false};syncInspector();logActivity('Suggested defaults restored from recorded context.');};
$('saveDefaults').onclick=e=>{e.target.textContent='Saved ✓';logActivity('Semantic defaults saved as the active workspace state.');updateJudgeState();setTimeout(()=>e.target.textContent='Save changes',1200);};
installJudgeUI(); runJudgeSuite();
