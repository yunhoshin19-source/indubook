/* IndustryBook enterprise finder: country/region and product-keyword search.
 * Country assignments on sample cards are illustrative, not verified company records.
 * Live services should obtain ISO country codes from verified company profiles. */
(function(){
'use strict';
const input=document.getElementById('q'),country=document.getElementById('companyCountryFilter');
if(!input||!country)return;
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
 const meta=card.querySelector('.card-body .muted');
 if(meta&&sample){const badge=document.createElement('span');badge.className='ib-company-country-badge';badge.textContent=' · '+name+' (샘플)';meta.append(badge);}
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
function render(){
 const text=input.value.trim().toLocaleLowerCase('ko');
 const selected=country.value;
 let visible=0;
 for(const card of cards){
  const matchText=!text||(card.dataset.search||'').toLocaleLowerCase('ko').includes(text);
  const matchCountry=!selected||card.dataset.country===selected;
  card.classList.toggle('ib-company-search-hidden',!(matchText&&matchCountry));
  // The common app may also set result-hide; keep both conditions consistent.
  card.classList.toggle('result-hide',!matchText);
  if(matchText&&matchCountry)visible++;
 }
 const count=document.getElementById('companySearchCount');
 if(count)count.textContent='검색 결과 '+visible+'개 기업 · 국가/지역은 시연용 샘플 정보입니다.';
 const next=new URLSearchParams();
 if(input.value.trim())next.set('q',input.value.trim());
 if(country.value)next.set('country',country.value);
 history.replaceState(null,'','companies.html'+(next.toString()?'?'+next:''));
}
input.addEventListener('input',render);
country.addEventListener('change',render);
render();
})();