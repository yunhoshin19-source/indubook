/* IndustryBook role navigation — DEMO ONLY. Never use localStorage roles for production authorization. */
(function(){
'use strict';
const roleKey='ib-demo-role',orgKey='ib-demo-org';
const role=localStorage.getItem(roleKey)||'enterprise';
const roles={enterprise:'일반 기업회원',association:'협회 담당자',admin:'IndustryBook 관리자'};
function roleLink(){
 const nav=document.querySelector('.toplinks'),profile=document.querySelector('.ib-profile-menu');
 if(localStorage.getItem('ib-demo-logged-in')!=='yes')return;
 const configs={association:{label:'회원사 현황',href:'member-companies.html'},admin:{label:'협회 관리',href:'dmin-organization.html'}};
 const item=configs[role];if(!item)return;
 if(nav&&!nav.querySelector('.ib-role-nav')){const a=document.createElement('a');a.className='ib-role-nav';a.href=item.href;a.textContent=item.label;nav.append(a)}
 if(profile&&!profile.querySelector('.ib-role-profile')){const a=document.createElement('a');a.href=item.href;a.className='ib-role-profile';a.textContent=item.label;profile.insertBefore(a,profile.querySelector('button'))}
}
roleLink();
const f=document.getElementById('ib-demo-login'),roleSelect=document.getElementById('ibDemoRole'),orgSelect=document.getElementById('ibDemoOrg'),orgWrap=document.getElementById('ibDemoOrgGroup');
if(!f||!roleSelect)return;
roleSelect.value=roles[role]?role:'enterprise';
function updateChoice(){orgWrap.hidden=roleSelect.value!=='association'}
roleSelect.addEventListener('change',updateChoice);updateChoice();
try{const orgs=JSON.parse(localStorage.getItem('ib-demo-organizations-v1')||'[]');if(orgs.length){orgSelect.replaceChildren();for(const o of orgs.filter(o=>!o.deleted)){const option=document.createElement('option');option.value=o.code;option.textContent=o.name+' ('+o.code+')';orgSelect.append(option)}}}catch(e){}
orgSelect.value=localStorage.getItem(orgKey)||'KCCI';
f.addEventListener('submit',e=>{
 e.preventDefault();e.stopImmediatePropagation();if(!f.reportValidity())return;
 const email=f.querySelector('input[type=email]').value.trim();
 // Demo-only simulated authentication. Any credentials and any role are accepted.
 localStorage.setItem('ib-demo-logged-in','yes');
 localStorage.setItem('ib-demo-email',email);
 localStorage.setItem(roleKey,roleSelect.value);
 if(roleSelect.value==='association')localStorage.setItem(orgKey,orgSelect.value||'KCCI');
 location.href=roleSelect.value==='admin'?'dmin-organization.html':roleSelect.value==='association'?'member-companies.html':'mypage.html';
},true);
})();