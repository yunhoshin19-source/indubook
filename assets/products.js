/* Products UI controller — client-only demo */
(function(){
'use strict';
if(!window.IBProducts)return;
const db=window.IBProducts,$=id=>document.getElementById(id),query=new URLSearchParams(location.search);
const escapeHTML=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const published=()=>db.list().filter(p=>p.status==='published');
function itemCard(p){
const a=document.createElement('article');a.className='ib-product-card';
const link=document.createElement('a');link.href='product-detail.html?id='+encodeURIComponent(p.id);link.className='ib-product-card-cover';
const badge=document.createElement('span');badge.textContent='INDUSTRY / PRODUCT';const illustration=document.createElement('div');illustration.className='ib-product-shape';illustration.innerHTML='<span></span><span></span><span></span>';const model=document.createElement('strong');model.textContent=p.model;link.append(badge,illustration,model);a.append(link);
const body=document.createElement('div');body.className='ib-product-card-body';
const cat=document.createElement('span');cat.className='ib-product-category';cat.textContent=p.category;
const title=document.createElement('a');title.href=link.href;title.className='ib-product-name';title.textContent=p.name;
const summary=document.createElement('p');summary.textContent=p.summary||'산업용 제품';
const foot=document.createElement('div');foot.className='ib-product-card-foot';const company=document.createElement('span');company.textContent=p.company;const more=document.createElement('a');more.href=link.href;more.textContent='제품 보기 →';foot.append(company,more);body.append(cat,title,summary,foot);a.append(body);return a
}
window.IBProducts.renderCards=(el,records)=>{el.replaceChildren();records.forEach(p=>el.append(itemCard(p)))};
if($('homeProductsGrid')){const items=published().sort((a,b)=>(b.views+b.likes*2)-(a.views+a.likes*2)).slice(0,4);db.renderCards($('homeProductsGrid'),items)}
if($('companyProductsGrid')){const items=published().filter(p=>p.owner==='co-0');db.renderCards($('companyProductsGrid'),items);const count=$('companyProductCount');if(count)count.textContent=items.length}
if($('productGrid')){
 const search=$('productSearch'),category=$('productCategory'),sort=$('productSort');search.value=query.get('q')||'';category.value=query.get('category')||'';
 function render(){
  const q=search.value.trim().toLowerCase();
  const list=published().filter(p=>(!category.value||p.category===category.value)&&(!q||[p.name,p.en,p.model,p.company,p.category,p.summary,...p.tags].join(' ').toLowerCase().includes(q)));
  list.sort((a,b)=>sort.value==='recent'?b.updated.localeCompare(a.updated):sort.value==='popular'?b.views-a.views:(b.views+b.likes*2)-(a.views+a.likes*2));
  db.renderCards($('productGrid'),list);$('productCount').textContent='전체 '+list.length+'개 제품';
  if(!list.length){const msg=document.createElement('p');msg.className='ib-product-empty';msg.textContent='검색 결과가 없습니다.';$('productGrid').append(msg)}
 }
 [search,category,sort].forEach(x=>x.addEventListener('input',render));render();
}
if($('productDetail')){
 const p=db.get(query.get('id')||'p-cr20');if(!p||p.status!=='published'){$('productDetail').textContent='제품을 찾을 수 없습니다.';return}
 document.title=p.name+' | IndustryBook';const container=$('productDetail');
 const hero=document.createElement('div');hero.className='ib-product-detail-main';
 const visual=document.createElement('div');visual.className='ib-product-detail-visual';visual.innerHTML='<span>INDUSTRYBOOK / PRODUCT</span><div class="ib-product-detail-shape">⬡</div>';const model=document.createElement('strong');model.textContent=p.model;visual.append(model);
 const data=document.createElement('div');data.className='ib-product-detail-info';
 const category=document.createElement('span');category.className='eyebrow';category.textContent=p.category;
 const name=document.createElement('h1');name.textContent=p.name;const english=document.createElement('p');english.textContent=p.en||'';
 const summary=document.createElement('p');summary.className='ib-product-lead';summary.textContent=p.summary;
 const details=document.createElement('div');details.className='ib-product-detail-facts';
 [['제조사',p.company],['모델명',p.model],['인더스트리',p.industry],['가격',p.price||'견적 문의'],['등록·수정일',p.updated]].forEach(([k,v])=>{const label=document.createElement('span');label.textContent=k;const value=document.createElement('strong');value.textContent=v;details.append(label,value)});
 const actions=document.createElement('div');actions.className='ib-product-detail-buttons';const inquiry=document.createElement('a');inquiry.className='button primary';inquiry.textContent='제품 문의 / RFQ →';inquiry.href='messages.html?to='+encodeURIComponent(p.owner)+'&draft='+encodeURIComponent('[제품 문의] '+p.name+' ('+p.model+')\n견적 및 제품 사양에 대해 문의드립니다.');
 const company=document.createElement('a');company.className='button secondary';company.href='company-profile.html';company.textContent='기업 페이지 보기';actions.append(inquiry,company);
 data.append(category,name,english,summary,details,actions);hero.append(visual,data);container.append(hero);
 const lower=document.createElement('div');lower.className='ib-product-lower';const description=document.createElement('section');description.className='ib-product-data-panel';const h2=document.createElement('h2');h2.textContent='제품 소개';const pp=document.createElement('p');pp.textContent=p.description;description.append(h2,pp);
 const related=document.createElement('div');related.className='ib-product-catalog-ref';const h3=document.createElement('h2');h3.textContent='관련 카탈로그';related.append(h3);
 if(p.catalogIds?.length){p.catalogIds.forEach(cid=>{const a=document.createElement('a');a.href='catalogs.html?q='+encodeURIComponent(p.model);a.textContent='연결 카탈로그 찾기 ('+cid+') →';related.append(a)})}else{const note=document.createElement('p');note.textContent='연결된 카탈로그가 없습니다.';related.append(note)}
 const spec=document.createElement('section');spec.className='ib-product-data-panel';const st=document.createElement('h2');st.textContent='주요 기술 사양';spec.append(st);const dl=document.createElement('dl');dl.className='ib-product-specs';Object.entries(p.specs||{}).forEach(([k,v])=>{const dt=document.createElement('dt');dt.textContent=k;const dd=document.createElement('dd');dd.textContent=v;dl.append(dt,dd)});spec.append(dl);
 const col=document.createElement('div');col.append(spec,related);lower.append(description,col);container.append(lower);if(window.IBProductMedia)window.IBProductMedia.renderDetail(p,visual,related);
 const other=published().filter(x=>x.id!==p.id).sort((a,b)=>Number(b.category===p.category)-Number(a.category===p.category)).slice(0,3);db.renderCards($('productRelated'),other);
}
if($('productManageGate')){
 const signed=localStorage.getItem('ib-demo-logged-in')==='yes',role=localStorage.getItem('ib-demo-role')||'enterprise';
 const allowed=signed&&role==='enterprise';
 $('productManageGate').hidden=allowed;$('productManageArea').hidden=!allowed;
 if(!allowed)return;
 const rows=$('productManagedRows'),dialog=$('productEditor'),form=$('productEditForm');
 if(window.IBProductMedia)window.IBProductMedia.init();
 const fields={name:'pName',en:'pEnglish',model:'pModel',category:'pCategory',industry:'pIndustry',status:'pStatus',summary:'pSummary',description:'pDescription'};
 async function fill(p){form.reset();$('pId').value=p?.id||'';for(const [k,id] of Object.entries(fields))$(id).value=p?.[k]||({status:'draft'}[k]||'');$('pTags').value=(p?.tags||[]).join(', ');$('pCatalog').value=p?.catalogIds?.[0]||'';$('pSpecs').value=Object.entries(p?.specs||{}).map(([k,v])=>k+': '+v).join('\n');$('productEditorTitle').textContent=p?'제품 수정':'제품 등록';dialog.showModal();if(window.IBProductMedia)await window.IBProductMedia.load(p)}
 function render(){const data=db.list().filter(p=>p.owner==='co-0');$('managedCount').textContent=data.length+'개 제품';rows.replaceChildren();
 for(const p of data){const row=document.createElement('tr');for(const value of [p.name+' / '+p.model,p.category,p.status==='published'?'공개':'임시저장',p.updated]){const td=document.createElement('td');td.textContent=value;row.append(td)}
 const td=document.createElement('td'),edit=document.createElement('button'),del=document.createElement('button');edit.type=del.type='button';edit.className='button secondary small';edit.textContent='수정';edit.onclick=()=>fill(p);del.className='ib-product-delete';del.textContent='삭제';del.onclick=async()=>{if(!confirm(p.name+' 제품을 삭제할까요?'))return;try{if(window.IBProductMedia)await window.IBProductMedia.cleanup(p);db.save(db.list().filter(x=>x.id!==p.id));render()}catch(e){alert('파일 삭제에 실패했습니다: '+e.message)}};td.append(edit,del);row.append(td);rows.append(row)}
 if(!data.length){const row=document.createElement('tr'),td=document.createElement('td');td.colSpan=5;td.textContent='등록된 제품이 없습니다. 새 제품을 등록해 주세요.';row.append(td);rows.append(row)}
 }
 $('productCreate').onclick=()=>fill(null);$('productCancel').onclick=()=>dialog.close();$('productEditorClose').onclick=()=>dialog.close();
 form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;
 const data=db.list(),id=$('pId').value||'p-'+Date.now().toString(36),prev=data.find(p=>p.id===id);
 const next={...(prev||{}),id,owner:'co-0',company:'A 로보틱스',views:prev?.views||0,likes:prev?.likes||0,updated:new Date().toISOString().slice(0,10),price:'견적 문의'};
 for(const [k,field] of Object.entries(fields))next[k]=$(field).value.trim();
 next.tags=$('pTags').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,12);
 next.catalogIds=$('pCatalog').value?[$('pCatalog').value]:[];
 next.specs={};$('pSpecs').value.split('\n').forEach(line=>{const i=line.indexOf(':');if(i>0){const k=line.slice(0,i).trim(),v=line.slice(i+1).trim();if(k&&v)next.specs[k]=v}});
 try{db.validate(next);if(window.IBProductMedia){const media=await window.IBProductMedia.persist(prev);Object.assign(next,media)}if(prev)Object.assign(prev,next);else data.push(next);db.save(data);dialog.close();render()}catch(err){alert('제품 또는 첨부 파일 저장에 실패했습니다: '+err.message)}
 });render()
}
})();