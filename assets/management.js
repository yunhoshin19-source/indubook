/* Association and organization admin browser-only prototype. NOT production authorization. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
if(!$('ibManagementContent'))return;
const isAdmin=!!$('orgRows');
const role=localStorage.getItem('ib-demo-role')||'enterprise';
const logged=localStorage.getItem('ib-demo-logged-in')==='yes';
const allowed=logged&&(isAdmin?role==='admin':role==='association');
const deny=$('ibPermission');
if(!allowed){
 deny.hidden=false;
 deny.textContent='이 메뉴는 '+(isAdmin?'IndustryBook 관리자':'협회 담당자')+' 전용입니다. 로그인 화면에서 시연용 역할을 선택해 주세요. 실제 권한 검증은 서버 연동 전입니다.';
 const a=document.createElement('a');a.href='login.html';a.className='button primary';a.textContent='로그인 화면으로';deny.append(a);
 return;
}
$('ibManagementContent').hidden=false;
const orgKey='ib-demo-organizations-v1',coKey='ib-demo-companies-v1';
const now=new Date().toISOString().slice(0,10);
const seedOrg=[{id:1,code:'KCCI',name:'대한상공회의소',businessNumber:'101-82-12345',phone:'02-316-3114',address:'서울특별시 중구 세종대로 39',email:'info@korcham.net',authCode:'KCCI2024',planCode:'ENTERPRISE',startDate:'2024-01-01',endDate:'2027-12-31',deleted:false}];
const seedCo=[
{id:1,orgCode:'KCCI',name:'주식회사 테크노밸리',businessNumber:'123-45-67890',ceo:'김철수',phone:'02-1234-5678',plan:'ENTERPRISE',catalogCount:5,joinDate:'2024-01-15',withdrawalDate:'',note:'협회 정회원',deleted:false},
{id:2,orgCode:'KCCI',name:'글로벌 인더스트리',businessNumber:'234-56-78901',ceo:'이영희',phone:'02-2345-6789',plan:'ENTERPRISE',catalogCount:12,joinDate:'2024-02-01',withdrawalDate:'',note:'프리미엄 회원',deleted:false},
{id:3,orgCode:'KCCI',name:'스마트솔루션',businessNumber:'345-67-89012',ceo:'박민수',phone:'02-3456-7890',plan:'ENTERPRISE',catalogCount:3,joinDate:'2024-03-01',withdrawalDate:'',note:'회원사',deleted:false}
];
const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return Array.isArray(v)?v:fallback}catch(e){return fallback}};
let orgs=read(orgKey,seedOrg),companies=read(coKey,seedCo);
const save=()=>{try{localStorage.setItem(orgKey,JSON.stringify(orgs));localStorage.setItem(coKey,JSON.stringify(companies))}catch(e){alert('브라우저 저장 공간이 부족합니다.')}};
const by=id=>document.getElementById(id);
const add=(parent,tag,value,cls)=>{const e=document.createElement(tag);if(value!==undefined)e.textContent=String(value);if(cls)e.className=cls;parent.append(e);return e};
const cell=(row,value)=>add(row,'td',value==null?'':value);
const button=(row,label,handler)=>{const td=add(row,'td');const b=add(td,'button',label,'button small secondary');b.type='button';b.onclick=handler;return b};
const activeCompanies=code=>companies.filter(c=>!c.deleted&&c.orgCode===code);
const download=(name,rows)=>{
 const csv=rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
};
const companyColumns=['회사명','사업자번호','대표자','전화번호','플랜','카탈로그 수','가입일','탈퇴일','메모'];
const companyCsv=arr=>[companyColumns,...arr.map(c=>[c.name,c.businessNumber,c.ceo,c.phone,c.plan,c.catalogCount,c.joinDate,c.withdrawalDate,c.note])];
const orgCurrent=()=>localStorage.getItem('ib-demo-org')||'KCCI';
function renderMember(){
 const code=orgCurrent(),org=orgs.find(o=>o.code===code&&!o.deleted);
 if(!org){deny.hidden=false;deny.textContent='소속 협회가 확인되지 않습니다. 시연용 로그인에서 유효한 협회를 선택해 주세요.';$('ibManagementContent').hidden=true;return}
 $('associationName').textContent=org.name+' ('+org.code+')';
 const all=activeCompanies(code),active=all.filter(x=>!x.withdrawalDate),query=$('companySearch').value.toLowerCase();
 $('statTotal').textContent=all.length;$('statActive').textContent=active.length;$('statCatalogs').textContent=active.reduce((n,c)=>n+Number(c.catalogCount||0),0);$('statWithdrawn').textContent=all.length-active.length;
 const filtered=all.filter(c=>[c.name,c.businessNumber,c.ceo,c.phone,c.note].some(x=>String(x||'').toLowerCase().includes(query)));
 $('memberResult').textContent=filtered.length+'개';const rows=$('memberRows');rows.replaceChildren();
 for(const c of filtered){const row=add(rows,'tr');const td=add(row,'td');const link=add(td,'a',c.name);link.href='catalogs.html?q='+encodeURIComponent(c.name);
 for(const val of [c.businessNumber,c.ceo,c.phone,c.plan,c.catalogCount,c.joinDate,c.withdrawalDate||'활성'])cell(row,val)}
 if(!filtered.length){const tr=add(rows,'tr');const td=add(tr,'td','검색된 회원사가 없습니다.');td.colSpan=8}
}
if(!isAdmin){
 $('companySearch').addEventListener('input',renderMember);
 $('downloadMembers').onclick=()=>download('회원사현황_'+orgCurrent()+'_'+now+'.csv',companyCsv(activeCompanies(orgCurrent())));
 renderMember();
 return;
}
const liveOrgs=()=>orgs.filter(o=>!o.deleted);
const status=o=>!o.endDate?'기간 미설정':o.endDate<now?'기간 만료':'이용 중';
let selectedOrg='';
function renderAdmin(){
 const items=liveOrgs(),q=$('orgSearch').value.toLowerCase();
 $('statOrgs').textContent=items.length;
 $('statOrgActive').textContent=items.filter(o=>status(o)==='이용 중').length;
 $('statMembers').textContent=items.reduce((n,o)=>n+activeCompanies(o.code).length,0);
 $('statExpired').textContent=items.filter(o=>status(o)!=='이용 중').length;
 const rows=$('orgRows');rows.replaceChildren();
 for(const o of items.filter(o=>[o.name,o.code,o.businessNumber].some(v=>String(v||'').toLowerCase().includes(q)))){
  const tr=add(rows,'tr');
  for(const v of [o.code,o.name,o.businessNumber,o.phone,o.authCode||'-',o.planCode+' · '+status(o),activeCompanies(o.code).length+'개'])cell(tr,v);
  const td=add(tr,'td');const actions=add(td,'div',undefined,'ib-row-actions');
  const b1=add(actions,'button','수정','button small secondary');b1.onclick=()=>openOrg(o);
  const b2=add(actions,'button','회원사','button small secondary');b2.onclick=()=>openCompanies(o);
  const b3=add(actions,'button','삭제','ib-danger-button');b3.onclick=()=>{if(!confirm(o.name+' 협회를 삭제 처리할까요? (데모)'))return;o.deleted=true;save();renderAdmin()};
 }
 if(!rows.children.length){const tr=add(rows,'tr'),td=add(tr,'td','등록된 협회가 없습니다.');td.colSpan=8}
}
const orgFields={code:'orgCode',name:'orgName',businessNumber:'orgBiz',phone:'orgPhone',address:'orgAddress',email:'orgEmail',authCode:'orgAuthCode',planCode:'orgPlan',startDate:'orgStart',endDate:'orgEnd'};
const companyFields={name:'companyName',businessNumber:'companyBiz',ceo:'companyCeo',phone:'companyPhone',plan:'companyPlan',catalogCount:'companyCatalogs',joinDate:'companyJoin',withdrawalDate:'companyWithdraw',note:'companyNote'};
function modal(id){const d=$(id);if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','')}
function openOrg(o){$('orgForm').reset();$('orgId').value=o?.id||'';for(const [k,id] of Object.entries(orgFields))if(o&&o[k]!=null)$(id).value=o[k];$('orgCode').readOnly=!!o;modal('orgDialog')}
$('addOrg').onclick=()=>openOrg(null);
document.querySelectorAll('[data-close-dialog]').forEach(b=>b.onclick=()=>$(b.dataset.closeDialog).close());
$('orgForm').addEventListener('submit',e=>{
 e.preventDefault();if(!e.currentTarget.reportValidity())return;
 const id=Number($('orgId').value);const item=Object.fromEntries(Object.entries(orgFields).map(([k,v])=>[k,$(v).value.trim()]));
 if(!/^\d{10}$/.test(item.businessNumber.replace(/\D/g,''))){alert('사업자번호는 숫자 10자리로 입력해 주세요.');return}
 if(item.endDate&&item.startDate&&item.endDate<item.startDate){alert('계약 종료일을 확인해 주세요.');return}
 if(!id&&orgs.some(o=>o.code===item.code&&!o.deleted)){alert('이미 등록된 협회 코드입니다.');return}
 if(id){const found=orgs.find(o=>o.id===id);if(found)Object.assign(found,item)}else orgs.push({id:Date.now(),...item,deleted:false});
 save();$('orgDialog').close();renderAdmin();
});
function openCompanies(org){selectedOrg=org.code;$('companyDialogTitle').textContent=org.name+' · 회원사 관리';$('memberSearch').value='';resetCompany();renderCompanies();modal('companyDialog')}
function resetCompany(){$('companyForm').reset();$('companyId').value='';$('companyCatalogs').value=0}
function renderCompanies(){
 const q=$('memberSearch').value.toLowerCase();const rows=$('companyRows');rows.replaceChildren();
 for(const c of activeCompanies(selectedOrg).filter(x=>[x.name,x.businessNumber,x.ceo].some(v=>String(v||'').toLowerCase().includes(q)))){
  const tr=add(rows,'tr');for(const v of [c.name,c.businessNumber,c.ceo,c.phone,c.plan,c.catalogCount,c.withdrawalDate||'활성'])cell(tr,v);
  const td=add(tr,'td');const area=add(td,'div',undefined,'ib-row-actions');
  const edit=add(area,'button','수정','button small secondary');edit.onclick=()=>{resetCompany();$('companyId').value=c.id;for(const [k,id] of Object.entries(companyFields))if(c[k]!=null)$(id).value=c[k]};
  const del=add(area,'button','삭제','ib-danger-button');del.onclick=()=>{if(!confirm(c.name+' 회원사를 삭제 처리할까요?'))return;c.deleted=true;save();renderCompanies();renderAdmin()};
 }
 if(!rows.children.length){const tr=add(rows,'tr'),td=add(tr,'td','등록된 회원사가 없습니다.');td.colSpan=8}
}
$('memberSearch').addEventListener('input',renderCompanies);
$('companyClear').onclick=resetCompany;
$('companyForm').addEventListener('submit',e=>{
 e.preventDefault();if(!e.currentTarget.reportValidity())return;
 const data=Object.fromEntries(Object.entries(companyFields).map(([k,v])=>[k,$(v).value.trim()]));
 if(!/^\d{10}$/.test(data.businessNumber.replace(/\D/g,''))){alert('사업자번호는 숫자 10자리로 입력해 주세요.');return}
 data.catalogCount=Math.max(0,Number(data.catalogCount||0));
 const id=Number($('companyId').value);if(id){const c=companies.find(x=>x.id===id);if(c)Object.assign(c,data)}else companies.push({id:Date.now(),orgCode:selectedOrg,deleted:false,...data});
 save();resetCompany();renderCompanies();renderAdmin();
});
$('downloadTemplate').onclick=()=>download('회원사_업로드_양식.csv',[companyColumns,['예시회사','123-45-67890','홍길동','02-1234-5678','ENTERPRISE',0,now,'','']]);
$('downloadCompanies').onclick=()=>download('회원사_'+selectedOrg+'.csv',companyCsv(activeCompanies(selectedOrg)));
function parseCsv(text){
 const rows=[];let r=[],part='',quoted=false;
 for(let i=0;i<text.length;i++){const ch=text[i];
  if(ch==='"'){if(quoted&&text[i+1]==='"'){part+='"';i++}else quoted=!quoted}
  else if(ch===','&&!quoted){r.push(part);part=''}
  else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;r.push(part);if(r.some(x=>x.trim()))rows.push(r);r=[];part=''}
  else part+=ch
 }
 r.push(part);if(r.some(x=>x.trim()))rows.push(r);return rows
}
async function importCsv(file){
 if(!file||!file.name.toLowerCase().endsWith('.csv')){alert('CSV 파일만 지원합니다.');return}
 if(file.size>2*1024*1024){alert('2MB 이하 CSV 파일을 사용해 주세요.');return}
 const rows=parseCsv((await file.text()).replace(/^\uFEFF/,''));
 if(rows.length<2){alert('유효한 CSV 데이터가 없습니다.');return}
 if(rows[0][0].trim()!=='회사명'||rows[0][1].trim()!=='사업자번호'){alert('제공한 CSV 양식의 컬럼 순서를 사용해 주세요.');return}
 let count=0;
 for(const r of rows.slice(1)){
  const [name,businessNumber,ceo,phone,plan,catalogCount,joinDate,withdrawalDate,note]=r.map(x=>String(x||'').trim());
  if(!name||!/^\d{10}$/.test(businessNumber.replace(/\D/g,'')))continue;
  const existing=companies.find(c=>!c.deleted&&c.orgCode===selectedOrg&&c.businessNumber.replace(/\D/g,'')===businessNumber.replace(/\D/g,''));
  const data={name,businessNumber,ceo,phone,plan:plan||'BASIC',catalogCount:Math.max(0,Number(catalogCount)||0),joinDate,withdrawalDate,note};
  if(existing)Object.assign(existing,data);else companies.push({id:Date.now()+count,orgCode:selectedOrg,deleted:false,...data});
  count++;
 }
 save();renderCompanies();renderAdmin();alert(count+'개 회원사를 가져왔습니다. (브라우저 데모)');
}
$('uploadCompanies').onchange=e=>{importCsv(e.target.files[0]);e.target.value=''};
const drop=$('companyDrop');
drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('hover')});
drop.addEventListener('dragleave',()=>drop.classList.remove('hover'));
drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('hover');importCsv(e.dataTransfer.files[0])});
renderAdmin();
})();