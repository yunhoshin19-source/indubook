/* Product editing page — browser-only MDM demonstration. */
(function(){
'use strict';
const db=window.IBProducts,$=id=>document.getElementById(id);
if(!db||!$('productEditForm'))return;
const signed=localStorage.getItem('ib-demo-logged-in')==='yes';
const role=localStorage.getItem('ib-demo-role')||'enterprise';
const allowed=signed&&role==='enterprise';
$('productEditGate').hidden=allowed;$('productEditArea').hidden=!allowed;
if(!allowed)return;
const form=$('productEditForm');
if(window.IBProductMedia)window.IBProductMedia.init();
 const fields={name:'pName',en:'pEnglish',model:'pModel',industry:'pIndustry',status:'pStatus',summary:'pSummary',description:'pDescription'};
 const defaultCategorySuggestions=['로봇·자동화','산업기계','전기·전자','부품','소재','장비','IT서비스','기술서비스','제조업','스마트팩토리','센서','에너지','건설','바이오','모빌리티','반도체','화학','물류'];
 let categoryTags=[];
 function renderCategoryTags(){const panel=$('pCategoryChips');panel.replaceChildren();$('pCategoryCount').textContent=categoryTags.length+' / 5';categoryTags.forEach((value,i)=>{const chip=document.createElement('span');chip.className='ib-product-tag';chip.append(document.createTextNode(value+(i===0?' · 대표':'')));const del=document.createElement('button');del.type='button';del.setAttribute('aria-label',value+' 제거');del.textContent='×';del.onclick=()=>{categoryTags.splice(i,1);renderCategoryTags()};chip.append(del);panel.append(chip)});const options=$('pCategorySuggestions');options.replaceChildren();defaultCategorySuggestions.filter(x=>!categoryTags.some(t=>t.toLowerCase()===x.toLowerCase())).slice(0,10).forEach(value=>{const b=document.createElement('button');b.type='button';b.textContent='+ '+value;b.onclick=()=>addCategory(value);options.append(b)})}
 function addCategory(input){for(const raw of String(input||'').split(/[,，\n]+/)){const value=raw.trim();if(!value)continue;if(categoryTags.length>=5){alert('카테고리는 최대 5개까지 등록할 수 있습니다.');break}if(value.length>40){alert('카테고리는 40자 이내로 입력해 주세요.');continue}if(!categoryTags.some(x=>x.toLowerCase()===value.toLowerCase()))categoryTags.push(value)}$('pCategoryInput').value='';renderCategoryTags()}
 $('pCategoryAdd').onclick=()=>addCategory($('pCategoryInput').value);
 $('pCategoryInput').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===','||e.key==='，'){e.preventDefault();addCategory($('pCategoryInput').value)}});
 $('pCategoryInput').addEventListener('blur',()=>{if($('pCategoryInput').value.trim())addCategory($('pCategoryInput').value)});

const requestedId=new URLSearchParams(location.search).get('id');
const previous=requestedId?db.get(requestedId):null;
if(requestedId&&(!previous||!db.isOwner(previous))){$('productEditArea').hidden=true;$('productEditGate').hidden=false;$('productEditGate').textContent='수정 가능한 제품을 찾을 수 없습니다.';return;}
categoryTags=Array.isArray(previous?.categories)?[...previous.categories]:previous?.category?[previous.category]:[];
renderCategoryTags();
$('pId').value=previous?.id||'';
for(const [key,id] of Object.entries(fields))$(id).value=previous?.[key]||({status:'draft'}[key]||'');
$('pTags').value=(previous?.tags||[]).join(', ');
$('pCatalog').value=previous?.catalogIds?.[0]||'';
$('pSpecs').value=Object.entries(previous?.specs||{}).map(([k,v])=>k+': '+v).join('\n');
$('productEditorTitle').textContent=previous?'제품 수정':'제품 등록';
$('productEditPageTitle').textContent=previous?'제품 수정':'제품 등록';
if(window.IBProductMedia)window.IBProductMedia.load(previous);
 form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;
 const data=db.list(),id=$('pId').value||'p-'+Date.now().toString(36),prev=data.find(p=>p.id===id);
 const next={...(prev||{}),id,owner:'co-0',company:'A 로보틱스',views:prev?.views||0,likes:prev?.likes||0,updated:new Date().toISOString().slice(0,10),price:'견적 문의'};
 for(const [k,field] of Object.entries(fields))next[k]=$(field).value.trim();
 if($('pCategoryInput').value.trim())addCategory($('pCategoryInput').value);
 if(!categoryTags.length){alert('제품 카테고리를 1개 이상 등록해 주세요.');$('pCategoryInput').focus();return}
 next.categories=[...categoryTags];next.category=categoryTags[0];
 next.tags=$('pTags').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,12);
 next.catalogIds=$('pCatalog').value?[$('pCatalog').value]:[];
 next.specs={};$('pSpecs').value.split('\n').forEach(line=>{const i=line.indexOf(':');if(i>0){const k=line.slice(0,i).trim(),v=line.slice(i+1).trim();if(k&&v)next.specs[k]=v}});
 try{db.validate(next);if(window.IBProductMedia){const media=await window.IBProductMedia.persist(prev);Object.assign(next,media)}if(prev)Object.assign(prev,next);else data.push(next);db.save(data);location.href='product-manage.html?saved=1'}catch(err){alert('제품 또는 첨부 파일 저장에 실패했습니다: '+err.message)}
 });render();if(new URLSearchParams(location.search).get('new')==='1')fill(null)
}
})();