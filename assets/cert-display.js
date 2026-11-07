/* Certification preview for IndustryBook browser-only prototype.
 * User-entered certification labels must never be presented as verified.
 */
(function(){
 'use strict';
 const page=location.pathname.split('/').pop()||'index.html';
 const getJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
 const profile=getJSON('ib-demo-profile-v1',{});
 const certs=Array.isArray(profile.certifications)?profile.certifications.filter(x=>typeof x==='string').slice(0,12):[];
 const create=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=text;return e};
 function block(list,label='보유 인증정보'){
  const section=create('div','ib-cert-section');
  section.append(create('h3','',label));
  const row=create('div','ib-cert-meta');
  if(list.length)list.slice(0,12).forEach(value=>row.append(create('span','',value)));
  else row.append(create('p','ib-cert-help','등록된 인증정보가 없습니다.'));
  section.append(row);
  section.append(create('p','ib-cert-help','기업이 입력한 정보이며 인증기관 검증 전입니다.'));
  return section;
 }
 if(page==='mypage.html'){
  const panels=[...document.querySelectorAll('.ib-member-panel')];
  const target=panels.find(el=>el.querySelector('h2')?.textContent.includes('내 회사 정보'));
  if(target){const section=block(certs,'회사 보유 인증정보');
   const edit=create('a','button secondary small','인증정보 편집 →');edit.href='profile-edit.html';
   section.append(edit);target.append(section)}
 }
 if(page==='company-profile.html'){
  // Do not attach an unrelated logged-in member's certificates to A Robotics.
  const saved=(()=>{try{return JSON.parse(sessionStorage.getItem('ib-demo-member-info')||'{}')}catch{return {}}})();
  const sameCompany=/^(A\s*Robotics|A\s*로보틱스)$/i.test(saved.companyName||'')||/^A\s*Robotics$/i.test(saved.companyEnglish||'');
  const info=document.querySelector('.ib-company-info-card');
  if(info)info.append(block(sameCompany?certs:[],'회사 보유 인증정보'));
 }
 if(page==='catalogs.html'){
  const list=getJSON('ib-demo-company-catalogs-v1',[]);
  const grid=document.querySelector('.container.main .grid');
  if(!grid||!Array.isArray(list))return;
  for(const item of list.filter(x=>x.visibility==='public')){
   const card=create('article','card catalog-item');
   card.dataset.category=item.industries?.[0]||'기타';
   card.dataset.search=[item.title,item.description,...(item.industries||[]),...(item.tags||[]),...(item.certifications||[])].join(' ');
   const link=create('a','');link.href='catalog-manage.html';
   const thumb=create('div','thumb');thumb.append(create('span','ib-cert-catalog-placeholder','▤'));
   link.append(thumb);card.append(link);
   const body=create('div','card-body');
   body.append(create('div','small muted',(item.industries||[]).join(' · ')||'기업 카탈로그'));
   const title=create('h3','',item.title||'기업 카탈로그');
   body.append(title,create('div','small muted','내 등록 카탈로그 · 브라우저 데모'));
   const bottom=create('div','ib-cert-meta ib-cert-card-bottom');
   (item.certifications||[]).slice(0,2).forEach(c=>bottom.append(create('span','',c)));
   if((item.certifications||[]).length>2)bottom.append(create('span','', '+'+(item.certifications.length-2)));
   if((item.certifications||[]).length)bottom.append(create('span','ib-cert-note','기업 입력 · 미검증'));
   if(bottom.childNodes.length)body.append(bottom);
   const nav=create('a','small','내 카탈로그 관리 →');nav.href='catalog-manage.html';body.append(nav);card.append(body);grid.append(card);
  }
  const query=document.getElementById('q');
  if(query)query.addEventListener('input',()=>{
   const q=query.value.trim().toLowerCase();
   grid.querySelectorAll('.catalog-item').forEach(card=>{
    if(card.querySelector('.ib-cert-catalog-placeholder'))
     card.classList.toggle('result-hide',!!q&&!card.dataset.search.toLowerCase().includes(q));
   })
  });
 }
})();
