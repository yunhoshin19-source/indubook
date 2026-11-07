/* IndustryBook Deal Thread — browser-only interactive prototype.
 No real authentication, multi-user delivery, payments or file upload. */
(function(){
'use strict';
const root=document.querySelector('[data-deal-page]');if(!root)return;
const $=id=>document.getElementById(id),KEY='ib-demo-business-requests-v1';
const statusNames={new:'새 요청',review:'기업 확인',assigned:'담당자 지정',respond:'회신',negotiating:'조건 협의',quoted:'견적 확정',trading:'거래 진행',completed:'완료',declined:'반려'};
const stageKeys=['new','review','assigned','respond','negotiating','quoted','trading','completed'];
const typeName={rfq:'견적 요청',rfc:'협업·제안 요청',inquiry:'일반 문의'};
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function write(items){localStorage.setItem(KEY,JSON.stringify(items))}
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
function sample(){return [{id:'sample-deal-01',type:'rfq',source:'product',sourceId:'p-cr20',sourceTitle:'CR-20 협동로봇',receiver:'A 로보틱스',company:'Global Manufacturing Co.',email:'',subject:'CR-20 협동로봇 20대 도입 견적 요청',quantity:'20',delivery:'2027-02-01',message:'CR-20 20대 도입을 검토 중입니다. 납기와 설치 지원을 포함한 견적을 요청드립니다.',status:'negotiating',owner:'샘플 담당자',quotation:{version:2,product:100000000,installation:12000000,support:8000000,total:120000000,currency:'KRW'},createdAt:'2026-11-07T09:10:00+09:00',updatedAt:'2026-11-07T14:32:00+09:00',history:[{mine:false,role:'buyer',author:'John Smith',text:'CR-20 20대 도입을 검토 중입니다. 납기와 설치 지원을 포함한 견적을 요청드립니다.',at:'2026-11-07T09:10:00+09:00'},{mine:true,role:'supplier',author:'김영업 · A 로보틱스',text:'요청 감사합니다. 1차 견적서와 납기 조건을 검토드립니다.',at:'2026-11-07T10:35:00+09:00',file:'quote_v1.pdf'},{mine:false,role:'buyer',author:'John Smith',text:'설치 교육과 통합 지원을 포함해 다시 제안해 주세요.',at:'2026-11-07T12:15:00+09:00'},{mine:true,role:'supplier',author:'김영업 · A 로보틱스',text:'요청 조건을 반영한 2차 견적을 전달드립니다. 총액은 1억2천만원입니다.',at:'2026-11-07T14:32:00+09:00',file:'quote_v2.pdf'}]}]}
const completedSample={id:'sample-scf-completed',type:'rfq',source:'product',sourceId:'p-cr20',sourceTitle:'CR-20 협동로봇',receiver:'A 로보틱스 (샘플)',company:'Global Manufacturing Co. (샘플)',subject:'협동로봇 납품 계약 완료 예시',quantity:'20',delivery:'2027-02-01',status:'completed',owner:'샘플 담당자',quotation:{version:2,product:100000000,installation:12000000,support:8000000,total:120000000,currency:'KRW'},createdAt:'2026-11-07T09:10:00+09:00',updatedAt:'2026-11-07T14:32:00+09:00',history:[{role:'system',author:'IndustryBook · 데모',text:'화면 시연을 위해 계약 완료로 표시했습니다. 실제 계약·납품·매출채권 증빙은 검증되지 않았습니다.',at:'2026-11-07T14:32:00+09:00'}]};
function all(){const items=load();return [...items,...(items.some(x=>x.id==='sample-deal-01')?[]:sample()),...(items.some(x=>x.id==='sample-scf-completed')?[]:[completedSample])]}
function date(x){try{return new Date(x).toLocaleString('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}catch{return ''}}
function money(x){return Number(x||0).toLocaleString('ko-KR')+'원'}
function safeVal(x){return x===undefined||x===null||x===''?'미등록':String(x)}
function currentState(d){return d.status==='demo-only'?'new':d.status||'new'}
function gate(){if(localStorage.getItem('ib-demo-logged-in')==='yes')return false;const next=location.pathname.split('/').pop()+location.search;location.replace('login.html?next='+encodeURIComponent(next));return true}
if(gate())return;
if(root.dataset.dealPage==='list'){
 const filter=$('dealFilter'),target=$('dealList');
 const render=()=>{const items=all().slice().sort((a,b)=>String(b.updatedAt||b.createdAt).localeCompare(String(a.updatedAt||a.createdAt)));
 $('dealTotal').textContent=items.length;$('dealPending').textContent=items.filter(x=>['new','review','assigned'].includes(currentState(x))).length;
 $('dealNegotiating').textContent=items.filter(x=>['respond','negotiating','quoted','trading'].includes(currentState(x))).length;
 $('dealFinished').textContent=items.filter(x=>currentState(x)==='completed').length;
 target.replaceChildren();const selected=items.filter(d=>filter.value==='all'||currentState(d)===filter.value||(filter.value==='review'&&currentState(d)==='assigned'));
 if(!selected.length)target.append(el('p','ib-deal-empty','선택한 상태의 거래 요청이 없습니다.'));
 selected.forEach(d=>{const a=el('a','ib-deal-list-row');a.href='deal-detail.html?id='+encodeURIComponent(d.id);const body=el('div','ib-deal-row-info');body.append(el('strong','',d.subject||d.sourceTitle),el('span','',safeVal(d.company)+' → '+safeVal(d.receiver)+' · '+(typeName[d.type]||'요청')));
 const aside=el('div','ib-deal-row-status');aside.append(el('span','ib-deal-status-pill',statusNames[currentState(d)]||'새 요청'),el('small','',date(d.updatedAt||d.createdAt)));a.append(body,aside);target.append(a)})};filter.onchange=render;render();
}else{
 const id=new URLSearchParams(location.search).get('id')||'sample-deal-01';
 const request=all().find(d=>d.id===id);if(!request){root.replaceChildren(el('p','ib-deal-empty','거래 요청을 찾을 수 없습니다.'));return}
 let record={...request,history:[...(request.history||[])]};
 if(!record.history.length)record.history=[{role:'buyer',author:safeVal(record.company)||'요청 기업',text:record.message||record.subject||'요청 등록',at:record.createdAt||new Date().toISOString()}];
 if(!record.status||record.status==='demo-only')record.status='new';
 const roleSelect=$('dealRole'),file=$('dealFile');
 const owner=record.company||'요청 기업';
 $('dealHeading').textContent=record.subject||'거래 스레드';$('dealSubheading').textContent=(typeName[record.type]||'요청')+' · '+record.sourceTitle;
 $('dealPartner').textContent=record.receiver;
 function fact(parent,key,value){const dt=el('dt','',key),dd=el('dd','',safeVal(value));parent.append(dt,dd)}
 function save(){const stored=load();const i=stored.findIndex(x=>x.id===record.id);record.updatedAt=new Date().toISOString();if(i===-1)stored.push(record);else stored[i]=record;write(stored)}
 function addSystem(text){record.history.push({role:'system',author:'IndustryBook · 데모',text,at:new Date().toISOString()});save();render()}
 function advance(stage,notice){
  record.status=stage;addSystem(notice||'거래 상태가 변경되었습니다: '+statusNames[stage])
 }
 function button(text,action,primary=false){const b=el('button','button '+(primary?'primary':'secondary'),text);b.type='button';b.onclick=action;return b}
 function render(){
  $('dealFacts').replaceChildren();[['요청 기업',owner],['대상 제품·자료',record.sourceTitle],['요청 유형',typeName[record.type]],['담당자',record.owner||'미배정'],['수량',record.quantity?record.quantity+'개':'미정'],['희망 납기',record.delivery||'협의'],['요청 날짜',date(record.createdAt)]].forEach(([a,b])=>fact($('dealFacts'),a,b));
  $('dealStages').replaceChildren();const now=stageKeys.indexOf(record.status);stageKeys.forEach((key,i)=>{const s=el('span','ib-deal-stage'+(now>=i?' done':'')+(now===i?' current':''),statusNames[key]);$('dealStages').append(s);if(i<stageKeys.length-1)$('dealStages').append(el('span','ib-deal-arrow','→'))});
  const q=$('dealQuoteInfo');q.replaceChildren();const quote=record.quotation;
  if(quote){[['견적 버전','V'+quote.version],['제품',money(quote.product)],['설치·교육',money(quote.installation)],['통합 지원',money(quote.support)],['총 견적금액',money(quote.total)]].forEach(([a,b])=>fact(q,a,b))}
  else q.append(el('p','', '등록된 견적이 없습니다.'));
  $('dealStatusInfo').replaceChildren();[['현재 단계',statusNames[record.status]||'새 요청'],['견적 버전',quote?'V'+quote.version:'미등록'],['예상 금액',quote?money(quote.total):'미정'],['최근 활동',date(record.updatedAt||record.createdAt)]].forEach(([a,b])=>fact($('dealStatusInfo'),a,b));
  $('dealUpdated').textContent='최근 활동 '+date(record.updatedAt||record.createdAt);
  const msgs=$('dealMessages');msgs.replaceChildren();record.history.forEach(m=>{const row=el('div','ib-deal-msg '+(m.role==='system'?'system':m.role==='supplier'?'supplier':'buyer'));const box=el('div','ib-deal-msg-box');box.append(el('strong','',m.author||'회원'),el('p','',m.text),el('small','',date(m.at)+(m.file?' · 첨부: '+m.file+' (데모)':'')));row.append(box);msgs.append(row)});msgs.scrollTop=msgs.scrollHeight;
  const controls=$('dealActions');controls.replaceChildren();const role=roleSelect.value;
  if(role==='supplier'){
   if(record.status==='new')controls.append(button('요청 확인',()=>advance('review','기업 담당자가 요청을 확인했습니다.'),true));
   if(record.status==='review'||record.status==='new')controls.append(button('담당자 지정',()=>{const v=prompt('담당자 이름 (데모)',record.owner||'영업 담당자');if(v){record.owner=v.slice(0,40);advance('assigned','담당자 '+record.owner+'님을 지정했습니다.')}},true));
   if(['review','assigned','new'].includes(record.status))controls.append(button('확인 후 회신',()=>advance('respond','기업에서 요청 확인 및 회신을 완료했습니다.'),true));
   if(['respond','negotiating','quoted'].includes(record.status))controls.append(button('수정 견적 작성',()=>{const v=prompt('견적 총액 (원)',String(record.quotation?.total||0));if(v!==null&&/^\d{1,15}$/.test(v)&&Number(v)>0){record.quotation={...(record.quotation||{}),version:(record.quotation?.version||0)+1,total:Number(v)};advance('negotiating','수정 견적 V'+record.quotation.version+'을 등록했습니다.')}},true));
   if(record.status==='negotiating')controls.append(button('견적 확정 요청',()=>advance('quoted','거래 기업에 견적 확정을 요청했습니다.'),true));
  }else{
   if(['new','review','assigned','respond','negotiating'].includes(record.status))controls.append(button('협의 진행',()=>advance('negotiating','요청 기업이 조건 협의를 시작했습니다.'),true));
   if(record.status==='quoted')controls.append(button('견적 조건 확인',()=>advance('trading','요청 기업이 견적 조건을 확인하고 거래 진행을 요청했습니다.'),true));
  }
  if(record.status==='trading')controls.append(button('거래 완료 표시 (데모)',()=>advance('completed','양측 거래 완료 상태를 시연합니다.'),true));
  if(record.status==='completed'){
   controls.append(el('p','ib-deal-completed','계약·거래 완료로 표시된 건입니다. 실제 계약서·납품·채권 존재 여부는 별도 확인이 필요합니다.'));
   if(role==='supplier'){
     const scf=el('a','button primary ib-scf-deal-entry','공급망 금융 · 운전자금 신청');
     scf.href='scf.html?deal='+encodeURIComponent(record.id);
     controls.append(scf);
     controls.append(el('p','ib-deal-role-note','공급자 전용 신청 경로입니다. 실제 지급은 증빙·금융기관 승인 후 진행됩니다.'));
   }
  }
 }
 roleSelect.onchange=render;file.onchange=()=>{$('dealFileName').textContent=file.files[0]?.name||''};
 $('dealReplyForm').onsubmit=e=>{e.preventDefault();const field=$('dealReplyText'),value=field.value.trim();if(!value)return;const role=roleSelect.value;record.history.push({role,author:role==='supplier'?(record.owner||record.receiver):owner,text:value.slice(0,5000),file:file.files[0]?.name||'',at:new Date().toISOString()});if(record.status==='new'&&role==='supplier')record.status='respond';else if(record.status==='respond')record.status='negotiating';save();field.value='';file.value='';$('dealFileName').textContent='';render()};
 render();
}
})();