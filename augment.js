window.AUGMENT=function(L){
var D=DECK,SH=TRU.shuf;function P(a){return a[Math.floor(Math.random()*a.length)];}
function cut(s,n){n=n||200;s=String(s||'');return s.length<=n?s:s.slice(0,n).replace(/\s\S*$/,'')+'…';}
var base=L.trainers.slice();
function sample(t,n){try{if(t.tool||t.exam||t.dyn)return [];if(t.items)return SH(t.items).slice(0,n).map(function(x){var c=Object.assign({},x);if(!c.mode)c.mode=t.mode;c._t=t;return c;});var r=[];for(var i=0;i<n*2&&r.length<n;i++){var x=t.gen();if(x){if(!x.mode)x.mode=t.mode;x._t=t;r.push(x);}}return r;}catch(e){return [];}}
var POOL={mcq:[],tf:[],fill:[],match:[],sort:[],order:[]};
base.forEach(function(t){sample(t,30).forEach(function(x){if(POOL[x.mode]&&!(x.mode==='mcq'&&!x.o))POOL[x.mode].push(x);});});
var T=[];
// odd one out (deck)
var M=D.cards;
function oddDeck(){var k=P(['suit','num','maj','court']);var g,o,why;
 if(k==='suit'){var s=P(D.SUITS);g=SH(M.filter(function(c){return c.suit===s[0];})).slice(0,3);o=P(M.filter(function(c){return c.suit&&c.suit!==s[0];}));why='Три карты масти '+s[1]+', '+D.name(o.id)+' из другой масти.';}
 else if(k==='num'){var n=1+Math.floor(Math.random()*14);g=SH(M.filter(function(c){return c.kind!=='major'&&c.num===n;})).slice(0,3);o=P(M.filter(function(c){return c.kind!=='major'&&c.num!==n;}));why='Три карты одного ранга ('+D.RANK[n-1]+'), '+D.name(o.id)+' другого.';}
 else if(k==='maj'){g=SH(M.filter(function(c){return c.kind==='major';})).slice(0,3);o=P(M.filter(function(c){return c.kind!=='major';}));why='Три старших аркана, '+D.name(o.id)+' младший.';}
 else{g=SH(M.filter(function(c){return c.kind==='court';})).slice(0,3);o=P(M.filter(function(c){return c.kind==='pip';}));why='Три придворные карты, '+D.name(o.id)+' числовая.';}
 var all=SH(g.concat([o]));return {mode:'mcq',q:'Какая карта здесь лишняя?',img:all.map(function(c){return c.id;}),o:[D.name(o.id)].concat(g.map(function(c){return D.name(c.id);})),a:0,e:why};}
function oddSort(){var s=P(POOL.sort);var by={};s.items.forEach(function(x){(by[x.b]=by[x.b]||[]).push(x);});var ks=Object.keys(by).filter(function(k){return by[k].length>=3;});if(!ks.length)return null;var k=P(ks);var others=s.items.filter(function(x){return x.b!=k;});if(!others.length)return null;var g=SH(by[k]).slice(0,3),o=P(others);
 function lab(x){return x.t||D.name(x.img);}return {mode:'mcq',q:'Что здесь лишнее?',o:[lab(o)].concat(g.map(lab)),a:0,e:'Остальные относятся к группе «'+s.buckets[k]+'», а это к группе «'+s.buckets[o.b]+'».'};}
T.push({id:'odd',grp:'new',title:'Найди лишнее',fmt:'одно из четырёх',desc:'Четыре варианта, три объединены общим признаком. Найдите тот, что выпадает.',mode:'mcq',count:16,gen:function(){return (POOL.sort.length&&Math.random()<.5&&oddSort())||oddDeck();}});
// multi
var TFt=POOL.tf.filter(function(x){return x.s&&x.s.length<260&&!/\?\s*$/.test(x.s);});
if(TFt.length>=8)T.push({id:'multi',grp:'new',title:'Выберите все верные',fmt:'несколько ответов',desc:'Пять утверждений, верных среди них несколько. Отметьте все верные.',mode:'multi',count:12,
 gen:function(){var s=SH(TFt).slice(0,5);var a=[];s.forEach(function(x,i){if(x.a)a.push(i);});if(!a.length)return this.gen();return {q:'Отметьте все верные утверждения.',o:s.map(function(x){return x.s;}),a:a,e:s.map(function(x){return (x.a?'Верно: ':'Неверно: ')+cut(x.s,90)+(x.e&&!x.a?' '+cut(x.e,140):'');}).join('\n')};}});
// memory
var PAIRS=[];POOL.match.forEach(function(x){(x.pairs||[]).forEach(function(p){if(String(p[1]).length<=90)PAIRS.push(p);});});
if(PAIRS.length>=6)T.push({id:'memory',grp:'new',title:'Мемори',fmt:'найдите пары',desc:'Карточки лежат рубашкой вверх. Открывайте по две и находите пары. Норма: не больше двух ходов на пару.',mode:'memory',count:6,
 gen:function(){var s=SH(PAIRS);var L1={},R1={},r=[];s.forEach(function(p){if(r.length<6&&!L1[p[0]]&&!R1[p[1]]){L1[p[0]]=R1[p[1]]=1;r.push(p);}});return {pairs:r};}});
// gap fill
var TRUE=TFt.filter(function(x){return x.a&&x.s.split(' ').length>=8;});
var WORDS=[];TRUE.forEach(function(x){x.s.replace(/[«»"(),.:;!?]/g,' ').split(/\s+/).forEach(function(w){if(w.length>=6&&/^[а-яё]+$/.test(w))WORDS.push(w);});});
if(TRUE.length>=5&&WORDS.length>=20)T.push({id:'gap',grp:'new',title:'Заполните пропуск',fmt:'слово в правиле',desc:'В правиле урока пропущено слово. Выберите, какое.',mode:'mcq',count:16,
 gen:function(){var x=P(TRUE);var ws=x.s.split(' ');var c=[];ws.forEach(function(w,i){var b=w.replace(/[«»"(),.:;!?]/g,'');if(i>0&&b.length>=6&&/^[а-яё]+$/.test(b))c.push(i);});if(!c.length)return null;var i=P(c);var b=ws[i].replace(/[«»"(),.:;!?]/g,'');var q=ws.slice();q[i]=ws[i].replace(b,'_____');var w=SH(WORDS.filter(function(y){return y!==b;}));var u=[];w.forEach(function(y){if(u.length<3&&u.indexOf(y)<0)u.push(y);});return {q:'Какое слово пропущено?',story:q.join(' '),o:[b].concat(u),a:0,e:x.s};}});
// build phrase
if(TRUE.length>=5)T.push({id:'build',grp:'new',title:'Соберите правило',fmt:'фрагменты по порядку',desc:'Правило урока разрезано на части. Соберите его, нажимая на фрагменты по порядку.',mode:'order',count:10,
 gen:function(){var x=P(TRUE);var ws=x.s.split(' ');var n=ws.length>=16?5:4;var per=Math.ceil(ws.length/n);var it=[];for(var i=0;i<ws.length;i+=per)it.push(ws.slice(i,i+per).join(' '));return {q:'Соберите фразу из фрагментов.',items:it,e:x.s};}});
// anagram + dictation
var SHORT=POOL.mcq.filter(function(x){var r=x.o[x.a];return r&&r.length<=24&&/^[А-ЯЁа-яё ]+$/.test(r)&&r.split(' ').length<=3;});
function scr(w){var r;do{r=w.toUpperCase().split(' ').map(function(p){return SH(p.split('')).join('');}).join(' ');}while(r===w.toUpperCase()&&w.length>3);return r;}
if(SHORT.length>=6){
 T.push({id:'anagram',grp:'new',title:'Анаграмма',fmt:'соберите слово',desc:'Ответ на вопрос урока, но буквы перемешаны. Соберите слово и впишите.',mode:'fill',count:12,
  gen:function(){var x=P(SHORT);var r=x.o[x.a];return {q:(x.q||'')+' Буквы ответа: '+scr(r),story:x.story?cut(x.story,400):null,img:x.img,noname:true,a:[r],e:x.e};}});
 T.push({id:'dict',grp:'new',title:'Диктант без подсказок',fmt:'впишите ответ сами',desc:'Вопросы урока без вариантов: ответ нужно написать по памяти.',mode:'fill',count:12,
  gen:function(){var x=P(SHORT);var r=x.o[x.a];return {q:x.q,story:x.story?cut(x.story,400):null,img:x.img,noname:true,a:[r],e:x.e};}});
}
// deck tool
T.push({id:'deck',grp:'tool',tool:true,title:'Виртуальная колода',fmt:'свободная практика',desc:'Перемешайте колоду, вытяните 1, 3, 5 или 10 карт, прочитайте и откройте подсказку по каждой.',mode:'deck',items:[{}],count:1});
// errors
T.push({id:'errors',grp:'tool',title:'Мои ошибки',fmt:'личная подборка',desc:'Сюда автоматически попадают задания, где вы ошиблись. Верный ответ убирает задание из подборки.',mode:'mcq',count:30,dyn:function(){try{return JSON.parse(localStorage.getItem('occ_'+L.key+'_err'))||[];}catch(e){return [];}}});
// exam
var EXAM=[];['mcq','tf','fill','order','match','sort'].forEach(function(m){POOL[m].forEach(function(x){EXAM.push(x);});});
T.push({id:'exam',exam:true,title:'Экзамен по уроку',fmt:'30 заданий, без подсказок',desc:'Задания из всех тренажёров урока. Ответы не показываются до конца, таймеров нет. Экзамен сдан при 85% и выше.',mode:'mcq',
 build:function(){var pool=[];base.concat(T).forEach(function(t){if(t.tool||t.exam||t.dyn)return;sample(t,4).forEach(function(x){if(/^(mcq|tf|fill|multi|order|match|sort)$/.test(x.mode))pool.push(x);});});return SH(pool).slice(0,30).map(function(x){var c=Object.assign({},x);delete c._t;return c;});},
 onFinish:function(p){try{var k='occ_'+L.key+'_examok';var b=JSON.parse(localStorage.getItem(k));if(b==null||p>b)localStorage.setItem(k,JSON.stringify(p));}catch(e){}}});
base.forEach(function(t){t.grp=t.grp||'base';});
L.trainers=base.concat(T);
var n=L.trainers.length;L.sub=(L.sub||'').replace(/^\d+ тренаж[её]р[а-я]*/,n+' тренажёров');
return L;};
