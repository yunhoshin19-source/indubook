/* Email verification-gated member edit: DESIGN DEMO ONLY.
 * Real production verification must run server-side, email OTP delivered by
 * backend and verified against authenticated account. No client-side OTP is secure. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const fields={memberName:'memberContactName',memberEmail:'memberContactEmail',phone:'memberContactPhone',companyName:'memberCompanyName',companyEnglish:'memberCompanyEnglish',representative:'memberRepresentative',bizNumber:'memberBizNumber',inviteCode:'memberInviteCode',organization:'memberOrganization'};
const el=key=>$(fields[key]);
const feedback=$('memberInfoFeedback');
const authFeedback=$('ibAuthFeedback');
const storedKey='ib-demo-member-info';
const demoCode='123456';
let authenticated=false;
let requested=false;
let attempts=0;
let registeredEmail='';
function message(node,text,isError){node.textContent=text;node.classList.toggle('is-error',!!isError);node.hidden=false}
let data={};try{data=JSON.parse(sessionStorage.getItem(storedKey)||'{}')}catch(e){}
const loginEmail=localStorage.getItem('ib-demo-email')||'';
registeredEmail=(data.registeredEmail||loginEmail||data.memberEmail||data.email||'').trim();
$('ibAuthEmail').value=registeredEmail;
el('memberName').value=data.memberName||data.name||'';
el('memberEmail').value=data.memberEmail||data.email||registeredEmail;
for(const key of ['phone','companyName','companyEnglish','representative','bizNumber','inviteCode','organization'])if(typeof data[key]==='string')el(key).value=data[key];
function updateLock(verified){
 authenticated=verified;
 $('ibMemberFields').disabled=!verified;
 $('ibAuthStatus').textContent=verified?'데모 인증 완료 · 수정 가능':'인증 전 · 수정 잠금';
 $('memberInfoForm').classList.toggle('ib-member-locked',!verified);
 $('ibAuthConfirm').disabled=verified;
 $('ibAuthCode').disabled=verified;
 $('ibAuthRequest').disabled=verified;
 if(verified)message(authFeedback,'테스트용 인증이 완료되었습니다. 아래 입력란을 수정할 수 있습니다. (실제 이메일 소유 확인은 아님)',false);
}
$('ibAuthRequest').addEventListener('click',()=>{
 if(!registeredEmail){message(authFeedback,'가입 이메일이 없습니다. 데모 로그인 또는 회원가입을 먼저 진행해 주세요.',true);return}
 requested=true;attempts=0;
 $('ibAuthTestHint').textContent='테스트 코드: 123456 · 실제 메일은 발송하지 않습니다. 코드 입력 후 인증 확인을 눌러 주세요.';
 message(authFeedback,'디자인 테스트 코드가 준비되었습니다. 이메일은 전송되지 않았습니다.',false);
});
$('ibAuthConfirm').addEventListener('click',()=>{
 if(!requested){message(authFeedback,'먼저 인증번호 발송 (데모)을 눌러 주세요.',true);return}
 if(attempts>=5){message(authFeedback,'테스트 횟수 초과입니다. 인증번호 발송 (데모)을 다시 선택해 주세요.',true);return}
 attempts++;
 if($('ibAuthCode').value.trim()!==demoCode){message(authFeedback,'인증번호가 일치하지 않습니다. ('+attempts+'/5)',true);return}
 updateLock(true);
});
$('memberInfoForm').addEventListener('submit',event=>{
 event.preventDefault();
 if(!authenticated){message(feedback,'이메일 인증을 먼저 완료해 주세요.',true);return}
 if(!event.currentTarget.reportValidity())return;
 const biz=el('bizNumber').value.replace(/[^0-9]/g,'');
 if(biz.length!==10){message(feedback,'사업자등록번호는 숫자 10자리로 입력해 주세요.',true);el('bizNumber').focus();return}
 const phone=el('phone').value.replace(/[\s-]/g,'');
 if(phone&&!/^\+?\d{8,15}$/.test(phone)){message(feedback,'연락처 형식을 확인해 주세요.',true);el('phone').focus();return}
 const payload={registeredEmail};
 for(const [key,id] of Object.entries(fields))payload[key]=$(id).value.trim();
 payload.updatedAt=new Date().toISOString();
 try{sessionStorage.setItem(storedKey,JSON.stringify(payload));message(feedback,'회원정보를 현재 탭에만 임시 저장했습니다. 실제 계정 정보는 변경되지 않았습니다.',false)}
 catch(err){message(feedback,'브라우저 임시 저장에 실패했습니다.',true)}
});
updateLock(false);
})();