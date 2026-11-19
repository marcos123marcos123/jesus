/* team.js — Bienvenida con nombres + envío de resultados.
   Se carga DESPUÉS de app.js y no lo modifica. */
(function(){
  'use strict';
  const TEAM_KEY = 'proyecto_jesus_team_v1';
  const STATE_KEY = 'proyecto_jesus_v1';
  const LAST_SEND_KEY = 'proyecto_jesus_last_send';
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  function loadTeam(){
    try{
      const raw = localStorage.getItem(TEAM_KEY);
      if(!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data.filter(n => n && String(n).trim()) : [];
    }catch(e){ return []; }
  }
  function saveTeam(names){
    try{ localStorage.setItem(TEAM_KEY, JSON.stringify(names)); }catch(e){}
  }

  function injectStyles(){
    if(document.querySelector('link[data-team="1"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = 'team.css';
    link.setAttribute('data-team','1');
    document.head.appendChild(link);
  }

  function injectTeamGate(){
    if(document.getElementById('teamGate')) return;
    const main = document.querySelector('main');
    if(!main) return;
    const section = document.createElement('section');
    section.id = 'teamGate';
    section.className = 'screen teamgate';
    section.hidden = true;
    section.innerHTML = `
      <div class="teamgate__inner">
        <p class="eyebrow">Bienvenida</p>
        <h1 class="teamgate__title">¿Quiénes participan?</h1>
        <p class="teamgate__text">Escribe el nombre de cada integrante del grupo. Los resultados del cuestionario se enviarán junto con estos nombres.</p>
        <div class="teamgate__list" id="teamList"></div>
        <button type="button" class="btn btn--ghost" id="teamAdd">+ Añadir integrante</button>
        <button type="button" class="btn btn--primary btn--lg" id="teamStart">Continuar</button>
      </div>`;
    main.insertBefore(section, main.firstChild);
  }

  function injectSendButton(){
    const actions = document.querySelector('.final__actions');
    if(!actions || document.getElementById('sendResultsBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'sendResultsBtn';
    btn.className = 'btn btn--primary';
    btn.type = 'button';
    btn.textContent = 'Enviar resultados';
    actions.insertBefore(btn, actions.firstChild);
  }

  function hideAllScreens(){
    ['welcome','experience','transition','knowledge','final','teamGate'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.hidden = true;
    });
  }
  function showTeamGate(){
    hideAllScreens();
    const gate = document.getElementById('teamGate');
    if(gate) gate.hidden = false;
    window.scrollTo(0,0);
  }
  function hideTeamGate(){
    const gate = document.getElementById('teamGate');
    if(gate) gate.hidden = true;
    const w = document.getElementById('welcome');
    if(w) w.hidden = false;
    window.scrollTo(0,0);
  }

  function renderInputs(names){
    const list = document.getElementById('teamList');
    if(!list) return;
    const n = Math.max(1, names.length);
    list.innerHTML = '';
    for(let i=0;i<n;i++){
      const row = document.createElement('div');
      row.className = 'teamgate__row';
      const val = (names[i] || '').replace(/"/g,'&quot;');
      row.innerHTML = `
        <span class="teamgate__num">${i+1}</span>
        <input type="text" class="teamgate__input" placeholder="Nombre del integrante ${i+1}" value="${val}" autocomplete="off">
        <button type="button" class="teamgate__remove" aria-label="Quitar">×</button>`;
      list.appendChild(row);
    }
    refreshRemove();
  }
  function refreshRemove(){
    const rows = $$('.teamgate__row');
    rows.forEach(r => {
      const btn = r.querySelector('.teamgate__remove');
      if(btn) btn.hidden = rows.length <= 1;
    });
  }
  function collectNames(){
    return $$('.teamgate__input')
      .map(inp => (inp.value || '').trim())
      .filter(n => n.length > 0);
  }

  function readAppState(){
    try{ return JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); }
    catch(e){ return {}; }
  }

  async function handleSendResults(btn){
    const names = loadTeam();
    if(!names.length){ showToast('Primero completa la pantalla de bienvenida con los nombres.', 'error'); return; }
    const appState = readAppState();
    if(!appState.quizCompleted){ showToast('Aún no has completado el cuestionario.', 'error'); return; }

    const payload = {
      team: names,
      quiz: {
        score: appState.quizScore || 0,
        total: 10,
        answers: appState.quizAnswers || {}
      },
      reflections: appState.reflections || {}
    };

    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'Enviando…';

    try{
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if(res.ok && data.ok){
        localStorage.setItem(LAST_SEND_KEY, JSON.stringify({at: new Date().toISOString(), id: data.entry && data.entry.id}));
        showToast('Resultados enviados ✓', 'success');
        btn.textContent = 'Enviado ✓';
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2200);
        showThanksModal();
      }else{
        showToast('No se pudo enviar: ' + (data.error || res.statusText), 'error');
        btn.textContent = original; btn.disabled = false;
      }
    }catch(err){
      showToast('No se pudo enviar. Revisa la conexión.', 'error');
      btn.textContent = original; btn.disabled = false;
    }
  }

  function injectThanksStyles(){
    if(document.getElementById('thanksStyles')) return;
    const s = document.createElement('style');
    s.id = 'thanksStyles';
    s.textContent = [
      '.thanks-modal{position:fixed;inset:0;z-index:400;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeUp .3s var(--ease) both}',
      '.thanks-modal__backdrop{position:absolute;inset:0;background:rgba(20,16,12,.6);backdrop-filter:blur(4px)}',
      '.thanks-modal__panel{position:relative;width:100%;max-width:480px;padding:clamp(28px,5vw,42px);background:var(--surface);border:1px solid var(--line-strong);border-radius:var(--radius);box-shadow:0 40px 90px -40px rgba(0,0,0,.7);text-align:center;animation:pop .35s var(--ease) both}',
      '.thanks-modal__eyebrow{font-size:.7rem;letter-spacing:.28em;text-transform:uppercase;color:var(--gold);margin:0 0 14px;font-weight:600}',
      '.thanks-modal__title{font-family:var(--serif);font-size:clamp(1.5rem,3.8vw,2rem);margin:0 0 14px;color:var(--ink)}',
      '.thanks-modal__text{color:var(--ink-2);font-size:.94rem;margin:0 0 24px;line-height:1.6}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function showThanksModal(){
    injectThanksStyles();
    if(document.getElementById('thanksModal')) return;
    const modal = document.createElement('div');
    modal.id = 'thanksModal';
    modal.className = 'thanks-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML =
      '<div class="thanks-modal__backdrop"></div>' +
      '<div class="thanks-modal__panel">' +
        '<p class="thanks-modal__eyebrow">Enviado</p>' +
        '<h2 class="thanks-modal__title">Gracias por leer y responder</h2>' +
        '<p class="thanks-modal__text">Tus resultados se han enviado correctamente. Que el mensaje de Jesús siga inspirando tu vida.</p>' +
        '<button class="btn btn--primary" id="thanksClose">Cerrar</button>' +
      '</div>';
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    const close = () => {
      document.body.style.overflow = '';
      modal.remove();
    };
    modal.querySelector('#thanksClose').addEventListener('click', close);
    modal.querySelector('.thanks-modal__backdrop').addEventListener('click', close);
  }

  function showToast(msg, type){
    let t = document.getElementById('teamToast');
    if(!t){ t = document.createElement('div'); t.id = 'teamToast'; t.className = 'team-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.dataset.type = type || 'info';
    t.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => t.classList.remove('show'), 3400);
  }

  document.addEventListener('click', e => {
    const t = e.target;
    if(t && t.classList && t.classList.contains('teamgate__remove')){
      const rows = $$('.teamgate__row');
      if(rows.length <= 1) return;
      const idx = rows.findIndex(r => r.contains(t));
      if(idx < 0) return;
      const names = rows.map(r => r.querySelector('.teamgate__input').value);
      names.splice(idx, 1);
      renderInputs(names);
      return;
    }
    if(!t || !t.id) return;

    if(t.id === 'teamAdd'){
      const rows = $$('.teamgate__row');
      if(rows.length >= 12) return;
      const names = rows.map(r => r.querySelector('.teamgate__input').value);
      names.push('');
      renderInputs(names);
      const inputs = $$('.teamgate__input');
      if(inputs.length) inputs[inputs.length-1].focus();
    }
    if(t.id === 'teamStart'){
      const names = collectNames();
      if(!names.length){ showToast('Escribe al menos el nombre de un integrante.', 'error'); return; }
      saveTeam(names);
      hideTeamGate();
      updateWelcomeMeta();
    }
    if(t.id === 'sendResultsBtn'){ handleSendResults(t); }
  });

  // Init
  injectStyles();
  injectTeamGate();
  injectSendButton();

  if(new URLSearchParams(location.search).get('reset') === 'team'){
    try{ localStorage.removeItem(TEAM_KEY); }catch(e){}
  }

  const saved = loadTeam();
  renderInputs(saved);
  if(!saved.length){ showTeamGate(); }

  // Quitar los 4 botones antiguos (deja solo "Enviar resultados")
  function removeLegacyButtons(){
    document.querySelectorAll('.final__actions .btn').forEach(btn => {
      if(btn.id !== 'sendResultsBtn') btn.remove();
    });
  }
  removeLegacyButtons();
  updateWelcomeMeta();
  setTimeout(removeLegacyButtons, 300);
  setTimeout(removeLegacyButtons, 1200);

  window.TeamAPI = {
    getNames: loadTeam,
    hasNames: () => loadTeam().length > 0,
    reset: () => { try{ localStorage.removeItem(TEAM_KEY); }catch(e){} }
  };
})();
