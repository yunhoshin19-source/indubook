/* IndustryBook business request UI — local demo only. */
(function(){
'use strict';
const $=id=>document.getElementById(id),query=new URLSearchParams(location.search);
const type=['inquiry','rfq','rfc'].includes(query.get('type'))?query.get('type'):'inquiry';
const source=query.get('source')==='catalog'?'catalog':'product';
const id=(query.get('id')|| (source==='product'?'p-cr20':'kar-membership')).slice(0,120);
const product=source==='product'&&window.IBProducts?window.IBProducts.get(id):null;
const title=source==='product'?(product?.name||'제품'):'한국AI로봇산업협회 회원사 혜택 카탈로그';
const receiver=source==='product'?(product?.company||'등록 기업'):'한국AI로봇산업협회';
const defs={
 inquiry:{name:'문의',heading:source==='product'?'제품 문의하기':'카탈로그 문의하기',description:'제품이나 카탈로그에 관해 궁금한 내용을 기업에 문의합니다.'},
 rfq:{name:'견적 요청',heading:'제품 견적 요청',description:'제품의 가격, 구매 수량, 희망 납기 등 견적 조건을 기업에 요청합니다.'},
 rfc:{name:'협업·제안 요청',heading:'협업·제안 요청',description:'기업 카탈로그를 기반으로 기술 협업, 제품 제안, 파트너십 등을 요청합니다.'}
};
const d=defs[type],back=source==='product'?'product-detail.html?id='+encodeURIComponent(id):'catalog-detail.html';
$('requestHeading').textContent=d.heading;$('requestFormHeading').textContent=d.heading;
$('requestLead').textContent=d.description;$('requestBreadcrumb').textContent=d.name+' 요청';
$('requestTargetTitle').textContent=title;$('requestTargetMeta').textContent=receiver+' · '+(source==='product'?'제품':'카탈로그');
$('requestTypeBadge').textContent=d.name;$('requestTypeDescription').textContent=d.description;
$('requestBack').href=back;$('requestCancel').href=back;$('requestSuccessBack').href=back;
$('requestRfqFields').hidden=type!=='rfq';
const signed=localStorage.getItem('ib-demo-logged-in')==='yes';
$('requestAuthGate').hidden=signed;$('requestFormArea').hidden=!signed;
const fullReturn='business-request.html?'+new URLSearchParams({type,source,id}).toString();
const loginLink='login.html?next='+encodeURIComponent(fullReturn);
$('requestLogin').href=loginLink;
$('requestSignup').href='signup.html?next='+encodeURIComponent(fullReturn);
if(!signed)return;
$('requestEmail').value=localStorage.getItem('ib-demo-email')||'';
$('requestSubject').value=(type==='rfq'?'[견적 요청] ':type==='rfc'?'[협업·제안 요청] ':'[문의] ')+title;
$('requestMessage').placeholder=type==='rfq'?'요청 규격, 수량, 납기, 거래 조건 등을 작성해 주세요.':type==='rfc'?'카탈로그 기반 요청 목적과 세부 내용을 작성해 주세요.':'제품·카탈로그에 대해 궁금한 내용을 작성해 주세요.';
$('businessRequestForm').addEventListener('submit',e=>{
 e.preventDefault();if(!e.currentTarget.reportValidity())return;
 const request={
  id:'req-'+Date.now(),type,source,sourceId:id,sourceTitle:title,receiver,
  subject:$('requestSubject').value.trim(),email:$('requestEmail').value.trim(),
  company:$('requestCompany').value.trim(),quantity:type==='rfq'?$('requestQuantity').value:'',delivery:type==='rfq'?$('requestDelivery').value:'',
  message:$('requestMessage').value.trim(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'new',owner:'',history:[]
 };
 if(!request.subject||!request.message)return;
 try{
  const key='ib-demo-business-requests-v1',saved=JSON.parse(localStorage.getItem(key)||'[]');
  if(!Array.isArray(saved))throw Error('저장 형식이 올바르지 않습니다');
  saved.push(request);localStorage.setItem(key,JSON.stringify(saved));
  location.href='deal-detail.html?id='+encodeURIComponent(request.id);
 }catch(err){alert('요청을 브라우저에 저장하지 못했습니다: '+err.message)}
});
})();