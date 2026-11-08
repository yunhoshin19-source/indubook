/* Independent THE KLAB-style V3 carousel; existing application JS unchanged. */
(()=>{'use strict';
const root=document.querySelector('[data-v3-carousel]');if(!root)return;const $=q=>root.querySelector(q);
const slides=[
{eyebrow:'FOR BUYERS · DISCOVER',title:['좋은 공급사를 찾는','가장 빠른 방법'],description:'기업 카탈로그, 제품, 기술 정보를 한 번에 탐색하고 비교하세요. IndustryBook에서 새로운 비즈니스 파트너를 발견하세요.',primary:['카탈로그 검색하기','catalogs.html'],secondary:['기업 찾기','companies.html'],status:'바이어의 탐색을 새로운 거래 기회로'},
{eyebrow:'FOR SUPPLIERS · GROW',title:['우리 기업의 기술을','더 넓은 시장에'],description:'기업 정보와 제품 카탈로그를 등록하고 새로운 바이어와 연결하세요. 검색과 추천으로 우리 기업을 알릴 수 있습니다.',primary:['우리 기업 무료 등록하기','signup.html'],secondary:['카탈로그 등록하기','register.html'],status:'공급사와 새로운 고객을 연결합니다'},
{eyebrow:'SUPPLY CHAIN FINANCE · SCF',title:['거래 이후의 운영까지','자금 흐름을 연결하다'],description:'계약 완료 거래를 바탕으로 공급망 금융 연계 가능성을 살펴보세요. 현재 관련 금융 신청 기능은 시연 단계입니다.',primary:['SCF 자세히 보기','scf.html'],secondary:['거래 관리 살펴보기','deals.html'],status:'SCF · 금융 서비스 준비 단계(UI 시연)'}
];
let i=0,timer=null,paused=false,hovered=false,focused=false;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const dots=[...root.querySelectorAll('[data-v3-dot]')],pause=$('[data-v3-pause]');
function render(n){i=(n+slides.length)%slides.length;const s=slides[i];root.dataset.v3Slide=String(i);$('[data-v3-eyebrow]').textContent=s.eyebrow;const t=$('[data-v3-title]');t.replaceChildren(document.createTextNode(s.title[0]),document.createElement('br'));const em=document.createElement('em');em.textContent=s.title[1];t.append(em);$('[data-v3-description]').textContent=s.description;for(const [attr,link] of [['[data-v3-primary]',s.primary],['[data-v3-secondary]',s.secondary]]){const el=$(attr);el.setAttribute('href',link[1]);el.firstChild.textContent=link[0]+' ';} $('[data-v3-visual-status]').textContent=s.status;$('[data-v3-count]').textContent=String(i+1).padStart(2,'0')+' / 03';dots.forEach((dot,idx)=>dot.setAttribute('aria-current',String(idx===i)));}
function stop(){if(timer!==null){clearInterval(timer);timer=null}}
function start(){stop();if(!paused&&!hovered&&!focused&&!document.hidden&&!reduced.matches)timer=setInterval(()=>render(i+1),5500)}
function select(n){render(n);start()}
$('[data-v3-prev]').addEventListener('click',()=>select(i-1));$('[data-v3-next]').addEventListener('click',()=>select(i+1));dots.forEach((d,idx)=>d.addEventListener('click',()=>select(idx)));
pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'자동 전환 재생':'자동 전환 일시정지');pause.setAttribute('aria-pressed',String(paused));start()});
root.addEventListener('mouseenter',()=>{hovered=true;stop()});root.addEventListener('mouseleave',()=>{hovered=false;start()});root.addEventListener('focusin',()=>{focused=true;stop()});root.addEventListener('focusout',e=>{if(!root.contains(e.relatedTarget)){focused=false;start()}});document.addEventListener('visibilitychange',start);if(reduced.addEventListener)reduced.addEventListener('change',start);render(0);start();
})();