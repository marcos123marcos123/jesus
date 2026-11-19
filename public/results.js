/* results.js — consulta /api/results y pinta el panel */
'use strict';
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const state = { results: [] };

async function loadResults(){
  try{
    const res = await fetch('/api/results', { cache: 'no-store' });
    const data = await res.json();
    state.results = Array.isArray(data.results) ? data.results : [];
  }catch(e){ state.results = []; }
  render();
}

function fmtDate(iso){
  if(!iso) return '—';
  try{
    const d = new Date(iso);
    return d.toLocaleString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }catch(e){ return iso; }
}

function render(){
  const results = state.results;
  const totalSends = results.length;
  const totalPeople = results.reduce((a,r) => a + ((r.team && r.team.length) || 0), 0);
  const scores = results.map(r => (r.quiz && typeof r.quiz.score === 'number') ? r.quiz.score : null).filter(n => n !== null);
  const totals = results.map(r => (r.quiz && typeof r.quiz.total === 'number') ? r.quiz.total : 10);
  const avg = scores.length ? (scores.reduce((a,b) => a+b, 0) / scores.length) : null;
  const maxTotal = Math.max(...totals, 10);
  const best = scores.length ? Math.max(...scores) : null;

  $('#summary').hidden = results.length === 0;
  $('#totalSends').textContent = totalSends;
  $('#totalPeople').textContent = totalPeople;
  $('#avgScore').textContent = avg !== null ? `${avg.toFixed(1)}/${maxTotal}` : '—';
  $('#bestScore').textContent = best !== null ? `${best}/${maxTotal}` : '—';

  const table = $('#table');
  const empty = $('#empty');
  const tbody = $('#tbody');

  if(!results.length){
    table.hidden = true; empty.hidden = false; tbody.innerHTML = ''; return;
  }
  empty.hidden = true; table.hidden = false;

  tbody.innerHTML = results.slice().reverse().map((r, i) => {
    const idx = results.length - i;
    const team = (r.team || []).join(', ') || '—';
    const score = (r.quiz && typeof r.quiz.score === 'number') ? r.quiz.score : '?';
    const total = (r.quiz && typeof r.quiz.total === 'number') ? r.quiz.total : 10;
    const refs = r.reflections || {};
    const refsCount = ['q1','q2','q3'].filter(k => refs[k] && refs[k].trim()).length;
    const refsOk = refsCount === 3;
    return `
      <tr>
        <td class="r-id" data-label="#">${idx}</td>
        <td class="r-team" data-label="Equipo">${escapeHtml(team)}</td>
        <td class="r-score" data-label="Resultado">${score}<small>/${total}</small></td>
        <td data-label="Reflexiones"><span class="r-pill ${refsOk ? 'r-pill--ok' : 'r-pill--no'}">${refsCount}/3</span></td>
        <td class="r-date" data-label="Fecha">${escapeHtml(fmtDate(r.receivedAt))}</td>
        <td><button class="r-btn-detail" data-id="${r.id}">Ver</button> <button class="r-btn-del" data-del="${r.id}">Borrar</button></td>
      </tr>`;
  }).join('');

  $$('.r-btn-detail').forEach(btn => {
    btn.addEventListener('click', () => openDetail(Number(btn.dataset.id)));
  });
  $$('.r-btn-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      if(!confirm('¿Borrar este envío? Esta acción no se puede deshacer.')) return;
      try{
        const res = await fetch('/api/results/' + btn.dataset.del, { method: 'DELETE' });
        if(res.ok) loadResults();
        else alert('No se pudo borrar');
      }catch(e){ alert('Error al borrar'); }
    });
  });
}

function openDetail(id){
  const r = state.results.find(x => x.id === id);
  if(!r) return;
  const refs = r.reflections || {};
  const quiz = r.quiz || {};
  const team = r.team || [];

  $('#detailTag').textContent = 'Detalle del envío';
  $('#detailTitle').textContent = team.join(', ') || 'Equipo sin nombre';
  $('#detailBody').innerHTML = `
    <h4>Resultado del cuestionario</h4>
    <p>${quiz.score ?? '—'} de ${quiz.total ?? 10} aciertos.</p>
    <h4>Participantes</h4>
    <ul>${team.map(n => `<li>${escapeHtml(n)}</li>`).join('') || '<li>—</li>'}</ul>
    <h4>Reflexiones</h4>
    ${renderRef('¿Qué enseñanza de Jesús ha llamado más tu atención?', refs.q1)}
    ${renderRef('¿Cómo puedes aplicar esa enseñanza en tu vida?', refs.q2)}
    ${renderRef('¿Qué significa para ti vivir con fe, amor y esperanza?', refs.q3)}
    <h4>Recibido</h4>
    <p>${escapeHtml(fmtDate(r.receivedAt))}</p>`;
  const modal = $('#detail');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function renderRef(q, a){
  if(!a || !a.trim()) return `<p><em>${escapeHtml(q)}</em><br><span style="color:var(--ink-3)">Sin respuesta.</span></p>`;
  return `<p><em>${escapeHtml(q)}</em></p><blockquote>${escapeHtml(a)}</blockquote>`;
}

function escapeHtml(s){
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function closeDetail(){
  const modal = $('#detail');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.addEventListener('click', e => { if(e.target.closest('[data-close]')) closeDetail(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeDetail(); });
$('#refreshBtn').addEventListener('click', loadResults);

loadResults();
setInterval(loadResults, 15000);
