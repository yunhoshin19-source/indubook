/* Catalog detail: related catalog prototype. Demo relevance metadata, not real DB. */
(function(){
'use strict';
const grid=document.getElementById('ibRelatedGrid'),more=document.getElementById('ibRelatedMore');
if(!grid||!more)return;
const current={id:'kar-membership',categories:['로봇·자동화','로봇','AI','기술서비스','협회']};
const catalogues=[
{id:'cat-0',title:'로봇 자동화 솔루션',company:'A 로보틱스',category:'로봇·자동화',tags:['로봇','AI','자동화'],date:'2026-10-14',views:182,theme:'robot'},
{id:'cat-1',title:'정밀 가공 장비',company:'B 테크',category:'산업기계',tags:['장비','부품','제조업'],date:'2026-10-22',views:147,theme:'machine'},
{id:'cat-2',title:'스마트 센서 시스템',company:'C 일렉트로닉스',category:'전기·전자',tags:['AI','기술서비스','센서'],date:'2026-10-27',views:216,theme:'sensor'},
{id:'cat-3',title:'산업 제어 시스템',company:'D 오토메이션',category:'로봇·자동화',tags:['로봇','자동화','기술서비스'],date:'2026-10-08',views:112,theme:'control'},
{id:'cat-4',title:'산업용 드라이브',company:'E 모션',category:'산업기계',tags:['장비','자동화','부품'],date:'2026-10-30',views:98,theme:'drive'},
{id:'cat-5',title:'스마트 팩토리',company:'F 솔루션',category:'로봇·자동화',tags:['로봇','AI','제조업'],date:'2026-10-25',views:174,theme:'factory'}
];
let interests=[];
if(localStorage.getItem('ib-demo-logged-in')==='yes'){
 try{const data=JSON.parse(localStorage.getItem('ib-demo-profile-v1')||'{}');if(Array.isArray(data.categories))interests=data.categories.filter(s=>typeof s==='string').slice(0,3)}catch(e){}
}
const aliases={'로봇':['로봇·자동화'],'장비':['산업기계'],'부품':['산업기계','전기·전자'],'기술서비스':['로봇·자동화','전기·전자'],'IT서비스':['전기·전자']};
function matches(c,category){return c.category===category||c.tags.includes(category)||(aliases[category]||[]).includes(c.category)}
const ordered=catalogues.filter(c=>c.id!==current.id).map(c=>{
 let score=0;for(const tag of current.categories)score+=matches(c,tag)?(tag==='로봇·자동화'?90:22):0;
 for(const category of interests)score+=matches(c,category)?12:0;
 return {...c,score};
}).sort((a,b)=>b.score-a.score||b.views-a.views);
const initiallyVisible=3;
function element(tag,cls,content){const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=content;return n}
function makeCard(c){
 const article=element('article','ib-related-card'),anchor=element('a','ib-related-cover');
 // The related demo items currently only have listing records, so link to a matching listing search.
 anchor.href='catalogs.html?q='+encodeURIComponent(c.title);
 anchor.setAttribute('aria-label',c.title+' 카탈로그 검색 결과 보기');
 const art=element('div','ib-related-art ib-related-art--'+c.theme);
 art.append(element('span','ib-related-art-kicker','INDUSTRYBOOK / CATALOG'));
 art.append(element('strong','ib-related-art-title',c.title));
 art.append(element('span','ib-related-art-company',c.company));
 anchor.append(art);article.append(anchor);
 const body=element('div','ib-related-card-body');
 body.append(element('span','ib-related-category',c.category));
 const title=element('a','ib-related-card-title',c.title);title.href=anchor.href;body.append(title);
 body.append(element('span','ib-related-publisher',c.company));
 const footer=element('div','ib-related-card-foot');
 footer.append(element('span','',c.date.replaceAll('-','.')));
 const visit=element('a','', '카탈로그 찾기 →');visit.href=anchor.href;footer.append(visit);
 body.append(footer);article.append(body);
 return article
}
const cards=ordered.map(makeCard);cards.forEach((card,i)=>{card.hidden=i>=initiallyVisible;grid.append(card)});
let expanded=false;
function update(){cards.forEach((card,i)=>{card.hidden=!expanded&&i>=initiallyVisible});more.hidden=cards.length<=initiallyVisible;more.setAttribute('aria-expanded',String(expanded));more.textContent=expanded?'접기 ↑':'추천 카탈로그 더보기 ('+(cards.length-initiallyVisible)+') ↓'}
more.addEventListener('click',()=>{expanded=!expanded;update();if(!expanded)document.getElementById('ibRelatedHeading').scrollIntoView({block:'start',behavior:'smooth'})});
const description=document.getElementById('ibRelatedDescription');
if(interests.length)description.textContent='현재 자료와 관련된 산업을 우선하고, 내 관심 카테고리('+interests.join(' · ')+')를 함께 반영합니다.';
update();
})();
