/* Product media for GitHub Pages demonstration.
 * Files stored in this browser's IndexedDB, not uploaded to a server.
 * Metadata stored alongside product record in localStorage.
 */
window.IBProductMedia=(function(){
'use strict';
const DB='industrybook-product-media-v1',STORE='files',MAX_PHOTOS=6,MAX_DOCS=3;
const $=id=>document.getElementById(id);
const imageTypes=new Set(['image/jpeg','image/png','image/webp']);
const extensionOk=file=>/\.(pdf|ppt|pptx)$/i.test(file.name);
let images=[],documents=[],coverKey='',urls=[],activeId='';
function dbOpen(){
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB,1);
  request.onupgradeneeded=()=>request.result.createObjectStore(STORE);
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 })
}
async function putAll(items){
 if(!items.length)return;
 const db=await dbOpen();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,'readwrite'),os=tx.objectStore(STORE);
  for(const {key,file} of items)os.put(file,key);
  tx.oncomplete=()=>{db.close();resolve()};
  tx.onerror=()=>{db.close();reject(tx.error)};
 })
}
async function get(key){
 const db=await dbOpen();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,'readonly'),req=tx.objectStore(STORE).get(key);
  req.onsuccess=()=>resolve(req.result||null);
  req.onerror=()=>reject(req.error);
  tx.oncomplete=()=>db.close();
 })
}
async function removeKeys(keys){
 if(!keys.length)return;
 const db=await dbOpen();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,'readwrite');
  keys.forEach(key=>tx.objectStore(STORE).delete(key));
  tx.oncomplete=()=>{db.close();resolve()};
  tx.onerror=()=>{db.close();reject(tx.error)};
 })
}
const newKey=()=>crypto.randomUUID?crypto.randomUUID():'media-'+Date.now()+'-'+Math.random().toString(36).slice(2);
function status(message,error=false){const el=$('pMediaStatus');if(el){el.textContent=message;el.classList.toggle('error',error)}}
const revoke=()=>{urls.forEach(url=>URL.revokeObjectURL(url));urls=[]};
function preview(item){if(item.file)return URL.createObjectURL(item.file);return null}
function renderPhotos(){
 const target=$('pPhotoPreviews');if(!target)return;
 target.replaceChildren();revoke();
 $('pPhotoCount').textContent=images.length+' / '+MAX_PHOTOS;
 images.forEach((item,i)=>{
  const card=document.createElement('div');card.className='ib-product-photo-item';
  const view=document.createElement('div');view.className='ib-product-photo-image';
  const img=new Image();img.alt='제품 이미지 '+(i+1);img.loading='lazy';
  if(item.file){const url=preview(item);urls.push(url);img.src=url}else if(item.blob){const url=URL.createObjectURL(item.blob);urls.push(url);img.src=url}
  view.append(img);
  const star=document.createElement('button');star.type='button';star.className='ib-product-photo-star'+(coverKey===item.key?' selected':'');star.textContent=coverKey===item.key?'★ 대표':'☆ 대표 지정';
  star.setAttribute('aria-label',item.name+' 대표 이미지 지정');star.onclick=()=>{coverKey=item.key;renderPhotos()};
  const row=document.createElement('div');row.className='ib-product-photo-actions';
  const up=document.createElement('button');up.type='button';up.textContent='↑';up.title='앞으로';up.disabled=i===0;up.onclick=()=>{[images[i-1],images[i]]=[images[i],images[i-1]];renderPhotos()};
  const down=document.createElement('button');down.type='button';down.textContent='↓';down.title='뒤로';down.disabled=i===images.length-1;down.onclick=()=>{[images[i+1],images[i]]=[images[i],images[i+1]];renderPhotos()};
  const del=document.createElement('button');del.type='button';del.textContent='삭제';del.title='사진 제거';del.onclick=()=>{images.splice(i,1);if(coverKey===item.key)coverKey=images[0]?.key||'';renderPhotos()};
  row.append(up,down,del);card.append(view,star,row);target.append(card);
 });
}
function renderDocs(){
 const target=$('pDocumentList');if(!target)return;
 target.replaceChildren();$('pDocumentCount').textContent=documents.length+' / '+MAX_DOCS;
 documents.forEach((item,i)=>{
  const row=document.createElement('div');row.className='ib-product-document-row';
  const tag=document.createElement('span');tag.className='ib-product-document-icon';tag.textContent=item.name.toLowerCase().endsWith('.pdf')?'PDF':'PPT';
  const info=document.createElement('span');info.className='ib-product-document-name';info.textContent=item.name+' · '+(item.size/1024/1024).toFixed(1)+'MB';
  const del=document.createElement('button');del.type='button';del.textContent='삭제';del.onclick=()=>{documents.splice(i,1);renderDocs()};
  row.append(tag,info,del);target.append(row)
 });
}
async function addFiles(files,type){
 const target=type==='image'?images:documents,limit=type==='image'?MAX_PHOTOS:MAX_DOCS,maxBytes=(type==='image'?8:25)*1024*1024;
 let added=0;
 for(const file of files){
  const valid=type==='image'?imageTypes.has(file.type):extensionOk(file);
  if(!valid){status('지원하지 않는 파일입니다: '+file.name,true);continue}
  if(file.size>maxBytes){status(file.name+'의 크기 제한을 초과했습니다.',true);continue}
  if(target.length>=limit){status('최대 '+limit+'개까지 첨부할 수 있습니다.',true);break}
  const key=newKey();
  target.push({key,name:file.name,size:file.size,mime:file.type||'',file});
  if(type==='image'&&!coverKey)coverKey=key;
  added++;
 }
 renderPhotos();renderDocs();
 if(added)status(added+'개 파일이 추가되었습니다. 제품 저장 시 이 브라우저에 보관됩니다.');
}
function bindDrop(id,inputId,type){
 const zone=$(id),input=$(inputId);if(!zone||!input)return;
 zone.addEventListener('click',()=>input.click());
 zone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click()}});
 input.addEventListener('change',e=>{addFiles(Array.from(e.target.files||[]),type);e.target.value=''});
 ['dragenter','dragover'].forEach(event=>zone.addEventListener(event,e=>{e.preventDefault();zone.classList.add('dragging')}));
 ['dragleave','dragend'].forEach(event=>zone.addEventListener(event,e=>{e.preventDefault();zone.classList.remove('dragging')}));
 zone.addEventListener('drop',e=>{e.preventDefault();e.stopPropagation();zone.classList.remove('dragging');addFiles(Array.from(e.dataTransfer.files),type)})
}
function init(){bindDrop('pPhotoDrop','pPhotoFiles','image');bindDrop('pDocumentDrop','pDocumentFiles','document');renderPhotos();renderDocs()}
async function load(product){
 activeId=product?.id||'';images=[];documents=[];coverKey=product?.coverMediaKey||'';
 const hydrate=async arr=>{
  const out=[];
  for(const item of (arr||[])){
   const blob=await get(item.key).catch(()=>null);
   if(blob)out.push({...item,blob});
  }
  return out;
 };
 try{images=await hydrate(product?.mediaImages);documents=await hydrate(product?.mediaDocuments)}
 catch(e){status('이 브라우저에서 이전에 저장한 미디어를 불러올 수 없습니다.',true)}
 if(!images.some(x=>x.key===coverKey))coverKey=images[0]?.key||'';
 renderPhotos();renderDocs();status('');
}
async function persist(product){
 const all=[...images,...documents];
 const incoming=all.filter(x=>x.file).map(x=>({key:x.key,file:x.file}));
 await putAll(incoming);
 const old=[...(product?.mediaImages||[]),...(product?.mediaDocuments||[])].map(x=>x.key);
 const keep=new Set(all.map(x=>x.key));await removeKeys(old.filter(key=>!keep.has(key)));
 const shape=list=>list.map(({key,name,size,mime})=>({key,name,size,mime}));
 return {mediaImages:shape(images),mediaDocuments:shape(documents),coverMediaKey:coverKey}
}
async function cleanup(product){await removeKeys([...(product?.mediaImages||[]),...(product?.mediaDocuments||[])].map(x=>x.key))}
async function renderDetail(product,visual,related){
 if(!product?.mediaImages?.length&&!product?.mediaDocuments?.length)return;
 const photos=product.mediaImages||[],files=product.mediaDocuments||[];
 if(photos.length){
  visual.replaceChildren();visual.classList.add('with-photos');
  const main=new Image();main.className='ib-product-gallery-main';main.alt=product.name+' 대표 이미지';visual.append(main);
  const strip=document.createElement('div');strip.className='ib-product-gallery-strip';visual.append(strip);
  const hydrated=[];
  for(const photo of photos){const blob=await get(photo.key).catch(()=>null);if(blob){const url=URL.createObjectURL(blob);hydrated.push({photo,url})}}
  function show(url){main.src=url}
  const initial=hydrated.find(x=>x.photo.key===product.coverMediaKey)||hydrated[0];if(initial)show(initial.url);
  hydrated.forEach(({photo,url})=>{const b=document.createElement('button');b.type='button';b.title=photo.name;const image=new Image();image.src=url;image.alt=photo.name;b.append(image);b.onclick=()=>show(url);strip.append(b)});
  window.addEventListener('pagehide',()=>hydrated.forEach(x=>URL.revokeObjectURL(x.url)),{once:true});
 }
 if(files.length){
  const h=document.createElement('h3');h.textContent='제품 카탈로그 파일';related.append(h);
  for(const doc of files){
   const link=document.createElement('button');link.type='button';link.className='ib-product-document-link';link.textContent='▤ '+doc.name+' 다운로드';
   link.onclick=async()=>{const blob=await get(doc.key).catch(()=>null);if(!blob){alert('이 브라우저에 첨부 파일이 없습니다.');return}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=doc.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};
   related.append(link)
  }
 }
}
return {init,load,persist,cleanup,renderDetail};
})();
