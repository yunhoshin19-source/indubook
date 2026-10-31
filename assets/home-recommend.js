/* IndustryBook homepage catalog discovery.
   All catalog dates, views, and scores in this prototype are demonstration-only.
   Production: use backend catalog records, view counts and recommendation API. */
(function(){
'use strict';
const grid=document.getElementById('homeCatalogGrid');
if(!grid)return;
const cards=[...grid.querySelectorAll('[data-catalog-id]')];
const tabs=[...document.querySelectorAll('[data-catalog-sort]')];
const filterButtons=[...document.querySelectorAll('[data-home-category]')];
const info=document.getElementById('homeRecommendInfo');
const empty=document.getElementById('homeCatalogEmpty');
const signed=localStorage.getItem('ib-demo-logged-in')==='yes';
let interests=[];
if(signed){
 try{
  const profile=JSON.parse(localStorage.getItem('ib-demo-profile-v1')||'{}');
  interests=Array.isArray(profile.categories)?profile.categories.filter(x=>typeof x==='string').slice(0,3):[];
 }catch(e){}
}
const customCategorySynonyms={
 '로봇·자동화':['로봇','로봇·자동화','자동화','기술서비스'],
 '산업기계':['장비','기계','산업기계','제조업'],
 '전기·전자':['부품','전기','전자','전기·전자','IT서비스','제품']
};
function matchesInterest(card,interest){
 const tags=(card.dataset.interestTags||'').split(',');const cat=card.dataset.category||'';
 if(cat===interest||tags.includes(interest))return true;
 if(customCategorySynonyms[cat]?.includes(interest))return true;
 if(customCategorySynonyms[interest]?.some(x=>tags.includes(x)))return true;
 return false;
}
function personalizedScore(card){
 const base=Number(card.dataset.baseScore||0);
 const matched=interests.filter(i=>matchesInterest(card,i)).length;
 const likes=JSON.parse(localStorage.getItem('ib-likes')||'[]');
 const subscriptions=JSON.parse(localStorage.getItem('ib-subs')||'[]');
 const index=Number(card.dataset.catalogId.replace('cat-',''));
 const enterprise=['co-0','co-1','co-2','co-3','co-4','co-5'][index];
 return base+matched*120+(likes.includes(card.dataset.catalogId)?30:0)+(subscriptions.includes(enterprise)?15:0);
}
let currentSort='recommended';
let currentCategory='전체';
function render(){
 const matched=cards.filter(card=>currentCategory==='전체'||card.dataset.category===currentCategory);
 matched.sort((a,b)=>{
  if(currentSort==='recent')return b.dataset.published.localeCompare(a.dataset.published);
  if(currentSort==='popular')return Number(b.dataset.demoViews)-Number(a.dataset.demoViews);
  return personalizedScore(b)-personalizedScore(a)||b.dataset.published.localeCompare(a.dataset.published);
 });
 const visible=new Set(matched);
 cards.forEach(card=>{card.hidden=!visible.has(card)});
 matched.forEach(card=>grid.appendChild(card));
 empty.hidden=matched.length>0;
 const selectedText=currentCategory==='전체'?'전체 산업':currentCategory;
 if(currentSort==='recommended'){
  if(signed&&interests.length){info.textContent='내 관심 카테고리 '+interests.join(' · ')+'를 반영한 '+selectedText+' 추천입니다.';}
  else if(signed){info.textContent='관심 카테고리를 선택하면 추천이 개인화됩니다. 지금은 '+selectedText+' 공통 추천을 보여드립니다.';}
  else {info.textContent='로그인하면 내 관심 카테고리에 맞춰 카탈로그가 추천됩니다. 지금은 '+selectedText+' 공통 추천입니다.';}
 }else if(currentSort==='recent')info.textContent=selectedText+' 카탈로그를 등록일이 최신인 순으로 보여드립니다.';
 else info.textContent=selectedText+' 카탈로그를 조회수가 높은 순으로 보여드립니다.';
}
tabs.forEach(btn=>btn.addEventListener('click',()=>{
 currentSort=btn.dataset.catalogSort;
 tabs.forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))});
 render();
}));
filterButtons.forEach(btn=>btn.addEventListener('click',()=>{
 currentCategory=btn.dataset.homeCategory;
 filterButtons.forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 render();
}));
if(signed){
 document.getElementById('homeInterestEdit').hidden=false;
 if(interests.length){
  const holder=document.getElementById('homeInterestCategories');
  const hint=document.createElement('span');
  hint.className='ib-interest-profile-summary';
  hint.textContent='내 관심 분야: '+interests.join(' · ');
  holder.after(hint);
 }
}
render();
})();