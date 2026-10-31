/* IndustryBook messenger mock — no server delivery or real-time chat. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const key='ib-demo-message-threads-v1';
const directory={kar:{name:'한국AI로봇산업협회',initial:'KAR',link:'company-profile.html'},'co-0':{name:'A 로보틱스',initial:'AR',link:'company-profile.html'},theklab:{name:'더클랩',initial:'TK',link:'company-profile.html'}};
let threads={};
try{const loaded=JSON.parse(localStorage.getItem(key)||'{}');if(loaded&&typeof loaded==='object'&&!Array.isArray(loaded))threads=loaded;}catch(e){}
const param=new URLSearchParams(location.search);
let active=param.get('to')||'';
const initialText=param.get('draft')||'';
function info(id){return directory[id]||{name:'기업 '+id.slice(0,12),initial:'IB',link:'companies.html'}}
function ensure(id){if(!threads[id])threads[id]=[];if(!directory[id]&&id!=='')directory[id]=info(id);}
if(!Object.keys(threads).length){threads={theklab:[{text:'카탈로그에 대해 문의드립니다. (샘플 대화)',at:'2026-09-25T09:32:00+09:00',mine:true}], 'co-0':[]};}
if(active)ensure(active);else active=Object.keys(threads)[0]||'';
function persist(){try{localStorage.setItem(key,JSON.stringify(threads))}catch(e){alert('브라우저 저장 공간이 부족합니다.');}}
const timeOf=iso=>{const d=new Date(iso);return isNaN(d)?'':d.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})};
function make(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el}
function list(){
 const q=$('ibChatSearch').value.trim().toLowerCase(),target=$('ibChatList');target.replaceChildren();
 const entries=Object.keys(threads).sort((a,b)=>{const last=id=>threads[id].at(-1)?.at||'';return last(b).localeCompare(last(a))});
 $('ibChatCount').textContent=entries.length;
 for(const id of entries){
  const details=info(id),last=threads[id].at(-1);
  if(q&&!details.name.toLowerCase().includes(q)&&!threads[id].some(x=>x.text.toLowerCase().includes(q)))continue;
  const item=make('button','ib-chat-list-item'+(active===id?' selected':''));item.type='button';
  const avatar=make('span','ib-chat-avatar',details.initial),body=make('span','ib-chat-list-copy');
  body.append(make('strong','',details.name),make('small','',last?last.text:'대화를 시작해 보세요.'));
  const clock=make('time','',last?timeOf(last.at):'');
  item.append(avatar,body,clock);
  item.addEventListener('click',()=>select(id));target.append(item);
 }
 if(!target.children.length)target.append(make('p','ib-chat-empty-list','검색 결과가 없습니다.'));
}
function room(){
 const details=info(active),target=$('ibChatMessages');target.replaceChildren();
 $('ibChatCompany').textContent=details.name;$('ibChatAvatar').textContent=details.initial;$('ibChatCompanyLink').href=details.link;
 if(!threads[active]?.length){
  const empty=make('div','ib-chat-empty-room');
  empty.append(make('strong','','아직 대화 내역이 없습니다.'),make('p','','아래 입력창을 통해 문의 메시지를 작성할 수 있습니다.'));
  target.append(empty);
 }else{
  target.append(make('div','ib-chat-room-guide','이전 대화 기록 · 브라우저 데모'));
  for(const m of threads[active]){
   const row=make('div','ib-chat-bubble-row'+(m.mine?' mine':''));
   const bubble=make('div','ib-chat-bubble',m.text),time=make('small','ib-chat-time',timeOf(m.at));
   row.append(bubble,time);target.append(row);
  }
 }
 target.scrollTop=target.scrollHeight;
}
function select(id){active=id;ensure(id);history.replaceState(null,'','messages.html?to='+encodeURIComponent(id));list();room();document.querySelector('.ib-messenger-layout').classList.add('room-active');}
$('ibChatBack').onclick=()=>document.querySelector('.ib-messenger-layout').classList.remove('room-active');
$('ibChatMore').onclick=()=>alert('이 화면은 시연용입니다. 실제 차단·신고·삭제 기능은 서버 연동 후 제공됩니다.');
$('ibChatSearch').addEventListener('input',list);
$('ibChatComposer').addEventListener('submit',e=>{e.preventDefault();const input=$('ibChatInput'),text=input.value.trim();if(!text||!active)return;ensure(active);threads[active].push({text:text.slice(0,1000),at:new Date().toISOString(),mine:true});persist();input.value='';list();room();});
$('ibChatInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('ibChatComposer').requestSubmit();}});
if(active)select(active);
if(initialText){$('ibChatInput').value=initialText.slice(0,1000);$('ibChatInput').focus();}
list();
})();