/* Company catalog management — client-only prototype. No uploaded file persistence. */
(function(){
'use strict';
const $=id=>document.getElementById(id),key='ib-demo-company-catalogs-v1';
const permitted=localStorage.getItem('ib-demo-logged-in')==='yes'&&(localStorage.getItem('ib-demo-role')||'enterprise')==='enterprise';
$('ibCatalogManagerGate').hidden=permitted;$('ibCatalogManagerContent').hidden=!permitted;
if(!permitted)return;
function read(){try{const saved=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(saved)?saved:[]}catch(e){return []}}
function save(items){try{localStorage.setItem(key,JSON.stringify(items));return true}catch(err){alert('저장하지 못했습니다. 브라우저 저장 용량을 확인해 주세요.');return false}}
const rows=$('ibCatalogManagerRows'),search=$('ibCatalogManagerSearch'),filter=$('ibCatalogManagerFilter'),editor=$('ibCatalogEditor'),form=$('ibCatalogEditForm');
const txt=(parent,tag,value)=>{const node=document.createElement(tag);node.textContent=value;parent.append(node);return node};
function close(){if(typeof editor.close==='function')editor.close();else editor.removeAttribute('open')}
function open(item){$('ibCatalogEditId').value=item.id;$('ibCatalogEditTitle').value=item.title||'';$('ibCatalogEditDescription').value=item.description||'';$('ibCatalogEditIndustries').value=(item.industries||[]).join(', ');$('ibCatalogEditTags').value=(item.tags||[]).join(', ');$('ibCatalogEditVisibility').value=item.visibility||'public';editor.showModal()}
function render(){
 const all=read(),q=search.value.trim().toLowerCase();
 $('ibCatalogCountAll').textContent=all.length;
 $('ibCatalogCountPublic').textContent=all.filter(x=>x.visibility==='public').length;
 $('ibCatalogCountPrivate').textContent=all.filter(x=>x.visibility==='private').length;
 rows.replaceChildren();
 const matched=all.filter(x=>(filter.value==='all'||x.visibility===filter.value)&&(!q||[x.title,x.description,...(x.industries||[]),...(x.tags||[])].join(' ').toLowerCase().includes(q))).sort((a,b)=>(b.updated||'').localeCompare(a.updated||''));
 for(const item of matched){
  const tr=document.createElement('tr');
  const name=txt(tr,'td',item.title||'제목 없음');name.className='ib-catalog-manage-title';
  txt(tr,'td',(item.industries||[]).join(' · ')||'미지정');
  const status=txt(tr,'td',item.visibility==='private'?'비공개':'공개');status.className=item.visibility==='private'?'ib-catalog-private':'ib-catalog-public';
  txt(tr,'td',item.updated?.slice(0,10)||'');
  const tools=document.createElement('td');const edit=txt(tools,'button','수정');edit.type='button';edit.className='button small secondary';edit.onclick=()=>open(item);
  const toggle=txt(tools,'button',item.visibility==='private'?'공개로 전환':'비공개 전환');toggle.type='button';toggle.className='button small secondary';toggle.onclick=()=>{const latest=read(),target=latest.find(x=>x.id===item.id);if(!target)return;target.visibility=target.visibility==='private'?'public':'private';target.updated=new Date().toISOString();if(save(latest))render()};
  const del=txt(tools,'button','삭제');del.type='button';del.className='ib-product-delete';del.onclick=()=>{if(confirm('해당 카탈로그 정보를 삭제할까요? 이 브라우저의 시연용 목록에서만 삭제됩니다.')){if(save(read().filter(x=>x.id!==item.id)))render()}};
  tr.append(tools);rows.append(tr)
 }
 if(!matched.length){const tr=document.createElement('tr'),td=txt(tr,'td',all.length?'검색된 카탈로그가 없습니다.':'등록한 카탈로그가 없습니다. 상단에서 카탈로그를 등록해 주세요.');td.colSpan=5;rows.append(tr)}
}
search.addEventListener('input',render);filter.addEventListener('change',render);
$('ibCatalogEditorClose').onclick=close;$('ibCatalogEditCancel').onclick=close;
form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;
 const items=read(),item=items.find(x=>x.id===$('ibCatalogEditId').value);if(!item)return;
 const parse=(id,max)=>[...new Set($(id).value.split(',').map(v=>v.trim()).filter(Boolean))].slice(0,max);
 item.title=$('ibCatalogEditTitle').value.trim();if(!item.title){alert('제목을 입력해 주세요.');return}
 item.description=$('ibCatalogEditDescription').value.trim();
 item.industries=parse('ibCatalogEditIndustries',3);item.tags=parse('ibCatalogEditTags',15);
 item.visibility=$('ibCatalogEditVisibility').value;item.updated=new Date().toISOString();
 if(save(items)){close();render()}
});
render();
})();