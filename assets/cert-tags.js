/* Browser-only certification tags. An entered label is NOT a verified certification. */
window.IBCertTags=(function(){
 'use strict';
 function clean(values,max=12){return [...new Set((Array.isArray(values)?values:String(values||'').split(/[,，\n]+/)).map(x=>String(x).trim().slice(0,80)).filter(Boolean))].slice(0,max)}
 function create(inputId,buttonId,chipsId,max=12){
  const input=document.getElementById(inputId),button=document.getElementById(buttonId),panel=document.getElementById(chipsId);if(!input||!panel)return null;
  let tags=[];
  function render(){panel.replaceChildren();tags.forEach(value=>{const chip=document.createElement('span');chip.className='ib-cert-chip';chip.append(document.createTextNode(value));const del=document.createElement('button');del.type='button';del.textContent='×';del.setAttribute('aria-label',value+' 제거');del.onclick=()=>{tags=tags.filter(x=>x!==value);render()};chip.append(del);panel.append(chip)})}
  function add(text){tags=clean([...tags,...String(text||'').split(/[,，\n]+/)],max);input.value='';render()}
  input.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===','||e.key==='，'){e.preventDefault();add(input.value)}});
  input.addEventListener('blur',()=>{if(input.value.trim())add(input.value)});
  if(button)button.addEventListener('click',()=>add(input.value));
  render();
  return {get:()=>{if(input.value.trim())add(input.value);return [...tags]},set:v=>{tags=clean(v,max);render()},add};
 }
 return {create,clean};
})();
