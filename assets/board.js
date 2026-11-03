/* IndustryBook community prototype.
 * All content is illustrative. Browser-only posts, comments, likes.
 * Real service requires authenticated server ownership, moderation and persistence.
 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const page=document.querySelector('[data-board-page]');if(!page)return;
const signed=localStorage.getItem('ib-demo-logged-in')==='yes';
const user=localStorage.getItem('ib-demo-email')||'member@industrybook.demo';
const STORE='ib-community-posts-v1',LIKES='ib-community-likes-v1',COMMENTS='ib-community-comments-v1';
const labels={all:'전체 게시글',news:'산업 소식',tech:'기술·정보',qna:'질문·답변',partner:'협업·파트너',event:'행사·세미나',free:'자유게시판'};
const seed=[
{id:'sample-01',category:'partner',title:'스마트팩토리 자동화 프로젝트 협력 파트너를 찾습니다',body:'국내 제조 현장의 자동화 프로젝트를 함께 검토할 기술 파트너를 찾고 있습니다.\n\n관심 있는 기업은 관련 기술 역량과 협업 범위를 메시지로 공유해 주세요.\n\n※ UI 시연용 예시 게시글입니다.',author:'A 로보틱스 · 샘플',owner:'sample',date:'2026-11-02T09:20:00+09:00',views:142,likes:12,tags:['로봇','자동화','제조'],pinned:true},
{id:'sample-02',category:'qna',title:'협동로봇 도입 시 어떤 기술 사양을 우선 확인하시나요?',body:'협동로봇을 처음 도입할 때 가반하중, 작업반경, 안전성 외에 검토할 항목이 궁금합니다.\n\n각 업계의 경험을 공유해 주세요.\n\n※ 시연용 예시입니다.',author:'B 테크 · 샘플',owner:'sample',date:'2026-11-01T16:40:00+09:00',views:208,likes:19,tags:['협동로봇','기술질문'],pinned:false},
{id:'sample-03',category:'news',title:'산업 전시회와 기업 교류 행사 소식을 공유해 주세요',body:'산업별 주요 전시회, 상담회, 기업 교류 일정 등을 커뮤니티에서 공유하는 예시 게시글입니다.\n\n※ 실제 행사 공고가 아닙니다.',author:'IndustryBook 운영팀 · 샘플',owner:'sample',date:'2026-10-31T11:10:00+09:00',views:128,likes:7,tags:['산업동향','전시회'],pinned:false},
{id:'sample-04',category:'tech',title:'스마트 센서 데이터를 활용한 설비 상태 모니터링',body:'설비 상태 모니터링에 활용할 수 있는 센서 데이터와 연동 방식에 대한 기술 토론 예시입니다.\n\n※ 시연용 예시입니다.',author:'C 일렉트로닉스 · 샘플',owner:'sample',date:'2026-10-30T14:25:00+09:00',views:178,likes:15,tags:['센서','IoT','데이터'],pinned:false},
{id:'sample-05',category:'event',title:'산업 기술 웨비나 주제를 함께 제안해 주세요',body:'회원 기업이 관심 있는 산업 기술 웨비나 주제를 제안받기 위한 시연용 글입니다.\n\n※ 확정된 행사 일정이 아닙니다.',author:'산업 커뮤니티 · 샘플',owner:'sample',date:'2026-10-29T10:30:00+09:00',views:77,likes:4,tags:['웨비나','기술'],pinned:false},
{id:'sample-06',category:'free',title:'IndustryBook 커뮤니티에 오신 것을 환영합니다',body:'제품·카탈로그 등록을 넘어 기업과 실무자가 정보를 나누는 산업 커뮤니티를 준비하고 있습니다.\n\n※ UI 시연용 환영 글입니다.',author:'IndustryBook 운영팀 · 샘플',owner:'sample',date:'2026-10-28T08:00:00+09:00',views:260,likes:21,tags:['커뮤니티','환영'],pinned:false},
{id:'sample-07',category:'partner',title:'산업용 센서 연동 경험이 있는 파트너 기업을 찾습니다',body:'설비 제어 시스템에 산업용 센서를 연동한 경험이 있는 기업과 협업 경험을 나누고 싶습니다.\n\n※ 실제 모집 공고가 아닌 시연용입니다.',author:'F 솔루션 · 샘플',owner:'sample',date:'2026-10-26T13:00:00+09:00',views:95,likes:6,tags:['센서','파트너'],pinned:false}
];
function json(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value===null?fallback:value}catch{return fallback}}
function posts(){const x=json(STORE,[]);return [...seed,...(Array.isArray(x)?x:[])].filter(p=>p&&!p.deleted)}
function comments(){const o=json(COMMENTS,{});return o&&typeof o==='object'&&!Array.isArray(o)?o:{}}
function favorites(){const a=json(LIKES,[]);return Array.isArray(a)?a:[]}
const save=(key,value)=>{localStorage.setItem(key,JSON.stringify(value))};
const node=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=value;return x};
const format=iso=>{const d=new Date(iso);return isNaN(d)?'':d.toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'})};
const countComments=id=>(comments()[id]||[]).length;
const url=id=>'board-detail.html?id='+encodeURIComponent(id);
function canManage(p){return signed&&p.owner===user&&p.id.startsWith('post-')}
function categoryChip(p){return node('span','ib-board-chip ib-board-chip-'+p.category,labels[p.category]||'게시글')}
function getPost(id){return posts().find(p=>p.id===id)}
function renderList(){
 const nav=$('ibBoardCategoryNav'),list=$('ibBoardList');if(!nav||!list)return;
 const query=new URLSearchParams(location.search);
 let selected=labels[query.get('category')]?query.get('category'):'all';
 let term=query.get('q')||'',order=query.get('sort')||'recent',size=6;
 const search=$('ibBoardQuery'),sort=$('ibBoardSort');
 search.value=term;sort.value=['recent','popular','comments'].includes(order)?order:'recent';
 function drawNav(){
  nav.replaceChildren();
  Object.keys(labels).forEach(key=>{const a=node('a','ib-board-side-link'+(selected===key?' selected':''),labels[key]);
   a.href='board.html'+(key==='all'?'':'?category='+encodeURIComponent(key));a.setAttribute('aria-current',selected===key?'page':'false');nav.append(a)});
 }
 function draw(){
  const all=posts(),needle=term.trim().toLocaleLowerCase('ko');
  let shown=all.filter(p=>(selected==='all'||p.category===selected)&&(!needle||[p.title,p.body,p.author,...(p.tags||[])].join(' ').toLocaleLowerCase('ko').includes(needle)));
  shown.sort((a,b)=>{const pin=Number(Boolean(b.pinned))-Number(Boolean(a.pinned));if(pin)return pin;
    if(order==='popular')return (b.views+b.likes*5)-(a.views+a.likes*5);
    if(order==='comments')return countComments(b.id)-countComments(a.id);
    return new Date(b.date)-new Date(a.date);
  });
  $('ibBoardListTitle').textContent=labels[selected];
  $('ibBoardTotal').textContent=all.length;
  $('ibBoardQuestions').textContent=all.filter(x=>x.category==='qna').length;
  $('ibBoardPartners').textContent=all.filter(x=>x.category==='partner').length;
  $('ibBoardResultCount').textContent='총 '+shown.length+'건';
  list.replaceChildren();
  shown.slice(0,size).forEach(p=>{
   const row=node('article','ib-board-item');
   const top=node('div','ib-board-item-top');if(p.pinned)top.append(node('span','ib-board-pinned','추천'));
   top.append(categoryChip(p));const date=node('time','ib-board-date',format(p.date));top.append(date);
   const title=node('a','ib-board-item-title',p.title);title.href=url(p.id);
   const excerpt=node('p','ib-board-item-excerpt',p.body.replace(/\s+/g,' ').slice(0,145));
   const tags=node('div','ib-board-item-tags');(p.tags||[]).slice(0,5).forEach(t=>tags.append(node('span','', '#'+t)));
   const foot=node('div','ib-board-item-foot');foot.append(node('span','',p.author),node('span','','조회 '+p.views),node('span','','♡ '+p.likes),node('span','','댓글 '+countComments(p.id)));
   row.append(top,title,excerpt,tags,foot);list.append(row);
  });
  if(!shown.length)list.append(node('div','ib-board-empty','검색 결과가 없습니다. 다른 검색어 또는 분류를 선택해 주세요.'));
  $('ibBoardMore').hidden=shown.length<=size;
 }
 drawNav();draw();
 let frame;
 function update(){const params=new URLSearchParams();if(selected!=='all')params.set('category',selected);if(term)params.set('q',term);if(order!=='recent')params.set('sort',order);history.replaceState(null,'','board.html'+(params.size?'?'+params.toString():''));size=6;draw();}
 search.addEventListener('input',()=>{term=search.value;update()});
 sort.addEventListener('change',()=>{order=sort.value;update()});
 $('ibBoardMore').addEventListener('click',()=>{size+=6;draw()});
}
function renderDetail(){
 const root=$('ibBoardDetail');if(!root)return;
 const p=getPost(new URLSearchParams(location.search).get('id')||'');
 if(!p){root.replaceChildren(node('div','ib-board-empty','게시글을 찾을 수 없습니다.'));return}
 document.title=p.title+' | IndustryBook 커뮤니티';
 root.replaceChildren();
 const article=node('article','ib-board-detail-card');
 const meta=node('div','ib-board-detail-category');meta.append(categoryChip(p));if(p.pinned)meta.append(node('span','ib-board-pinned','추천'));
 const h=node('h1','',p.title),author=node('div','ib-board-detail-meta',p.author+'   ·   '+format(p.date)+'   ·   조회 '+p.views);
 const content=node('div','ib-board-detail-body',p.body);
 const tags=node('div','ib-board-item-tags');(p.tags||[]).forEach(t=>tags.append(node('span','', '#'+t)));
 const acts=node('div','ib-board-detail-actions');
 const like=node('button','button secondary','♡ 좋아요 '+p.likes);like.type='button';
 const isLiked=()=>favorites().includes(p.id);const labelLike=()=>{like.textContent=(isLiked()?'♥ 좋아요 ':'♡ 좋아요 ')+p.likes;like.setAttribute('aria-pressed',String(isLiked()))};
 labelLike();like.onclick=()=>{if(!signed){location.href='login.html?next='+encodeURIComponent(url(p.id));return}
  const fav=favorites();const index=fav.indexOf(p.id);if(index>=0){fav.splice(index,1);p.likes=Math.max(0,p.likes-1)}else{fav.push(p.id);p.likes++}save(LIKES,fav);
  if(!p.id.startsWith('sample')){const all=json(STORE,[]);const stored=all.find(x=>x.id===p.id);if(stored){stored.likes=p.likes;save(STORE,all)}}labelLike()};
 acts.append(like);
 if(canManage(p)){
  const edit=node('a','button secondary','수정');edit.href='board-write.html?id='+encodeURIComponent(p.id);
  const del=node('button','button secondary','삭제');del.type='button';del.onclick=()=>{if(!confirm('게시글을 삭제할까요?'))return;const saved=json(STORE,[]).filter(x=>x.id!==p.id);save(STORE,saved);location.href='board.html'};
  acts.append(edit,del);
 }
 article.append(meta,h,author,content,tags,acts);root.append(article);
 const reply=node('section','ib-board-comments');
 const heading=node('h2','', '댓글 '+countComments(p.id));reply.append(heading);
 const commentList=node('div','ib-board-comment-list');
 function drawComments(){commentList.replaceChildren();const entries=comments()[p.id]||[];
  entries.forEach(x=>{const r=node('div','ib-board-comment');r.append(node('strong','',x.author),node('time','',format(x.date)),node('p','',x.text));commentList.append(r)});
  if(!entries.length)commentList.append(node('p','ib-board-empty-small','아직 댓글이 없습니다. 첫 의견을 남겨보세요.'));
  heading.textContent='댓글 '+entries.length;
 }drawComments();reply.append(commentList);
 if(signed){
  const form=node('form','ib-board-comment-form');const textarea=node('textarea','');textarea.maxLength=1000;textarea.required=true;textarea.rows=3;textarea.placeholder='공개 댓글을 입력하세요 (최대 1000자)';
  const submit=node('button','button primary','댓글 등록');submit.type='submit';
  form.append(textarea,submit);form.addEventListener('submit',e=>{e.preventDefault();const value=textarea.value.trim();if(!value)return;const map=comments();if(!Array.isArray(map[p.id]))map[p.id]=[];map[p.id].push({author:user,date:new Date().toISOString(),text:value});try{save(COMMENTS,map);textarea.value='';drawComments()}catch(err){alert('댓글을 저장하지 못했습니다.')}});
  reply.append(form);
 }else{const a=node('a','ib-board-login-prompt','댓글을 작성하려면 로그인하세요 →');a.href='login.html?next='+encodeURIComponent(url(p.id));reply.append(a)}
 root.append(reply);
}
function renderWrite(){
 const area=$('ibBoardWriteArea'),gate=$('ibBoardWriteGate');if(!area||!gate)return;
 area.hidden=!signed;gate.hidden=signed;if(!signed)return;
 const form=$('ibBoardWriteForm'),id=new URLSearchParams(location.search).get('id'),old=id?getPost(id):null;
 if(id&&!old){area.replaceChildren(node('p','ib-board-empty','게시글을 찾을 수 없습니다.'));return}
 if(id&&!canManage(old)){area.replaceChildren(node('p','ib-board-empty','게시글을 수정할 권한이 없습니다.'));return}
 if(old){
  $('ibBoardWriteHeading').textContent='게시글 수정';$('ibBoardWriteBreadcrumb').textContent='게시글 수정';
  $('ibBoardPostCategory').value=old.category;$('ibBoardPostTitle').value=old.title;$('ibBoardPostContent').value=old.body;$('ibBoardPostTags').value=(old.tags||[]).join(', ');
 }
 form.addEventListener('submit',e=>{
  e.preventDefault();if(!form.reportValidity())return;
  const category=$('ibBoardPostCategory').value,title=$('ibBoardPostTitle').value.trim(),body=$('ibBoardPostContent').value.trim();
  const tags=[...new Set($('ibBoardPostTags').value.split(',').map(x=>x.trim()).filter(Boolean))].slice(0,5);
  if(!category||!title||!body){alert('카테고리, 제목, 내용을 입력해 주세요.');return}
  const saved=json(STORE,[]);const update=old?saved.find(x=>x.id===old.id):null;
  const entry={id:old?.id||'post-'+Date.now().toString(36),category,title,body,tags,author:user,owner:user,date:old?.date||new Date().toISOString(),views:old?.views||0,likes:old?.likes||0,pinned:false};
  if(update)Object.assign(update,entry);else saved.push(entry);
  try{save(STORE,saved);location.href=url(entry.id)}catch(err){alert('게시글을 저장할 수 없습니다: '+err.message)}
 });
}
if(page.dataset.boardPage==='list')renderList();
if(page.dataset.boardPage==='detail')renderDetail();
if(page.dataset.boardPage==='write')renderWrite();
})();