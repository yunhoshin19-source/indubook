/* IndustryBook cross-entity search UI prototype.
 * Catalog/company seeds represent current static demo cards; published products
 * are read from the browser's local product master. A production index/API is required.
 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
if(!$('ibGlobalResults'))return;
const countries={KR:'대한민국',US:'미국',JP:'일본',CN:'중국',VN:'베트남',DE:'독일',GB:'영국',FR:'프랑스',SG:'싱가포르',IN:'인도',AU:'호주',TW:'대만',OTHER:'기타 국가/지역'};
const companies=[
 {id:'co-0',name:'A 로보틱스',industry:'로봇·자동화, 산업기계, 스마트팩토리',country:'KR'},
 {id:'co-1',name:'B 테크',industry:'산업기계, 정밀 가공',country:'US'},
 {id:'co-2',name:'C 일렉트로닉스',industry:'전기·전자, 센서, IoT',country:'JP'},
 {id:'co-3',name:'D 오토메이션',industry:'로봇·자동화, 산업 제어',country:'DE'},
 {id:'co-4',name:'E 모션',industry:'산업기계, 모터, 드라이브',country:'VN'},
 {id:'co-5',name:'F 솔루션',industry:'로봇·자동화, 스마트팩토리',country:'SG'}
];
const catalogSeeds=[
 {id:'cat-0',name:'로봇 자동화 솔루션',companyId:'co-0',category:'로봇·자동화'},
 {id:'cat-1',name:'정밀 가공 장비',companyId:'co-1',category:'산업기계'},
 {id:'cat-2',name:'스마트 센서 시스템',companyId:'co-2',category:'전기·전자'},
 {id:'cat-3',name:'산업 제어 시스템',companyId:'co-3',category:'로봇·자동화'},
 {id:'cat-4',name:'산업용 드라이브',companyId:'co-4',category:'산업기계'},
 {id:'cat-5',name:'스마트 팩토리',companyId:'co-5',category:'로봇·자동화'}
];
// Demonstration regions only; production must use validated company profile data.
const demoRegions={'co-0':'KR-41','co-1':'US-CA','co-2':'JP-13','co-3':'DE-BE','co-4':'VN-HN','co-5':'SG-SG'};
const regions={"KR":[["KR-11","서울"],["KR-41","경기"],["KR-28","인천"],["KR-26","부산"]],"US":[["US-CA","California"],["US-NY","New York"],["US-TX","Texas"]],"JP":[["JP-13","도쿄"],["JP-27","오사카"]],"DE":[["DE-BE","베를린"],["DE-BY","바이에른"]],"VN":[["VN-HN","하노이"],["VN-SG","호찌민"]],"SG":[["SG-SG","싱가포르"]]};
companies.forEach(x=>x.region=demoRegions[x.id]||'');
const companyMap=Object.fromEntries(companies.map(x=>[x.id,x]));
const products=(window.IBProducts?.list?.()||[]).filter(x=>x.status==='published');
const items=[
 ...catalogSeeds.map(x=>({...x,type:'catalog',image:x.coverImage||x.thumbnail||'',company:companyMap[x.companyId]?.name||'',country:companyMap[x.companyId]?.country||'',region:companyMap[x.companyId]?.region||'',href:'catalogs.html?q='+encodeURIComponent(x.name),keywords:[x.name,x.category,companyMap[x.companyId]?.name||'']})),
 ...products.map(x=>({id:x.id,type:'product',image:x.thumbnailUrl||x.thumbnail_url||x.coverImageUrl||x.coverImage||x.imageUrl||x.image_url||x.image||x.thumbnail||x.images?.[0]||x.media?.[0]||'',name:x.name,company:x.company||companyMap[x.owner]?.name||'',category:(x.categories||[x.category]).join(', '),country:companyMap[x.owner]?.country||'',region:companyMap[x.owner]?.region||'',href:'product-detail.html?id='+encodeURIComponent(x.id),keywords:[x.name,x.en,x.model,x.company,x.category,x.industry,...(x.categories||[]),...(x.tags||[]),x.summary]})),
 ...companies.map(x=>({...x,type:'company',image:x.logoUrl||x.logo||x.coverImage||'',category:x.industry,company:x.name,href:'companies.html?q='+encodeURIComponent(x.name),keywords:[x.name,x.industry,...products.filter(p=>p.owner===x.id).flatMap(p=>[p.name,p.model,p.en,...(p.tags||[])])]}))
];
const types={catalog:'기업 카탈로그',product:'제품',company:'기업'};
const fromUrl=new URLSearchParams(location.search);
const openFilterOnLoad=fromUrl.get('filters')==='1';
const search=$('ibGlobalQuery'),filter=$('ibGlobalCountry'),regionFilter=$('ibGlobalRegion'),target=$('ibGlobalResults');
function populateRegions(){
 const options=regions[filter.value]||[];
 regionFilter.replaceChildren(new Option('전체 지역',''));
 for(const [code,name] of options)regionFilter.add(new Option(name,code));
 regionFilter.disabled=!options.length;
}
search.value=fromUrl.get('q')||'';filter.value=fromUrl.get('country')||'';
if(filter.value!==fromUrl.get('country')&&fromUrl.get('country'))filter.value='';
populateRegions();
regionFilter.value=fromUrl.get('region')||'';
if(regionFilter.value!==(fromUrl.get('region')||''))regionFilter.value='';
let active=['all','catalog','product','company'].includes(fromUrl.get('type'))?fromUrl.get('type'):'all';
const text=(tag,className,value)=>{const e=document.createElement(tag);if(className)e.className=className;if(value!==undefined)e.textContent=value;return e};
const folded=value=>String(value||'').normalize('NFKC').toLocaleLowerCase('ko').replace(/\s+/g,' ').trim();
function matches(item,term){
 if(!term)return true;
 const normalized=folded([item.name,item.company,item.category,...item.keywords].join(' '));
 return term.split(' ').every(word=>normalized.includes(word));
}
// Use a saved product's actual public image when present. Demo records get a clearly
// illustrative thumbnail; a non-image URL cannot be used as a thumbnail.
const fallbackArt={
 catalog:'<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg"><rect x="53" y="17" width="133" height="116" rx="9" fill="#fff" stroke="#a7c4e8" stroke-width="3"/><path d="M76 40h87M76 52h65" stroke="#9cb8db" stroke-width="5" stroke-linecap="round"/><circle cx="91" cy="87" r="16" fill="#9acafa"/><path d="m80 114 30-33 17 17 14-15 23 31" fill="#5a89c7"/></svg>',
 product:'<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg"><path d="m120 19 73 39v57l-73 37-73-37V58z" fill="#dfebfa" stroke="#8cafd8" stroke-width="3"/><path d="m47 58 73 39 73-39M120 97v55" fill="none" stroke="#8cafd8" stroke-width="3"/><path d="m120 19 73 39-73 39-73-39z" fill="#9bbdea"/><circle cx="120" cy="97" r="11" fill="#346bb6"/></svg>',
 company:'<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg"><rect x="57" y="24" width="126" height="112" rx="8" fill="#a9c7eb"/><path d="M80 47h18v18H80zm31 0h18v18h-18zm31 0h18v18h-18zM80 80h18v18H80zm31 0h18v18h-18zm31 0h18v18h-18z" fill="#fff"/><path d="M109 136v-26h22v26" fill="#3f74b9"/></svg>'
};
function thumbnail(item){
 const wrap=text('div','ib-result-thumbnail ib-result-thumbnail-'+item.type);
 const raw=item.image;
 const candidate=typeof raw==='string'?raw:typeof raw?.url==='string'?raw.url:typeof raw?.src==='string'?raw.src:typeof raw?.dataUrl==='string'?raw.dataUrl:'';
 // Only safe image schemes or relative image assets are accepted.
 const safe=/^https:\/\//i.test(candidate)||/^data:image\/(png|jpeg|webp|gif);base64,/i.test(candidate)||/^(?!\/|\.|.*\.\.)[\w/-]+\.(png|jpe?g|webp|gif|svg)(?:\?[\w=&-]+)?$/i.test(candidate);
 if(candidate && safe){
  const img=document.createElement('img');img.src=candidate;img.alt=item.name+' 대표이미지';img.loading='lazy';img.decoding='async';
  img.onerror=()=>{wrap.replaceChildren();wrap.innerHTML=fallbackArt[item.type]};wrap.append(img);
 }else{
  wrap.innerHTML=fallbackArt[item.type];
 }
 return wrap;
}
function card(item){
 const a=text('a','ib-unified-result ib-search-image-card');
 a.href=item.href;
 const info=text('div','ib-unified-result-info');
 info.append(text('span','ib-result-type',types[item.type]));
 info.append(text('strong','',item.name));
 info.append(text('p','',item.type==='company'?item.industry:item.company+' · '+item.category));
 if(item.country){
  const regionName=(regions[item.country]||[]).find(x=>x[0]===item.region)?.[1];
  info.append(text('span','ib-unified-country',(countries[item.country]||'국가 미등록')+(regionName?' · '+regionName:'')+' · 샘플 소재지'));
 }
 info.append(text('span','ib-unified-arrow','상세 보기 →'));
 a.append(thumbnail(item),info);
 return a;
}

function render(){
 const term=folded(search.value),country=filter.value,region=regionFilter.value;
 const matching=items.filter(x=>matches(x,term)&&(!country||x.country===country)&&(!region||x.region===region));
 const counts={all:matching.length,catalog:0,product:0,company:0};
 for(const x of matching)counts[x.type]++;
 $('ibCountAll').textContent=counts.all;$('ibCountCatalog').textContent=counts.catalog;
 $('ibCountProduct').textContent=counts.product;$('ibCountCompany').textContent=counts.company;
 document.querySelectorAll('[data-global-type]').forEach(b=>{const is=b.dataset.globalType===active;b.classList.toggle('active',is);b.setAttribute('aria-pressed',String(is))});
 $('ibGlobalSummary').textContent=(term?'“'+search.value.trim()+'” 검색 결과 ':'전체 데모 데이터 ')+'총 '+counts[active]+'건';
 target.replaceChildren();
 for(const type of active==='all'?['catalog','product','company']:[active]){
  const matchesForType=matching.filter(x=>x.type===type);
  const section=text('section','ib-unified-group'),heading=text('div','ib-unified-group-heading');
  heading.append(text('h2','',types[type]+' ('+matchesForType.length+')'));
  if(active==='all'){const more=text('button','ib-unified-more','전체 보기');more.type='button';more.addEventListener('click',()=>{active=type;render()});heading.append(more)}
  section.append(heading);
  const list=text('div','ib-unified-result-list');
  for(const item of matchesForType.slice(0,active==='all'?6:100))list.append(card(item));
  if(!matchesForType.length)list.append(text('p','ib-unified-empty','검색 결과가 없습니다.'));
  section.append(list);target.append(section);
 }
 const next=new URLSearchParams();
 if(search.value.trim())next.set('q',search.value.trim());
 if(country)next.set('country',country);
 if(region)next.set('region',region);
 if(active!=='all')next.set('type',active);
 history.replaceState(null,'','search.html'+(next.toString()?'?'+next:''));
 document.dispatchEvent(new Event('ib-search-updated'));
}
const overlay=$('ibFilterDialog'),openBtn=$('ibOpenFilters'),badge=$('ibFilterBadge');
const activeFilters=$('ibActiveFilters');
let beforeOpen=null;
function updateFilterUI(){
 const selected=[filter.value,regionFilter.value].filter(Boolean);
 badge.hidden=!selected.length;badge.textContent=String(selected.length);
 openBtn.classList.toggle('has-active-filter',!!selected.length);
 activeFilters.replaceChildren();
 if(selected.length){
  if(filter.value)activeFilters.append(text('span','ib-active-filter-chip',countries[filter.value]||filter.value));
  if(regionFilter.value)activeFilters.append(text('span','ib-active-filter-chip',(regions[filter.value]||[]).find(x=>x[0]===regionFilter.value)?.[1]||regionFilter.value));
  const clear=text('button','ib-active-filter-clear','모두 해제 ×');clear.type='button';
  clear.addEventListener('click',()=>{filter.value='';populateRegions();regionFilter.value='';render()});
  activeFilters.append(clear);
 }
 activeFilters.hidden=!selected.length;
}
function openFilters(){
 beforeOpen={country:filter.value,region:regionFilter.value};
 overlay.hidden=false;document.body.classList.add('ib-filter-open');
 openBtn.setAttribute('aria-expanded','true');
 $('ibCloseFilters').focus();
}
function closeFilters(apply=false){
 if(overlay.hidden)return;
 if(!apply && beforeOpen){
  filter.value=beforeOpen.country;populateRegions();regionFilter.value=beforeOpen.region;
 }
 overlay.hidden=true;document.body.classList.remove('ib-filter-open');
 openBtn.setAttribute('aria-expanded','false');beforeOpen=null;
 if(apply)render();
 openBtn.focus();
}
openBtn.addEventListener('click',openFilters);
$('ibCloseFilters').addEventListener('click',()=>closeFilters());
overlay.querySelector('[data-close-filter]').addEventListener('click',()=>closeFilters());
$('ibApplyFilters').addEventListener('click',()=>closeFilters(true));
$('ibResetFilters').addEventListener('click',()=>{filter.value='';populateRegions();regionFilter.value='';});
overlay.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();closeFilters();return}
 if(e.key==='Tab'){
  const focusable=[...overlay.querySelectorAll('button:not(:disabled),select:not(:disabled)')];
  const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 }
});
$('ibGlobalSearchForm').addEventListener('submit',e=>{e.preventDefault();active='all';render()});
document.querySelectorAll('[data-global-type]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.globalType;render()}));
const originalRender=render;
render=function(){originalRender();updateFilterUI()};
render();
if(openFilterOnLoad){
 const url=new URL(location.href);
 url.searchParams.delete('filters');
 history.replaceState(null,'',url.pathname.split('/').pop()+url.search);
 openFilters();
}
})();