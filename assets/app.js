const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];const notify=(v)=>{const d=document.createElement('div');d.className='toast';d.textContent=v;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)};let likes=new Set(JSON.parse(localStorage.getItem('ib-likes')||'[]'));$$('[data-like]').forEach(b=>{let id=b.dataset.like;b.textContent=likes.has(id)?'♥ 저장됨':'♡ 관심';b.onclick=()=>{likes.has(id)?likes.delete(id):likes.add(id);localStorage.setItem('ib-likes',JSON.stringify([...likes]));b.textContent=likes.has(id)?'♥ 저장됨':'♡ 관심'}});let subs=new Set(JSON.parse(localStorage.getItem('ib-subs')||'[]'));$$('[data-subscribe]').forEach(b=>{let id=b.dataset.subscribe;b.textContent=subs.has(id)?'✓ 구독 중':'+ 기업 구독';b.onclick=()=>{subs.has(id)?subs.delete(id):subs.add(id);localStorage.setItem('ib-subs',JSON.stringify([...subs]));b.textContent=subs.has(id)?'✓ 구독 중':'+ 기업 구독';notify('구독 상태가 저장되었습니다. (데모)')}});let q=$('#q');if(q){q.addEventListener('input',()=>$$('[data-search]').forEach(el=>el.classList.toggle('result-hide',!el.dataset.search.toLowerCase().includes(q.value.toLowerCase()))))}$$('[data-filter]').forEach(b=>b.onclick=()=>{let value=b.dataset.filter;$$('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));$$('[data-category]').forEach(x=>x.classList.toggle('result-hide',value!=='전체'&&x.dataset.category!==value))});$$('[data-demo-form]').forEach(f=>f.onsubmit=e=>{e.preventDefault();notify('프로토타입입니다. 서버에 전송되지 않았습니다.')});$$('[data-share]').forEach(b=>b.onclick=()=>{navigator.clipboard?.writeText(location.href).then(()=>notify('링크를 복사했습니다.')).catch(()=>notify('주소: '+location.href))});let lng=$('#language');if(lng){lng.value=localStorage.getItem('ib-lang')||'ko';lng.onchange=()=>{localStorage.setItem('ib-lang',lng.value);notify('언어 선택 저장됨 · 실제 자동 번역은 미연결')}};const title=$('#regTitle');if(title){title.value=localStorage.getItem('ib-draft')||'';$('#saveDraft')?.addEventListener('click',()=>{localStorage.setItem('ib-draft',title.value);notify('제목을 임시 저장했습니다. (데모)')})}$$('input[type=file]').forEach(x=>x.onchange=()=>{let output=document.getElementById(x.dataset.output||'');if(output&&x.files[0])output.textContent=x.files[0].name+' 선택됨 · 실제 업로드는 미연결'});

/* Existing IndustryBook site footer, shared across prototype pages.
   Links without implemented destinations are rendered as plain text. */
(function renderIndustryBookFooter(){
  const footer=document.querySelector('footer.footer');
  if(!footer)return;
  footer.setAttribute('aria-label','사이트 정보 및 고객지원');
  footer.innerHTML=`
    <div class="container ib-footer-grid">
      <div class="ib-footer-brand">
        <a class="logo" href="index.html">industry<span>book</span></a>
        <p>24시간 영업하는 디지털 영업사원<br>모든 기업을 위한 B2B 카탈로그 플랫폼</p>
      </div>
      <div class="ib-footer-group">
        <h2>서비스</h2>
        <a href="catalogs.html">카탈로그</a>
        <a href="register.html">등록하기</a>
        <a href="feed.html">구독</a>
      </div>
      <div class="ib-footer-group">
        <h2>회사</h2>
        <a href="companies.html">회사소개</a>
        <span title="페이지 준비 중">파트너십</span>
        <span title="페이지 준비 중">채용</span>
      </div>
      <div class="ib-footer-group">
        <h2>고객지원</h2>
        <span title="페이지 준비 중">공지사항</span>
        <span title="페이지 준비 중">FAQ</span>
        <span title="페이지 준비 중">이용약관</span>
        <div class="ib-footer-contact">
          <span>KLAB Portal Team</span>
          <a href="mailto:support@industrybook.co.kr">support@industrybook.co.kr</a>
        </div>
      </div>
    </div>
    <div class="container ib-footer-bottom">© 2026 Industry Book. All rights reserved.</div>
  `;
})();
