/* V3 carousel is isolated from the existing index and V2 scripts. */
(()=>{'use strict';
const root=document.querySelector('[data-v3-carousel]');if(!root)return;
const slides=[
{eyebrow:'FOR BUYERS · DISCOVER',title:['좋은 공급사를 찾는','가장 빠른 방법'],description:'기업 카탈로그부터 제품과 기술 정보까지. 새로운 비즈니스 파트너를 IndustryBook에서 발견하세요.',primary:['카탈로그 검색하기','catalogs.html'],secondary:['기업 찾기','companies.html'],icon:'⚙',card:['DISCOVER INDUSTRY','기술과 공급사를 연결하다','카탈로그 · 제품 · 기업']},
{eyebrow:'FOR SUPPLIERS · GROW',title:['우리 기업의 기술을','전 세계 바이어에게'],description:'기업 정보와 제품 카탈로그를 등록하고, 새로운 바이어와 지속적인 비즈니스 기회를 만들어보세요.',primary:['우리 기업 무료 등록하기','signup.html'],secondary:['카탈로그 등록하기','register.html'],icon:'▣',card:['GROW YOUR BUSINESS','우리 기업을 알리는 새로운 방법','기업 정보 · 디지털 카탈로그']},
{eyebrow:'SUPPLY CHAIN FINANCE · SCF',title:['거래 이후, 자금의','기회까지 연결하다'],description:'계약 완료 거래를 기반으로 공급망 금융의 연계 가능성을 살펴보세요. 현재 금융 신청 화면은 시연 단계입니다.',primary:['SCF 자세히 보기','scf.html'],secondary:['거래 관리 살펴보기','deals.html'],icon:'↗',card:['SCF · PREVIEW','거래 기반 금융 연계','금융 서비스 준비 단계 · UI 시연']}
];
const $=s=>root.querySelector(s);const title=$('[data-v3-title]'),eyebrow=$('[data-v3-eyebrow]'),desc=$('[data-v3-description]'),primary=$('[data-v3-primary]'),secondary=$('[data-v3-secondary]'),counter=$('[data-v3-count]'),dots=[...root.querySelectorAll('[data-v3-dot]')],pause=$('[data-v3-pause]');const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');let index=0,timer=null,paused=false,hovered=false,focused=false;
function show(i){index=(i+slides.length)%slides.length;const s=slides[index];root.dataset.v3Slide=String(index);eyebrow.textContent=s.eyebrow;title.replaceChildren(document.createTextNode(s.title[0]),document.createElement('br'));const em=document.createElement('em');em.textContent=s.title[1];title.append(em);desc.textContent=s.description;primary.firstChild.textContent=s.primary[0]+' ';primary.setAttribute('href',s.primary[1]);secondary.firstChild.textContent=s.secondary[0]+' ';secondary.setAttribute('href',s.secondary[1]);$('[data-v3-visual-icon]').textContent=s.icon;$('[data-v3-card-label]').textContent=s.card[0];$('[data-v3-card-title]').textContent=s.card[1];$('[data-v3-card-caption]').textContent=s.card[2];counter.textContent=String(index+1).padStart(2,'0')+' / 03';dots.forEach((dot,j)=>dot.setAttribute('aria-current',String(j===index)))}
function stop(){if(timer!==null){clearInterval(timer);timer=null}}
function start(){stop();if(!paused&&!hovered&&!focused&&!document.hidden&&!reduced.matches)timer=setInterval(()=>show(index+1),5500)}
function select(i){show(i);start()}
$('[data-v3-prev]').addEventListener('click',()=>select(index-1));$('[data-v3-next]').addEventListener('click',()=>select(index+1));dots.forEach((dot,i)=>dot.addEventListener('click',()=>select(i)));
pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'자동 전환 재생':'자동 전환 일시정지');start()});
root.addEventListener('mouseenter',()=>{hovered=true;stop()});root.addEventListener('mouseleave',()=>{hovered=false;start()});
root.addEventListener('focusin',()=>{focused=true;stop()});root.addEventListener('focusout',e=>{if(!root.contains(e.relatedTarget)){focused=false;start()}});
document.addEventListener('visibilitychange',start);if(reduced.addEventListener)reduced.addEventListener('change',start);show(0);start();
})();