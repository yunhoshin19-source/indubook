/* IndustryBook product master prototype. Browser-only; not a production MDM. */
window.IBProducts=(function(){
const key='ib-product-master-v1';
const initial=[
{id:'p-cr20',owner:'co-0',name:'CR-20 협동로봇',en:'CR-20 Collaborative Robot',model:'CR-20',category:'로봇·자동화',industry:'장비',company:'A 로보틱스',summary:'스마트 제조 현장을 위한 다목적 협동로봇 솔루션',description:'안정적인 생산 자동화 환경을 지원하는 협동로봇 샘플 제품입니다.',specs:{'가반하중':'20 kg','작업반경':'1,700 mm','축 수':'6축','설치 형태':'바닥·벽면'},tags:['협동로봇','제조','자동화'],catalogIds:['cat-0'],price:'견적 문의',status:'published',updated:'2026-10-31',views:1250,likes:92},
{id:'p-ar10',owner:'co-0',name:'AR-10 산업용 로봇',en:'AR-10 Industrial Robot',model:'AR-10',category:'로봇·자동화',industry:'장비',company:'A 로보틱스',summary:'고정밀 자동화 작업을 위한 산업용 로봇',description:'반복 생산 공정에 적용하는 산업용 로봇 샘플 제품입니다.',specs:{'가반하중':'10 kg','작업반경':'1,400 mm','축 수':'6축'},tags:['산업용 로봇','자동화'],catalogIds:['cat-0'],price:'견적 문의',status:'published',updated:'2026-10-25',views:870,likes:54},
{id:'p-grip',owner:'co-0',name:'스마트 그리퍼 G-200',en:'Smart Gripper G-200',model:'G-200',category:'로봇·자동화',industry:'부품',company:'A 로보틱스',summary:'협동로봇 호환 전동 그리퍼',description:'로봇 자동화용 그리퍼 샘플입니다.',specs:{'파지력':'200 N','통신방식':'Modbus TCP'},tags:['그리퍼','부품'],catalogIds:['cat-0'],price:'견적 문의',status:'published',updated:'2026-10-20',views:620,likes:45},
{id:'p-cnc',owner:'co-1',name:'CNC 정밀 가공 장비',en:'Precision CNC Machine',model:'CNC-500',category:'산업기계',industry:'장비',company:'B 테크',summary:'정밀 가공용 CNC 설비',description:'가공 장비 샘플 제품입니다.',specs:{'가공 범위':'500 mm','제어':'디지털'},tags:['가공','기계'],catalogIds:['cat-1'],price:'견적 문의',status:'published',updated:'2026-10-28',views:910,likes:61},
{id:'p-sensor',owner:'co-2',name:'스마트 산업용 센서',en:'Smart Sensor',model:'S-100',category:'전기·전자',industry:'부품',company:'C 일렉트로닉스',summary:'설비 상태를 감지하는 IoT 센서',description:'스마트 센서 샘플 제품입니다.',specs:{'연결방식':'Ethernet','보호 등급':'IP67'},tags:['센서','IoT'],catalogIds:['cat-2'],price:'견적 문의',status:'published',updated:'2026-10-29',views:1470,likes:118},
{id:'p-drive',owner:'co-4',name:'산업용 서보 드라이브',en:'Servo Drive',model:'DV-200',category:'산업기계',industry:'부품',company:'E 모션',summary:'산업용 모터 제어 드라이브',description:'모션 제어 샘플 제품입니다.',specs:{'정격 출력':'2 kW','제어 모드':'속도·위치'},tags:['드라이브','모터'],catalogIds:['cat-4'],price:'견적 문의',status:'published',updated:'2026-10-27',views:690,likes:31}
];
const store=()=>{try{const arr=JSON.parse(localStorage.getItem(key)||'null');return Array.isArray(arr)?arr:initial.map(x=>({...x}))}catch{return initial.map(x=>({...x}))}};
const save=products=>{localStorage.setItem(key,JSON.stringify(products));return products};
function isOwner(p){return localStorage.getItem('ib-demo-logged-in')==='yes'&&(localStorage.getItem('ib-demo-role')||'enterprise')==='enterprise'&&p.owner==='co-0'}
function validate(p){if(!p.name?.trim()||!p.model?.trim()||!p.category?.trim())throw Error('제품명, 모델명, 카테고리는 필수입니다.');return true}
return {list:store,save,get:id=>store().find(x=>x.id===id),seed:initial,isOwner,validate,key};
})();
