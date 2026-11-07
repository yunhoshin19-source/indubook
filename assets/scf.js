/* IndustryBook SCF application prototype based on supplied patents 1–3.
 * No real underwriting, factoring, disbursement, KYC or bank connectivity.
 * Supplier role is a browser demonstration, NOT enforceable authorization.
 */
(function(){
'use strict';
const $=id=>document.getElementById(id),DEALS='ib-demo-business-requests-v1',APPLICATIONS='ib-demo-scf-applications-v1';
if(!$('scfEligibleDeals'))return;
const logged=localStorage.getItem('ib-demo-logged-in')==='yes';
if(!logged){const next='scf.html'+location.search;location.replace('login.html?next='+encodeURIComponent(next));return}
const get=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v===null?fallback:v}catch{return fallback}};
const label=(s)=>({'draft':'작성 중','submitted-demo':'접수 기록 (데모)','needs-evidence':'증빙 보완 필요 (데모)'})[s]||'작성 중';
const currency=v=>Number(v||0).toLocaleString('ko-KR')+'원';
const btn=(name,href,cls)=>{const a=document.createElement('a');a.textContent=name;a.href=href;a.className='button '+(cls||'secondary');return a};
const txt=(tag,className,value)=>{const n=document.createElement(tag);if(className)n.className=className;n.textContent=value;return n};
const sample={id:'sample-scf-completed',type:'rfq',company:'Global Manufacturing Co. (샘플)',receiver:'A 로보틱스 (샘플)',subject:'협동로봇 납품 계약 완료 예시',sourceTitle:'CR-20 협동로봇',status:'completed',quotation:{total:120000000,currency:'KRW'},updatedAt:'2026-11-07T14:32:00+09:00',scfSample:true};
const deals=()=>{const stored=get(DEALS,[]);const filtered=Array.isArray(stored)?stored:[];return [...filtered,...(filtered.some(d=>d.id===sample.id)?[]:[sample])].filter(d=>d.status==='completed')};
const apps=()=>{const x=get(APPLICATIONS,[]);return Array.isArray(x)?x:[]};
const saveApps=x=>localStorage.setItem(APPLICATIONS,JSON.stringify(x));
let chosen=null;
function renderList(){
 const items=deals(),applications=apps();
 $('scfDealCount').textContent=items.length+'건';
 $('scfDraftCount').textContent=applications.filter(x=>x.status==='draft').length+'건';
 $('scfSubmittedCount').textContent=applications.filter(x=>x.status==='submitted-demo').length+'건';
 const list=$('scfEligibleDeals');list.replaceChildren();
 for(const deal of items){
  const row=txt('div','ib-scf-deal-row','');
  const content=txt('div','ib-scf-deal-main','');content.append(txt('strong','',deal.subject||deal.sourceTitle||'계약 완료 거래'));
  content.append(txt('span','',(deal.receiver||'공급자')+' · '+(deal.company||'구매자')+' · 계약 완료'));
  if(deal.scfSample)content.append(txt('small','ib-scf-sample','샘플 완료 거래 · 실거래/금융 심사 대상이 아닙니다'));
  const previous=applications.find(x=>x.dealId===deal.id);
  const action=btn(previous?'신청 이어보기':'SCF 신청 시작','scf.html?deal='+encodeURIComponent(deal.id),previous?'secondary':'primary');
  row.append(content,action);list.append(row);
 }
 if(!items.length)list.append(txt('p','ib-scf-empty','계약 완료 거래가 없습니다. 거래 스레드에서 계약 완료 상태를 확인하세요.'));
 const records=$('scfApplications');records.replaceChildren();
 for(const item of applications.slice().reverse()){
  const row=txt('div','ib-scf-deal-row','');
  const details=txt('div','ib-scf-deal-main','');details.append(txt('strong','',item.dealTitle||item.dealId),txt('span','',label(item.status)+' · 신청번호 '+item.id));
  row.append(details,btn('신청 상세','scf.html?deal='+encodeURIComponent(item.dealId)));records.append(row)
 }
 if(!applications.length)records.append(txt('p','ib-scf-empty','아직 신청 기록이 없습니다.'));
}
function fact(parent,k,v){parent.append(txt('dt','',k),txt('dd','',v))}
function renderStages(status){
 const el=$('scfStages');el.replaceChildren();
 const states=[['계약 완료','계약 상태 확인'],['증빙 준비','납품·검수·세금계산서 확인'],['신청 접수','제출 기록'],['채권 적격심사','금융기관 연동 필요'],['금융 조건 제안','수수료·선지급 비율 확정'],['공급자 동의','전자약정 및 채권 양도'],['자금 지급','실제 금융기관 지급 완료']];
 states.forEach(([name,desc],i)=>{const row=txt('div','ib-scf-stage',''),num=txt('span','ib-scf-stage-index',String(i+1)),body=txt('div','ib-scf-stage-text','');body.append(txt('strong','',name),txt('small','',desc));if(i<2||status==='submitted-demo'&&i===2)row.classList.add('ib-scf-stage-illustrative');row.append(num,body);el.append(row)});
}
function openDeal(deal){
 chosen=deal;
 $('scfListView').hidden=true;$('scfApplicationView').hidden=false;
 const existing=apps().find(a=>a.dealId===deal.id);
 $('scfDealFacts').replaceChildren();
 [['연결 거래',deal.id],['공급자',deal.receiver||'정보 없음'],['구매자',deal.company||'정보 없음'],['대상 제품',deal.sourceTitle||'해당 없음'],['계약 금액',deal.quotation?.total?currency(deal.quotation.total):'금액 확인 필요'],['계약 상태','완료 (데모)']].forEach(([k,v])=>fact($('scfDealFacts'),k,v));
 $('scfBackDeal').href='deal-detail.html?id='+encodeURIComponent(deal.id);
 $('scfContract').checked=!!existing?.contract;
 $('scfDelivery').checked=!!existing?.delivery;
 $('scfInspection').checked=!!existing?.inspection;
 $('scfInvoice').checked=!!existing?.invoice;
 $('scfEvidenceNote').value=existing?.evidenceNote||'';
 $('scfReceivable').value=existing?.receivable||deal.quotation?.total||'';
 $('scfDueDate').value=existing?.dueDate||'';
 $('scfRequestedRate').value=existing?.rate||'90';
 $('scfAppState').textContent=existing?label(existing.status):'신규 신청';
 $('scfAppState').className='ib-scf-status';
 renderStages(existing?.status||'draft');
 const submitted=existing?.status==='submitted-demo';$('scfSubmit').disabled=submitted;
 for(const input of $('scfApplicationForm').querySelectorAll('input,textarea,select'))input.disabled=submitted;
 $('scfSaveDraft').disabled=submitted;
 preview();
}
function preview(){
 const receivable=Number($('scfReceivable').value),rate=Number($('scfRequestedRate').value);
 $('scfPreviewAmount').textContent=Number.isFinite(receivable)&&receivable>0?currency(Math.round(receivable*rate/100)):'—';
}
function collect(status){
 if(!chosen)return null;
 const amount=Number($('scfReceivable').value);
 if(!Number.isSafeInteger(amount)||amount<=0){alert('정확한 채권금액을 입력해 주세요.');return null}
 const old=apps().find(x=>x.dealId===chosen.id);
 return {id:old?.id||'SCF-DEMO-'+Date.now().toString(36).toUpperCase(),dealId:chosen.id,dealTitle:chosen.subject||chosen.sourceTitle,supplier:chosen.receiver,buyer:chosen.company,contract:$('scfContract').checked,delivery:$('scfDelivery').checked,inspection:$('scfInspection').checked,invoice:$('scfInvoice').checked,evidenceNote:$('scfEvidenceNote').value.trim(),receivable:amount,rate:Number($('scfRequestedRate').value),dueDate:$('scfDueDate').value,status,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
}
function save(status){
 const app=collect(status);if(!app)return;
 if(status==='submitted-demo'){
  if(!app.contract){alert('계약 확인 여부를 선택해 주세요.');return}
  if(!(app.delivery||app.inspection||app.invoice)){alert('납품·검수·세금계산서 증빙 중 하나 이상을 확인해 주세요.');return}
  if(!app.dueDate){alert('채권 만기일을 입력해 주세요.');return}
  if(!confirm('이 신청은 브라우저에만 저장되며 금융기관으로 전송되지 않습니다. 접수 기록을 생성할까요?'))return;
 }
 try{
  const existing=apps(),index=existing.findIndex(x=>x.dealId===app.dealId);
  if(index>=0)existing[index]=app;else existing.push(app);
  saveApps(existing);openDeal(chosen);
  alert(status==='submitted-demo'?'시연용 접수 기록이 생성되었습니다. 실제 금융 심사는 진행되지 않습니다.':'임시저장했습니다.');
 }catch(e){alert('브라우저 저장에 실패했습니다: '+e.message)}
}
$('scfReceivable').addEventListener('input',preview);$('scfRequestedRate').addEventListener('change',preview);
$('scfSaveDraft').addEventListener('click',()=>save('draft'));
$('scfApplicationForm').addEventListener('submit',event=>{event.preventDefault();save('submitted-demo')});
const q=new URLSearchParams(location.search).get('deal');
const found=q?deals().find(x=>x.id===q):null;
if(found)openDeal(found);else renderList();
})();