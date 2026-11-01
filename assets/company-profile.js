/* Company profile and company-specific notices. Client-only demonstration. */
(function(){
 'use strict';
 const companyId='co-0',storageKey='ib-demo-company-notices-v1-'+companyId;
 const $=id=>document.getElementById(id);
 const signed=localStorage.getItem('ib-demo-logged-in')==='yes';
 const role=localStorage.getItem('ib-demo-role')||'enterprise';
 // Demo ownership is simulated for this sample company; real ownership MUST be verified server-side.
 const demoOwner=signed&&role==='enterprise';
 const seed=[
  {id:'sample-1',title:'[공지] 신규 로봇 자동화 솔루션 카탈로그 안내',content:'새롭게 준비한 로봇 자동화 솔루션 카탈로그를 소개합니다.\n기업의 제품과 기술 정보는 카탈로그 목록에서 확인해 주세요.\n\n※ 이 공지는 화면 확인을 위한 예시입니다.',type:'pinned',date:'2026-10-24',views:42,author:'A 로보틱스 · 샘플'},
  {id:'sample-2',title:'산업 제어 시스템 자료 업데이트',content:'산업 제어 시스템 관련 콘텐츠가 업데이트되었습니다.\n제품 설명과 적용 분야는 카탈로그에서 확인해 주세요.\n\n※ 시연용 공지입니다.',type:'normal',date:'2026-10-18',views:25,author:'A 로보틱스 · 샘플'},
  {id:'sample-3',title:'기업 문의 및 상담 안내',content:'카탈로그와 제품에 대해 문의가 있다면 메시지 메뉴를 이용해 주세요.\n\n※ 이 공지는 시연용입니다.',type:'normal',date:'2026-09-30',views:18,author:'A 로보틱스 · 샘플'}
 ];
 let notices;
 try{const stored=JSON.parse(localStorage.getItem(storageKey)||'null');notices=Array.isArray(stored)?stored:seed.map(x=>({...x}))}catch(e){notices=seed.map(x=>({...x}))}
 const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(notices));return true}catch(e){alert('브라우저 저장 공간에 저장하지 못했습니다.');return false}};
 function tab(name,changeHash=true){
  document.querySelectorAll('[data-company-tab]').forEach(b=>{const on=b.dataset.companyTab===name;b.setAttribute('aria-selected',String(on));b.classList.toggle('active',on)});
  for(const k of ['about','catalog','news']){const panel=$({about:'companyAboutPanel',catalog:'companyCatalogPanel',news:'companyNewsPanel'}[k]);panel.hidden=k!==name}
  if(changeHash)history.replaceState(null,'','#'+name);
 }
 document.querySelectorAll('[data-company-tab]').forEach(btn=>btn.addEventListener('click',()=>tab(btn.dataset.companyTab)));
 $('ibGoNews').addEventListener('click',()=>{tab('news');$('companyNewsTab').focus()});
 const validTab=location.hash.slice(1);tab(['about','catalog','news'].includes(validTab)?validTab:'about',false);
 const write=$('ibWriteNotice'),hint=$('ibNoticeOwnerHint');
 if(demoOwner){
  write.hidden=false;
  hint.textContent='기업 공지 관리 데모: 현재 로그인한 일반 기업회원에게 이 샘플 회사의 작성 권한을 시연합니다. 실제 서비스에서는 회사 소속·관리 권한을 서버에서 반드시 검증해야 합니다.';
 }else hint.textContent='기업에서 공개한 공지사항입니다. 작성·수정·삭제는 해당 기업 운영 권한이 있는 로그인 사용자만 사용할 수 있습니다. (현재는 데모 데이터)';
 const list=$('ibNoticeList'),search=$('ibNoticeSearch'),filter=$('ibNoticeFilter'),more=$('ibMoreNotices');
 let visible=5,selectedId=null;
 const label=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
 function sorted(){return notices.slice().sort((a,b)=>{const pin=Number(b.type==='pinned')-Number(a.type==='pinned');return pin||String(b.date).localeCompare(String(a.date))})}
 function filtered(){const q=search.value.trim().toLowerCase();return sorted().filter(n=>(filter.value==='all'||n.type===filter.value)&&(!q||n.title.toLowerCase().includes(q)||n.content.toLowerCase().includes(q)))}
 function makeRow(n){
  const row=label('button','ib-company-notice-row');row.type='button';
  const line=label('span','ib-company-notice-line');if(n.type==='pinned')line.append(label('span','ib-news-pin-badge','상단고정'));
  line.append(label('strong','',n.title));
  const details=label('span','ib-company-notice-summary',n.content.replace(/\s+/g,' ').slice(0,115));
  const meta=label('span','ib-company-notice-meta',n.date+'   ·   조회 '+Number(n.views||0));
  row.append(line,details,meta);row.addEventListener('click',()=>openNotice(n.id));return row
 }
 function render(){
  const all=filtered();list.replaceChildren();
  all.slice(0,visible).forEach(n=>list.append(makeRow(n)));
  if(!all.length)list.append(label('div','ib-company-notice-empty','등록된 공지사항이 없습니다.'));
  more.hidden=all.length<=visible;
  $('ibNewsResultCount').textContent=all.length+'건';
  $('ibNewsTabCount').textContent=notices.length;
  $('ibCompanyNoticeCount').textContent=notices.length;
  const aside=$('ibAboutRecentNotices');aside.replaceChildren();
  sorted().slice(0,2).forEach(n=>{const b=label('button','ib-about-news-item',n.title);b.type='button';b.addEventListener('click',()=>{tab('news');openNotice(n.id)});aside.append(b)});
  if(!aside.children.length)aside.append(label('p','','등록된 소식이 없습니다.'));
 }
 search.addEventListener('input',()=>{visible=5;render()});
 filter.addEventListener('change',()=>{visible=5;render()});
 more.addEventListener('click',()=>{visible+=5;render()});
 const dialog=$('ibNoticeDialog'),reader=$('ibNoticeReadDialog');
 const open=d=>typeof d.showModal==='function'?d.showModal():d.setAttribute('open','');
 const close=d=>typeof d.close==='function'?d.close():d.removeAttribute('open');
 document.querySelectorAll('[data-close-notice]').forEach(b=>b.addEventListener('click',()=>close(b.closest('dialog'))));
 [dialog,reader].forEach(d=>d.addEventListener('click',e=>{if(e.target===d)close(d)}));
 function editForm(n){
  $('ibNoticeForm').reset();$('ibNoticeEditId').value=n?.id||'';
  $('ibNoticeDialogTitle').textContent=n?'공지사항 수정':'공지사항 작성';
  if(n){$('ibNoticeTitle').value=n.title;$('ibNoticeBody').value=n.content;$('ibNoticePinned').checked=n.type==='pinned'}
  open(dialog);$('ibNoticeTitle').focus()
 }
 write.addEventListener('click',()=>{if(demoOwner)editForm(null)});
 $('ibNoticeForm').addEventListener('submit',e=>{
  e.preventDefault();if(!demoOwner)return;
  if(!e.currentTarget.reportValidity())return;
  const title=$('ibNoticeTitle').value.trim(),content=$('ibNoticeBody').value.trim();
  if(!title||!content){alert('제목과 내용을 입력해 주세요.');return}
  const id=$('ibNoticeEditId').value,type=$('ibNoticePinned').checked?'pinned':'normal';
  if(id){const n=notices.find(x=>x.id===id);if(n)Object.assign(n,{title,content,type})}
  else notices.push({id:'demo-'+Date.now(),title,content,type,date:new Date().toISOString().slice(0,10),views:0,author:'기업회원 (데모)'});
  if(save()){close(dialog);visible=5;search.value='';filter.value='all';render()}
 });
 function openNotice(id){
  const n=notices.find(x=>x.id===id);if(!n)return;selectedId=id;
  n.views=(Number(n.views)||0)+1;save();
  $('ibNoticeReadTitle').textContent=n.title;
  $('ibNoticeReadMeta').textContent=n.date+' · '+n.author+' · 조회 '+n.views+(n.type==='pinned'?' · 상단고정':'');
  $('ibNoticeReadBody').textContent=n.content;
  $('ibNoticeManageActions').hidden=!demoOwner;
  open(reader);render()
 }
 $('ibNoticeEdit').addEventListener('click',()=>{
  if(!demoOwner)return;const n=notices.find(x=>x.id===selectedId);close(reader);if(n)editForm(n)
 });
 $('ibNoticeDelete').addEventListener('click',()=>{
  if(!demoOwner)return;const n=notices.find(x=>x.id===selectedId);if(!n||!confirm('이 공지사항을 삭제할까요? (데모)'))return;
  notices=notices.filter(x=>x.id!==selectedId);if(save()){close(reader);selectedId=null;render()}
 });
 render();
})();