/* Enrich company search with products belonging to each company.
   Prototype data comes from browser product master; production requires server search. */
(function(){
'use strict';
const input=document.getElementById('q');
if(!input||!document.querySelector('.company-item'))return;
const data=window.IBProducts&&typeof window.IBProducts.list==='function'?window.IBProducts.list():[];
const cards=[...document.querySelectorAll('.company-item')];
for(const card of cards){
 const id=card.querySelector('[data-subscribe]')?.dataset.subscribe||'';
 const products=data.filter(product=>product.owner===id&&product.status==='published');
 const words=products.flatMap(product=>[
  product.name||'',product.en||'',product.model||'',
  ...(Array.isArray(product.categories)?product.categories:[product.category||'']),
  ...(Array.isArray(product.tags)?product.tags:[])
 ]).filter(Boolean);
 card.dataset.search=[card.dataset.search||'',...words].join(' ');
}
input.placeholder='기업명, 산업 분야, 제품명 검색';
input.setAttribute('aria-label','기업명, 산업 분야, 제품명 검색');
})();