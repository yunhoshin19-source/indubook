/* IndustryBook profile-edit — browser-local demo only */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const storeKey='ib-demo-profile-v1';
let chosen=[],photoData=null;
const fields={nickname:'ibNickname',nicknameEnglish:'ibNicknameEn',shortIntro:'ibShortIntro',companyIntro:'ibCompanyIntro',region:'ibRegion'};
const socials=['website','instagram','linkedin','facebook','youtube','blog'];
const defaultPhoto='<svg viewBox="0 0 40 40" role="img" aria-label="기본 프로필 사진"><circle cx="20" cy="20" r="20" fill="#e7efff"/><circle cx="20" cy="15" r="6" fill="#7795c3"/><path d="M9 34c0-8 5-12 11-12s11 4 11 12" fill="#7795c3"/></svg>';
function showPhoto(){const preview=$('ib-edit-photo-preview');preview.replaceChildren();const photo=photoData||localStorage.getItem('ib-demo-photo');if(photo&&photo.startsWith('data:image/')){const img=document.createElement('img');img.alt='프로필 사진';img.src=photo;preview.append(img)}else preview.innerHTML=defaultPhoto}
function feedback(message,error){const el=$('ibEditFeedback');el.textContent=message;el.hidden=false;el.classList.toggle('is-error',!!error)}
function count(id,counter){const x=$(id);$(counter).textContent=x.value.length+'/'+x.maxLength}
[['ibNickname','ibNicknameCount'],['ibNicknameEn','ibNicknameEnCount'],['ibShortIntro','ibShortIntroCount'],['ibCompanyIntro','ibCompanyIntroCount']].forEach(([id,c])=>$(id).addEventListener('input',()=>count(id,c)));
function paintCats(){document.querySelectorAll('[data-category]').forEach(btn=>{const selected=chosen.includes(btn.dataset.category);btn.classList.toggle('active',selected);btn.setAttribute('aria-pressed',String(selected))});$('ibSelectedCategoryCount').textContent=chosen.length}
document.querySelectorAll('[data-category]').forEach(btn=>btn.addEventListener('click',()=>{const value=btn.dataset.category;if(chosen.includes(value))chosen=chosen.filter(x=>x!==value);else if(chosen.length<3)chosen.push(value);else{feedback('관심 카테고리는 최대 3개까지 선택할 수 있습니다.',true);return}paintCats();$('ibEditFeedback').hidden=true}));
$('ibEditPhotoButton').addEventListener('click',()=>$('ibEditPhotoFile').click());
$('ibEditPhotoFile').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>1572864){feedback('JPG, PNG, WebP 이미지를 1.5MB 이하로 선택해 주세요.',true);e.target.value='';return}const reader=new FileReader();reader.onload=()=>{photoData=reader.result;showPhoto();feedback('사진을 선택했습니다. 저장하기를 누르면 브라우저에 보관됩니다.',false)};reader.readAsDataURL(f)});
try{const data=JSON.parse(localStorage.getItem(storeKey)||'{}');Object.entries(fields).forEach(([key,id])=>{if(typeof data[key]==='string')$(id).value=data[key]});if(Array.isArray(data.categories))chosen=data.categories.filter(x=>[...document.querySelectorAll('[data-category]')].some(b=>b.dataset.category===x)).slice(0,3);if(data.socials&&typeof data.socials==='object')socials.forEach(k=>{if(typeof data.socials[k]==='string')$('ibSocial_'+k).value=data.socials[k]})}catch(e){}
showPhoto();paintCats();
[['ibNickname','ibNicknameCount'],['ibNicknameEn','ibNicknameEnCount'],['ibShortIntro','ibShortIntroCount'],['ibCompanyIntro','ibCompanyIntroCount']].forEach(([id,c])=>count(id,c));
$('ibEditForm').addEventListener('submit',e=>{e.preventDefault();const nickname=$('ibNickname');if(!nickname.checkValidity()){nickname.reportValidity();return}const data={categories:[...chosen],socials:{}};Object.entries(fields).forEach(([key,id])=>data[key]=$(id).value.trim());for(const id of socials){const v=$('ibSocial_'+id).value.trim();if(v){const el=$('ibSocial_'+id);if(!el.checkValidity()){el.reportValidity();return}try{const u=new URL(v);if(!['http:','https:'].includes(u.protocol)){feedback('소셜 링크는 http 또는 https 주소만 입력해 주세요.',true);el.focus();return}}catch(err){feedback('올바른 소셜 링크 주소를 입력해 주세요.',true);el.focus();return}}data.socials[id]=v}
try{localStorage.setItem(storeKey,JSON.stringify(data));if(photoData)localStorage.setItem('ib-demo-photo',photoData);feedback('프로필이 브라우저에 저장되었습니다. 마이페이지에서 확인하세요.',false);$('ibSaveProfile').textContent='✓ 저장 완료'}catch(err){feedback('저장 공간이 부족합니다. 사진 용량을 줄이거나 다시 시도해 주세요.',true)}
});
})();
