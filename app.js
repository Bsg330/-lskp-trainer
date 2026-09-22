let Q=[],pool=[],i=0,score=0,errorTraining=false;
const H=document.querySelector('#home'),V=document.querySelector('#view');

fetch('questions.json').then(r=>r.json()).then(x=>{Q=x;home()});

const sh=a=>[...a].sort(()=>Math.random()-.5);
function errs(){return JSON.parse(localStorage.errors||'[]')}
function saveErrs(e){localStorage.errors=JSON.stringify([...new Set(e)])}
function stats(){return JSON.parse(localStorage.stats||'{"runs":0,"best":0}')}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function home(){
  errorTraining=false;
  V.classList.add('hide'); H.classList.remove('hide');
  let e=errs(),s=stats();
  H.innerHTML=`
  <button class="tile" onclick="start(Q.filter(q=>q.module==='11.2.3.1'))">📚<b>Lernen</b><small>11.2.3.1 · ${Q.filter(q=>q.module==='11.2.3.1').length} Fragen</small></button>
  <button class="tile" onclick="start(Q.filter(q=>q.module==='11.2.3.1'))">📝<b>Prüfungstraining</b><small>Testpool 11.2.3.1</small></button>
  <button class="tile" onclick="errorMode()">❌<b>Meine Fehler</b><small>${e.length} gespeichert</small></button>
  <button class="tile" onclick="info('Statistik','Runden: ${s.runs}<br>Bestwert: ${s.best}%')">📊<b>Statistik</b><small>${s.runs?'Bestwert '+s.best+'%':'Noch kein Test'}</small></button>
  <button class="tile" onclick="law()">⚖️<b>Rechtsgrundlagen</b><small>3 EU-Regelwerke</small></button>
  <button class="tile" onclick="modules()">✈️<b>Module</b><small>11.2.3.1–11.2.3.5</small></button>
  <button class="tile" onclick="info('Brandschutz & Technik','Vorgemerkt für den Ausbau der Testversion: Brandschutz sowie Technik-/Detektionswissen, z. B. ETD und EDD. Inhalte werden vor Veröffentlichung fachlich geprüft.')">🧯<b>Brandschutz & Technik</b><small>Ausbau geplant</small></button>
  <button class="tile" onclick="legal()">ℹ️<b>Info & Rechtliches</b><small>Hinweise · Version</small></button>`;
}

function start(p,asErrors=false){
  pool=sh(p||Q); i=0; score=0; errorTraining=asErrors;
  if(!pool.length){info('Noch keine Fragen','Für diesen Bereich sind in Testversion 1.0 noch keine Übungsfragen hinterlegt.');return}
  show();
}

function show(){
  H.classList.add('hide'); V.classList.remove('hide');
  let q=pool[i];
  V.innerHTML=`<button class="back" onclick="home()">‹ Start</button>
  <div class="muted">${i+1} / ${pool.length} · ${esc(q.module)}${errorTraining?' · Fehlertraining':''}</div>
  <h2>${esc(q.question)}</h2><div id="a"></div><div id="f"></div>`;
  q.answers.forEach((x,n)=>{
    let b=document.createElement('button'); b.className='ans';
    b.textContent=String.fromCharCode(65+n)+'. '+x;
    b.onclick=()=>pick(n); document.querySelector('#a').appendChild(b)
  })
}

function pick(n){
  let q=pool[i],bs=[...document.querySelectorAll('.ans')],right=n===q.correct;
  bs.forEach((b,k)=>{b.disabled=true;if(k===q.correct)b.classList.add('good');if(k===n&&!right)b.classList.add('bad')});
  let e=errs();
  if(right){
    score++;
    // Bugfix 1.0: Im Fehlertraining verschwindet eine richtig beantwortete Frage sofort.
    if(errorTraining){e=e.filter(id=>id!==q.id);saveErrs(e)}
  }else{
    if(!e.includes(q.id))e.push(q.id);
    saveErrs(e);
  }
  document.querySelector('#f').innerHTML=`<p class="muted"><b>${right?'Richtig.':'Noch nicht.'}</b> ${esc(q.explanation)}
  ${right&&errorTraining?'<br><span class="fixed">✓ Aus „Meine Fehler“ entfernt.</span>':''}</p>
  <button class="next" onclick="next()">Weiter</button>`
}

function next(){if(++i<pool.length)show();else finish()}

function finish(){
  let pct=Math.round(score/pool.length*100),s=stats();
  s.runs++;s.best=Math.max(s.best,pct);localStorage.stats=JSON.stringify(s);
  let left=errs().length;
  V.innerHTML=`<div class="muted">Auswertung</div><div class="score">${score}/${pool.length}</div><h2>${pct}%</h2>
  <p class="muted">${errorTraining?`Noch ${left} Frage${left===1?'':'n'} unter „Meine Fehler“.`:'Falsche Antworten sind für „Meine Fehler“ gespeichert.'}</p>
  <button class="next" onclick="home()">Zur Startseite</button>`
}

function errorMode(){
  let e=errs(),p=Q.filter(q=>e.includes(q.id));
  // Migration alter 0.1-Fehler, die als Fragetext gespeichert wurden
  let oldTexts=e.filter(x=>!String(x).includes('-'));
  if(oldTexts.length){
    let ids=Q.filter(q=>oldTexts.includes(q.question)).map(q=>q.id);
    e=[...e.filter(x=>!oldTexts.includes(x)),...ids];saveErrs(e);p=Q.filter(q=>e.includes(q.id))
  }
  p.length?start(p,true):info('Meine Fehler','Keine Fehler gespeichert. Falsch beantwortete Fragen landen automatisch hier. Richtig nachgeholte Fragen werden in Testversion 1.0 wieder entfernt.')
}

function modules(){
  H.classList.add('hide');V.classList.remove('hide');
  V.innerHTML=`<button class="back" onclick="home()">‹ Start</button><h2>Module</h2>
  <div class="module live"><b>11.2.3.1</b><span>Personen und mitgeführte Gegenstände</span><small>Testfragen aktiv</small></div>
  <div class="module"><b>11.2.3.2</b><span>Fracht & Post</span><small>optional · Fragen folgen</small></div>
  <div class="module"><b>11.2.3.3</b><span>Flughafenlieferungen & Bordvorräte</span><small>Fragen folgen</small></div>
  <div class="module"><b>11.2.3.4</b><span>Fahrzeugkontrollen</span><small>Fragen folgen</small></div>
  <div class="module"><b>11.2.3.5</b><span>Zugangskontrollen & Streifengänge</span><small>Fragen folgen</small></div>
  <p class="muted">Später kann der Nutzer seine benötigten Qualifikationen auswählen. Lernmodus, Fehlertraining und Prüfungssimulation werden daraus individuell zusammengestellt.</p>`
}

function law(){
  info('Rechtsgrundlagen / EU',
  '<b>VO (EG) Nr. 300/2008</b><br>gemeinsame Vorschriften für die Sicherheit in der Zivilluftfahrt<br><br>'+
  '<b>VO (EU) Nr. 272/2009</b><br>Ergänzung der gemeinsamen Grundstandards<br><br>'+
  '<b>DVO (EU) 2015/1998</b><br>detaillierte Maßnahmen für die Durchführung der gemeinsamen Grundstandards<br><br>'+
  '<span class="smallnote">Testversion: Lerninhalte werden vor Veröffentlichung anhand der jeweils geltenden amtlichen Fassungen geprüft.</span>')
}

function legal(){
  info('Info & Rechtliches',
  '<b>LSKP Trainer · Testversion 1.0</b><br><br>'+
  'Unabhängige private Lern- und Übungshilfe. Die enthaltenen Fragen sind selbst erstellt und keine offiziellen oder aktuellen Prüfungsfragen.<br><br>'+
  '<b>Impressum / Datenschutz / Nutzungsbedingungen</b><br>werden vor einer öffentlichen bzw. kommerziellen Veröffentlichung vollständig ergänzt.<br><br>'+
  '<span class="smallnote">Diese Testversion ersetzt keine vorgeschriebene Schulung, behördliche Prüfung oder betriebliche Anweisung.</span>')
}

function info(t,b){
  H.classList.add('hide');V.classList.remove('hide');
  V.innerHTML=`<button class="back" onclick="home()">‹ Start</button><h2>${t}</h2><p class="muted">${b}</p>`
}
