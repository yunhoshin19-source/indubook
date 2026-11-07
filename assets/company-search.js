/* IndustryBook enterprise finder: country/region and product-keyword search.
 * Country assignments on sample cards are illustrative, not verified company records.
 * Live services should obtain ISO country codes from verified company profiles. */
(function(){
'use strict';
const input=document.getElementById('q'),country=document.getElementById('companyCountryFilter');
if(!input||!country)return;
const regionSelect=document.getElementById('companyRegionFilter');
const regions={"KR":[["KR-11","서울"],["KR-41","경기"],["KR-28","인천"],["KR-26","부산"]],"US":[["US-CA","California"],["US-NY","New York"],["US-TX","Texas"]],"JP":[["JP-13","도쿄"],["JP-27","오사카"]],"DE":[["DE-BE","베를린"],["DE-BY","바이에른"]],"VN":[["VN-HN","하노이"],["VN-SG","호찌민"]],"SG":[["SG-SG","싱가포르"]]};
const demoRegions={'co-0':'KR-41','co-1':'US-CA','co-2':'JP-13','co-3':'DE-BE','co-4':'VN-HN','co-5':'SG-SG'};
function populateRegions(){
 const options=regions[country.value]||[];
 regionSelect.replaceChildren(new Option('전체 지역',''));
 for(const [code,name] of options)regionSelect.add(new Option(name,code));
 regionSelect.disabled=!options.length;
}
const cards=[...document.querySelectorAll('.company-item')];
const countryData={
 'co-0':['KR','대한민국'],'co-1':['US','미국'],'co-2':['JP','일본'],
 'co-3':['DE','독일'],'co-4':['VN','베트남'],'co-5':['SG','싱가포르']
};
const productData=window.IBProducts?.list?.()||[];
const params=new URLSearchParams(location.search);
for(const card of cards){
 const id=card.querySelector('[data-subscribe]')?.dataset.subscribe||'';
 const sample=countryData[id];
 const [code,name]=sample||['','국가 미등록'];
 card.dataset.country=code;
 card.dataset.region=demoRegions[id]||'';
 const meta=card.querySelector('.card-body .muted');
 if(meta&&sample){const badge=document.createElement('span');badge.className='ib-company-country-badge';badge.textContent=' · '+name+((regions[code]||[]).find(x=>x[0]===card.dataset.region)?.[1]?' · '+(regions[code]||[]).find(x=>x[0]===card.dataset.region)[1]:'')+' (샘플)';meta.append(badge);}
 const matches=productData.filter(p=>p.owner===id&&p.status==='published');
 const tokens=matches.flatMap(p=>[p.name,p.en,p.model,p.company,p.category,
   ...(Array.isArray(p.categories)?p.categories:[]),
   ...(Array.isArray(p.tags)?p.tags:[])].filter(Boolean));
 card.dataset.search=[card.dataset.search,...tokens,name].filter(Boolean).join(' ');
}
input.placeholder='기업명, 산업 분야, 제품명 검색';
input.setAttribute('aria-label','기업명, 산업 분야, 제품명 검색');
input.value=params.get('q')||'';
country.value=params.get('country')||'';
if(country.value!==params.get('country')&&params.get('country'))country.value='';
populateRegions();
regionSelect.value=params.get('region')||'';
if(regionSelect.value!==(params.get('region')||''))regionSelect.value='';
function render(){
 const text=input.value.trim().toLocaleLowerCase('ko');
 const selected=country.value;
 let visible=0;
 for(const card of cards){
  const matchText=!text||(card.dataset.search||'').toLocaleLowerCase('ko').includes(text);
  const matchCountry=!selected||card.dataset.country===selected;
  const matchRegion=!regionSelect.value||card.dataset.region===regionSelect.value;
  card.classList.toggle('ib-company-search-hidden',!(matchText&&matchCountry&&matchRegion));
  // The common app may also set result-hide; keep both conditions consistent.
  card.classList.toggle('result-hide',!matchText);
  if(matchText&&matchCountry&&matchRegion)visible++;
 }
 const count=document.getElementById('companySearchCount');
 if(count)count.textContent='검색 결과 '+visible+'개 기업 · 국가/지역은 시연용 샘플 정보입니다.';
 const next=new URLSearchParams();
 if(input.value.trim())next.set('q',input.value.trim());
 if(country.value)next.set('country',country.value);
 if(regionSelect.value)next.set('region',regionSelect.value);
 history.replaceState(null,'','companies.html'+(next.toString()?'?'+next:''));
}
input.addEventListener('input',render);
country.addEventListener('change',()=>{populateRegions();render()});
regionSelect.addEventListener('change',render);
render();
})();