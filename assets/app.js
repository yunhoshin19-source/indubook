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

/* Header language and corporate profile: prototype-only UI. */
(function industryHeaderControls(){
  const actions=document.querySelector('.top-actions');
  if(!actions)return;
  const languages=[
    ['ko','KR','한국어'],['en','EN','English'],['ja','JP','日本語'],['zh','CN','中文'],
    ['vi','VN','Tiếng Việt'],['fr','FR','Français'],['es','ES','Español'],['id','ID','Indonesia']
  ];
  const langNames=Object.fromEntries(languages.map(x=>[x[0],x]));
  const select=document.getElementById('language');
  if(select){
    const selector=document.createElement('div');
    selector.className='ib-language-switcher';
    selector.innerHTML='<button type="button" class="ib-language-trigger" aria-label="언어 선택" aria-expanded="false" aria-haspopup="true"><span class="ib-lang-globe">🌐</span><span class="ib-current-language">한국어</span><span class="ib-caret">⌄</span></button><div class="ib-language-menu" role="menu" hidden></div>';
    const menu=selector.querySelector('.ib-language-menu');
    languages.forEach(([code,short,label])=>{
      const item=document.createElement('button');
      item.type='button';item.className='ib-language-item';item.setAttribute('role','menuitemradio');
      item.dataset.lang=code;item.innerHTML='<span class="ib-language-code">'+short+'</span><span>'+label+'</span>';
      item.addEventListener('click',()=>{setLanguage(code);closeLanguage()});
      menu.appendChild(item);
    });
    select.replaceWith(selector);
    const trigger=selector.querySelector('.ib-language-trigger');
    const closeLanguage=()=>{menu.hidden=true;trigger.setAttribute('aria-expanded','false')};
    function setLanguage(code){
      if(!langNames[code])code='ko';
      localStorage.setItem('ib-lang',code);
      selector.querySelector('.ib-current-language').textContent=langNames[code][2];
      menu.querySelectorAll('[data-lang]').forEach(b=>{const active=b.dataset.lang===code;b.classList.toggle('selected',active);b.setAttribute('aria-checked',String(active))});
      document.documentElement.lang=code;
      const nav={ko:['홈','카탈로그','기업 찾기','관심 피드','+ 등록'],en:['Home','Catalogs','Companies','Following','+ Register'],ja:['ホーム','カタログ','企業検索','フォロー','+ 登録'],zh:['首页','产品目录','企业','关注动态','+ 发布'],vi:['Trang chủ','Catalogue','Doanh nghiệp','Đang theo dõi','+ Đăng'],fr:['Accueil','Catalogues','Entreprises','Abonnements','+ Publier'],es:['Inicio','Catálogos','Empresas','Siguiendo','+ Publicar'],id:['Beranda','Katalog','Perusahaan','Mengikuti','+ Unggah']};
      const navLinks=[...document.querySelectorAll('.toplinks a')], labels=nav[code];
      navLinks.slice(0,4).forEach((a,i)=>{a.textContent=labels[i]});
      const reg=actions.querySelector('a[href="register.html"]');if(reg)reg.textContent=labels[4];
    }
    trigger.addEventListener('click',()=>{const next=menu.hidden;menu.hidden=!next;trigger.setAttribute('aria-expanded',String(next))});
    document.addEventListener('click',e=>{if(!selector.contains(e.target))closeLanguage()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLanguage()});
    setLanguage(localStorage.getItem('ib-lang')||'ko');
  }
  const profileIcon=actions.querySelector('a[href="login.html"][aria-label="로그인"]');
  const isSignedIn=localStorage.getItem('ib-demo-logged-in')==='yes';
  const defaultAvatar='<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#e7efff"/><circle cx="20" cy="15.5" r="6" fill="#7795c3"/><path d="M9 33c.6-7 5-11 11-11s10.4 4 11 11" fill="#7795c3"/></svg>';
  if(profileIcon){
    if(isSignedIn){
      const group=document.createElement('div');group.className='ib-profile-wrap';
      const btn=document.createElement('button');btn.className='ib-profile-trigger';btn.type='button';btn.setAttribute('aria-label','프로필 메뉴');btn.setAttribute('aria-expanded','false');
      const photo=localStorage.getItem('ib-demo-photo');
      const avatar=document.createElement('span');avatar.className='ib-profile-avatar';
      if(photo&&photo.startsWith('data:image/')){const img=document.createElement('img');img.src=photo;img.alt='프로필 사진';avatar.appendChild(img)}else avatar.innerHTML=defaultAvatar;
      btn.appendChild(avatar);
      const menu=document.createElement('div');menu.className='ib-profile-menu';menu.hidden=true;
      const name=document.createElement('div');name.className='ib-profile-heading';name.textContent=localStorage.getItem('ib-demo-email')||'기업회원 (데모)';
      const my=document.createElement('a');my.href='mypage.html';my.textContent='마이페이지';
      const dash=document.createElement('a');dash.href='dashboard.html';dash.textContent='기업 대시보드';
      const out=document.createElement('button');out.type='button';out.textContent='로그아웃';
      out.addEventListener('click',()=>{localStorage.removeItem('ib-demo-logged-in');localStorage.removeItem('ib-demo-email');window.location.href='index.html'});
      menu.append(name,my,dash,out);group.append(btn,menu);
      profileIcon.replaceWith(group);
      btn.addEventListener('click',()=>{menu.hidden=!menu.hidden;btn.setAttribute('aria-expanded',String(!menu.hidden))});
      document.addEventListener('click',e=>{if(!group.contains(e.target)){menu.hidden=true;btn.setAttribute('aria-expanded','false')}});
      document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.hidden=true;btn.setAttribute('aria-expanded','false')}});
    }else{
      profileIcon.innerHTML='<span class="ib-profile-avatar">'+defaultAvatar+'</span>';
      profileIcon.classList.add('ib-profile-login');
      profileIcon.title='기업회원 로그인';
    }
  }
  const login=document.getElementById('ib-demo-login');
  if(login){
    login.addEventListener('submit',e=>{
      e.preventDefault();
      if(!login.reportValidity())return;
      const email=login.querySelector('input[type="email"]').value.trim();
      localStorage.setItem('ib-demo-logged-in','yes');
      localStorage.setItem('ib-demo-email',email);
      window.location.href='mypage.html';
    });
  }
  const photoInput=document.getElementById('ib-profile-photo-input');
  if(photoInput){
    const preview=document.getElementById('ib-profile-photo-preview');
    const updatePreview=data=>{preview.innerHTML='';if(data){const img=document.createElement('img');img.src=data;img.alt='내 프로필 사진';preview.appendChild(img)}else preview.innerHTML=defaultAvatar};
    updatePreview(localStorage.getItem('ib-demo-photo'));
    photoInput.addEventListener('change',()=>{
      const file=photoInput.files&&photoInput.files[0];if(!file)return;
      if(!file.type.startsWith('image/')||file.size>1.5*1024*1024){notify('이미지 파일은 1.5MB 이하만 선택해 주세요.');photoInput.value='';return}
      const reader=new FileReader();reader.onload=()=>{
        try{localStorage.setItem('ib-demo-photo',reader.result);updatePreview(reader.result);notify('프로필 사진을 이 브라우저에 저장했습니다.');location.reload()}
        catch(err){notify('브라우저 저장 공간이 부족합니다. 더 작은 이미지를 선택해 주세요.')}
      };reader.readAsDataURL(file);
    });
  }
})();
