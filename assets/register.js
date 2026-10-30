/* IndustryBook Catalog Register — interactive, client-only design prototype */
(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={industries:['장비','전문서비스','기술서비스'],tags:[],contents:[],coverFile:null,coverUrl:null,mode:'first'};
const industries=['장비','전문서비스','기술서비스','로봇·자동화','산업기계','전기·전자','소재·부품','제조·생산','IT·소프트웨어','물류·유통','환경·에너지','교육·연구','건설·설비','의료·헬스케어'];
const permittedTypes=['image','video','pdf','ppt'];let nextId=0;
const uid=()=>++nextId;
const notice=(text,good=false)=>{const n=$('#registerValidation');n.textContent=text;n.classList.toggle('is-valid',good)};
function chip(label,onRemove){const el=document.createElement('span');el.className='ib-reg-chip';const name=document.createElement('span');name.textContent=label;const x=document.createElement('button');x.type='button';x.textContent='×';x.setAttribute('aria-label',label+' 제거');x.addEventListener('click',onRemove);el.append(name,x);return el}
function renderIndustries(){const target=$('#industryChips');target.replaceChildren();state.industries.forEach(v=>target.append(chip(v,()=>{state.industries=state.industries.filter(x=>x!==v);renderIndustries();updateStatus()})));$$('#industryOptions button').forEach(el=>{const selected=state.industries.includes(el.dataset.value);el.classList.toggle('active',selected);el.setAttribute('aria-pressed',String(selected))})}
industries.forEach(v=>{const btn=document.createElement('button');btn.type='button';btn.dataset.value=v;btn.textContent=v;btn.addEventListener('click',()=>{if(state.industries.includes(v))state.industries=state.industries.filter(x=>x!==v);else if(state.industries.length<3)state.industries.push(v);else{notice('인더스트리는 최대 3개까지 선택할 수 있습니다.');return}renderIndustries();updateStatus()});$('#industryOptions').append(btn)});
$('#industryToggle').addEventListener('click',()=>{$('#industryChooser').hidden=!$('#industryChooser').hidden});
const tagInput=$('#tagEntry');
function renderTags(){const target=$('#tagChips');target.replaceChildren();state.tags.forEach(v=>target.append(chip('#'+v,()=>{state.tags=state.tags.filter(x=>x!==v);renderTags()})))}
function addTags(raw){const additions=raw.split(',').map(x=>x.trim().replace(/^#/,'')).filter(Boolean);for(const v of additions){if(state.tags.length>=15){notice('태그는 최대 15개까지 추가할 수 있습니다.');break}if(v.length>25){notice('태그는 25자 이하로 입력해 주세요.');continue}if(!state.tags.includes(v))state.tags.push(v)}renderTags()}
tagInput.addEventListener('input',()=>{if(!tagInput.value.includes(','))return;const parts=tagInput.value.split(',');tagInput.value=parts.pop();addTags(parts.join(','))});
tagInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addTags(tagInput.value);tagInput.value=''}});
tagInput.addEventListener('blur',()=>{if(tagInput.value.trim()){addTags(tagInput.value);tagInput.value=''}});
$('#regTitle').addEventListener('input',()=>{$('#titleCount').textContent=$('#regTitle').value.length+'/30';updateStatus()});
$('#regDescription').addEventListener('input',()=>{$('#descCount').textContent=$('#regDescription').value.length+'/300'});
function coverFromFile(file){if(state.coverUrl)URL.revokeObjectURL(state.coverUrl);state.coverUrl=URL.createObjectURL(file);state.coverFile=file;showCover(state.coverUrl)}
function showCover(url){const view=$('#coverPreview');view.replaceChildren();if(url){const img=new Image();img.src=url;img.alt='대표 이미지 미리보기';view.append(img)}else{const empty=document.createElement('span');empty.className='ib-cover-placeholder';empty.innerHTML='▧<small>대표 이미지</small>';view.append(empty)}}
function firstImage(){return state.contents.find(c=>c.kind==='image')||null}
function refreshCover(){state.mode=document.querySelector('input[name="coverMode"]:checked').value;const upload=state.mode==='upload';$('#coverPick').hidden=!upload;$('#coverMessage').textContent=upload?'대표 이미지로 사용할 파일을 선택하세요.':'콘텐츠의 첫 이미지를 대표 이미지로 사용합니다.';if(upload){if(state.coverFile&&state.coverUrl)showCover(state.coverUrl);else showCover(null)}else{const first=firstImage();showCover(first?first.preview:null)}updateStatus()}
$$('input[name="coverMode"]').forEach(input=>input.addEventListener('change',refreshCover));
$('#coverPick').addEventListener('click',()=>$('#coverFileInput').click());
$('#coverFileInput').addEventListener('change',e=>{const file=e.target.files?.[0];if(file){if(!file.type.startsWith('image/')){notice('이미지 파일만 등록할 수 있습니다.');return}coverFromFile(file);refreshCover()}e.target.value=''});
function kindFromFile(file){const name=file.name.toLowerCase();if(file.type.startsWith('image/'))return 'image';if(file.type.startsWith('video/'))return 'video';if(name.endsWith('.pdf'))return 'pdf';if(name.endsWith('.ppt')||name.endsWith('.pptx'))return 'ppt';return null}
function addFiles(files){let added=0;for(const file of files){const kind=kindFromFile(file);if(!permittedTypes.includes(kind)){notice('지원하지 않는 파일이 포함되어 있습니다: '+file.name);continue}if(state.contents.length>=30){notice('시안에서는 콘텐츠를 30개까지 추가할 수 있습니다.');break}const item={id:uid(),kind,name:file.name,size:file.size,file,preview:kind==='image'?URL.createObjectURL(file):null};state.contents.push(item);added++}renderContents();refreshCover();if(added)notice(added+'개 콘텐츠를 목록에 추가했습니다. 실제 업로드는 수행되지 않습니다.',true)}
function fileFormat(c){return {image:'이미지',video:'비디오',pdf:'PDF',ppt:'PPT'}[c.kind]||c.kind}
function renderContents(){
 const list=$('#contentList');list.replaceChildren();$('#contentCount').textContent=state.contents.length+'개';
 if(!state.contents.length){const empty=document.createElement('div');empty.className='ib-content-empty';empty.textContent='추가된 콘텐츠가 없습니다.';list.append(empty);return}
 state.contents.forEach((c,index)=>{
  const row=document.createElement('div');row.className='ib-content-row';
  const thumb=document.createElement('div');thumb.className='ib-content-thumb';if(c.preview){const img=new Image();img.src=c.preview;img.alt='';thumb.append(img)}else thumb.textContent=({video:'▶',pdf:'▤',ppt:'▥',youtube:'▶'})[c.kind]||'▧';
  const info=document.createElement('div');info.className='ib-content-info';const name=document.createElement('strong');name.textContent=c.name;const meta=document.createElement('span');meta.textContent=fileFormat(c)+(c.size?' · '+(c.size/1024/1024).toFixed(1)+' MB':' · 임베드');info.append(name,meta);
  const actions=document.createElement('div');actions.className='ib-content-actions';
  const up=document.createElement('button');up.type='button';up.textContent='↑';up.title='위로 이동';up.disabled=index===0;up.onclick=()=>move(index,-1);
  const down=document.createElement('button');down.type='button';down.textContent='↓';down.title='아래로 이동';down.disabled=index===state.contents.length-1;down.onclick=()=>move(index,1);
  const del=document.createElement('button');del.type='button';del.textContent='삭제';del.title='콘텐츠 삭제';del.onclick=()=>{const removed=state.contents.splice(index,1)[0];if(removed.preview)URL.revokeObjectURL(removed.preview);renderContents();refreshCover()};
  actions.append(up,down,del);row.append(thumb,info,actions);list.append(row)
 })
}
function move(index,step){const n=index+step;if(n<0||n>=state.contents.length)return;[state.contents[index],state.contents[n]]=[state.contents[n],state.contents[index]];renderContents();refreshCover()}
const selectors={image:'#imageFileInput',video:'#videoFileInput',pdf:'#pdfFileInput',ppt:'#pptFileInput'};
$$('[data-pick]').forEach(b=>b.addEventListener('click',()=>$(selectors[b.dataset.pick]).click()));
for(const id of ['allFileInput','imageFileInput','videoFileInput','pdfFileInput','pptFileInput']){$('#'+id).addEventListener('change',e=>{addFiles(Array.from(e.target.files||[]));e.target.value=''})}
const drop=$('#dropzone');
drop.addEventListener('click',()=>$('#allFileInput').click());
drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#allFileInput').click()}});
['dragenter','dragover'].forEach(type=>drop.addEventListener(type,e=>{e.preventDefault();drop.classList.add('dragging')}));
['dragleave','dragend'].forEach(type=>drop.addEventListener(type,e=>{e.preventDefault();drop.classList.remove('dragging')}));
drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragging');addFiles([...e.dataTransfer.files])});
$('#youtubeAdd').addEventListener('click',()=>{$('#youtubeForm').hidden=false;$('#youtubeUrl').focus()});
$('#youtubeCancel').addEventListener('click',()=>{$('#youtubeForm').hidden=true;$('#youtubeUrl').value=''});
function getYoutubeId(raw){try{const u=new URL(raw);if(['www.youtube.com','youtube.com','m.youtube.com','music.youtube.com'].includes(u.hostname)){if(u.pathname==='/watch')return u.searchParams.get('v');if(u.pathname.startsWith('/shorts/')||u.pathname.startsWith('/embed/'))return u.pathname.split('/')[2]}if(['youtu.be','www.youtu.be'].includes(u.hostname))return u.pathname.slice(1).split('/')[0]}catch{}return null}
$('#youtubeConfirm').addEventListener('click',()=>{const url=$('#youtubeUrl').value.trim(),id=getYoutubeId(url);if(!id||!/^[a-zA-Z0-9_-]{11}$/.test(id)){notice('올바른 YouTube 영상 주소를 입력해 주세요.');return}if(state.contents.length>=30){notice('콘텐츠는 최대 30개까지 추가할 수 있습니다.');return}state.contents.push({id:uid(),kind:'youtube',name:'YouTube · '+id,size:0,url});$('#youtubeForm').hidden=true;$('#youtubeUrl').value='';renderContents();updateStatus()});
function status(){const missing=[];if(!$('#regTitle').value.trim())missing.push('제목');if(state.industries.length===0)missing.push('인더스트리');if(!state.contents.length)missing.push('콘텐츠');if(state.mode==='upload'&&!state.coverFile)missing.push('대표 이미지');if(state.mode==='first'&&!firstImage())missing.push('첫 이미지');return missing}
function updateStatus(){const missing=status();if(missing.length)notice('아직 채우지 않은 항목: '+missing.join(', '));else notice('필수 항목이 모두 준비되었습니다. (실제 업로드는 연결되지 않음)',true)}
$('#catalogForm').addEventListener('submit',e=>{e.preventDefault();if(tagInput.value.trim()){addTags(tagInput.value);tagInput.value=''}const missing=status();if(missing.length){updateStatus();$('#registerValidation').scrollIntoView({behavior:'smooth',block:'center'});return}notice('등록 전 화면 검사가 완료되었습니다. 실제 데이터 전송은 수행되지 않았습니다.',true);if(typeof notify==='function')notify('등록 화면 데모 검사가 완료되었습니다.')});
$('#resetForm').addEventListener('click',()=>{if(!window.confirm('입력 중인 내용을 초기화할까요?'))return;state.contents.forEach(c=>{if(c.preview)URL.revokeObjectURL(c.preview)});if(state.coverUrl)URL.revokeObjectURL(state.coverUrl);state.contents=[];state.coverFile=null;state.coverUrl=null;state.tags=[];state.industries=[];$('#catalogForm').reset();$('#regTitle').value='';$('#regDescription').value='';tagInput.value='';$('#titleCount').textContent='0/30';$('#descCount').textContent='0/300';renderTags();renderIndustries();renderContents();refreshCover();updateStatus()});
renderIndustries();renderTags();renderContents();refreshCover();updateStatus();
})();
