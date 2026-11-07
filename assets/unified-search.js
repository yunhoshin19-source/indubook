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
const companyMap=Object.fromEntries(companies.map(x=>[x.id,x]));
const products=(window.IBProducts?.list?.()||[]).filter(x=>x.status==='published');
const items=[
 ...catalogSeeds.map(x=>({...x,type:'catalog',company:companyMap[x.companyId]?.name||'',country:companyMap[x.companyId]?.country||'',href:'catalogs.html?q='+encodeURIComponent(x.name),keywords:[x.name,x.category,companyMap[x.companyId]?.name||'']})),
 ...products.map(x=>({id:x.id,type:'product',name:x.name,company:x.company||companyMap[x.owner]?.name||'',category:(x.categories||[x.category]).join(', '),country:companyMap[x.owner]?.country||'',href:'product-detail.html?id='+encodeURIComponent(x.id),keywords:[x.name,x.en,x.model,x.company,x.category,x.industry,...(x.categories||[]),...(x.tags||[]),x.summary]})),
 ...companies.map(x=>({...x,type:'company',category:x.industry,company:x.name,href:'companies.html?q='+encodeURIComponent(x.name),keywords:[x.name,x.industry,...products.filter(p=>p.owner===x.id).flatMap(p=>[p.name,p.model,p.en,...(p.tags||[])])]}))
];
const types={catalog:'기업 카탈로그',product:'제품',company:'기업'};
const fromUrl=new URLSearchParams(location.search);
const search=$('ibGlobalQuery'),filter=$('ibGlobalCountry'),target=$('ibGlobalResults');
search.value=fromUrl.get('q')||'';filter.value=fromUrl.get('country')||'';
if(filter.value!==fromUrl.get('country')&&fromUrl.get('country'))filter.value='';
let active=['all','catalog','product','company'].includes(fromUrl.get('type'))?fromUrl.get('type'):'all';
const text=(tag,className,value)=>{const e=document.createElement(tag);if(className)e.className=className;if(value!==undefined)e.textContent=value;return e};
const folded=value=>String(value||'').normalize('NFKC').toLocaleLowerCase('ko').replace(/\s+/g,' ').trim();
function matches(item,term){
 if(!term)return true;
 const normalized=folded([item.name,item.company,item.category,...item.keywords].join(' '));
 return term.split(' ').every(word=>normalized.includes(word));
}
function card(item){
 const a=text('a','ib-unified-result');
 a.href=item.href;
 const symbol=text('span','ib-unified-result-symbol',item.type==='catalog'?'▣':item.type==='product'?'◈':'▤');
 const info=text('div','ib-unified-result-info');
 info.append(text('strong','',item.name));
 info.append(text('p','',item.type==='company'?item.industry:item.company+' · '+item.category));
 if(item.country)info.append(text('span','ib-unified-country',(countries[item.country]||'국가 미등록')+' · 샘플 국가'));
 const arrow=text('span','ib-unified-arrow','상세 보기 →');
 a.append(symbol,info,arrow);
 return a;
}
function render(){
 const term=folded(search.value),country=filter.value;
 const matching=items.filter(x=>matches(x,term)&&(!country||x.country===country));
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
 if(active!=='all')next.set('type',active);
 history.replaceState(null,'','search.html'+(next.toString()?'?'+next:''));
}
$('ibGlobalSearchForm').addEventListener('submit',e=>{e.preventDefault();active='all';render()});
filter.addEventListener('change',render);
document.querySelectorAll('[data-global-type]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.globalType;render()}));
render();
})();