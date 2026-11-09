(function(){
var app=document.getElementById('app');
function el(t,a,h){var e=document.createElement(t);if(a)for(var k in a){if(k==='cls')e.className=a[k];else if(k==='on')for(var v in a.on)e.addEventListener(v,a.on[v]);else e.setAttribute(k,a[k]);}if(h!=null)e.innerHTML=h;return e;}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function get(k){try{return JSON.parse(localStorage.getItem('occ_'+k));}catch(e){return null;}}
function put(k,v){try{localStorage.setItem('occ_'+k,JSON.stringify(v));}catch(e){}}
var MAN=window.MANIFEST;
function load(src,cb){var s=document.createElement('script');s.src=src;s.onload=cb;s.onerror=function(){app.innerHTML='<div class="wrap"><p>Не удалось загрузить '+esc(src)+'.</p></div>';};document.body.appendChild(s);}
function passed(n){var t=get('L'+n+'_ids')||[];var c=0;t.forEach(function(id){var b=get('L'+n+'_'+id);if(b!=null&&b>=85)c++;});return [c,t.length];}
var RANKS=[[0,'Новичок'],[1,'Ученик'],[5,'Подмастерье'],[11,'Практик'],[17,'Мастер расклада'],[22,'Таролог Occulteria']];
function rank(){var n=0;MAN.forEach(function(m){var e=get('L'+m.n+'_examok');if(e!=null&&e>=85)n++;});var ce=get('L0_examok');var r=RANKS[0][1];RANKS.forEach(function(x){if(n>=x[0])r=x[1];});if(n>=22&&!(ce>=85))r='Мастер расклада';return [r,n];}
function home(){
  try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}window.scrollTo(0,0);
  document.title='Курс Таро · Тренажёры Occulteria';
  app.innerHTML='';var rk=rank();
  var hero=el('div',{cls:'hero'});hero.innerHTML='<div class="wrap"><div class="kick">Occulteria · Курс Таро · Интерактивные тренажёры</div><h1>Тренажёры курса</h1><p>Прошли урок? Нажмите «После урока N». Внутри тренажёры урока, новые форматы (мемори, анаграммы, «найди лишнее», диктант, виртуальная колода), личная подборка ошибок и экзамен. После всех уроков откроется итоговый экзамен курса.</p><div class="rank">Ваше звание: '+esc(rk[0])+'</div><p class="small" style="color:#F3EDE5">Сдано экзаменов: '+rk[1]+' из 22</p></div>';
  app.appendChild(hero);
  var w=el('div',{cls:'wrap course'});
  var blocks=[['Основы колоды',1,3],['Старшие арканы',4,6],['Младшие арканы',7,10],['Система, перевороты, сочетания',11,13],['Расклад',14,15],['Консультация и темы',16,22]];
  blocks.forEach(function(b){w.appendChild(el('div',{cls:'grpH'},esc(b[0])));var g=el('div',{cls:'grid'});
    MAN.filter(function(m){return m.n>=b[1]&&m.n<=b[2];}).forEach(function(m){var p=passed(m.n);var ex=get('L'+m.n+'_examok');
      var t=el('div',{cls:'tile ltile',on:{click:function(){openLesson(m.n);}}});
      t.innerHTML='<div class="kick">После урока '+m.n+'</div><h3>'+esc(m.title)+'</h3><div class="meta">'+m.cnt+' тренажёров'+(p[1]?' · пройдено на 85%: <b>'+p[0]+'</b>':'')+(ex!=null?' · экзамен: <b>'+ex+'%</b>'+(ex>=85?' <span class="badge">сдан</span>':''):'')+'</div><div class="pbar"><i style="width:'+(p[1]?Math.round(100*p[0]/p[1]):0)+'%"></i></div>';
      g.appendChild(t);});w.appendChild(g);});
  w.appendChild(el('div',{cls:'grpH'},'Итог курса'));
  var fx=get('L0_examok');var ft=el('div',{cls:'tile examt',on:{click:function(){courseExam();}}});
  ft.innerHTML='<div class="kick">Итоговый экзамен</div><h3>Экзамен по всему курсу</h3><div>66 заданий: по три из каждого урока, без подсказок до конца. Сдан при 85%.</div><div class="meta">'+(fx!=null?'Лучший результат: '+fx+'%':'Ещё не сдавали')+'</div>';
  var g2=el('div',{cls:'grid'});g2.appendChild(ft);w.appendChild(g2);
  var row=el('div',{cls:'row2',style:'margin-top:24px'});
  row.appendChild(el('button',{cls:'btn ghost',on:{click:function(){var o={};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(/^occ_/.test(k))o[k]=localStorage.getItem(k);}}catch(e){}var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:'application/json'}));a.download='occulteria-taro-progress.json';a.click();}}},'Сохранить прогресс в файл'));
  var inp=el('input',{type:'file',accept:'.json',style:'display:none'});inp.addEventListener('change',function(){var f=inp.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var o=JSON.parse(r.result);Object.keys(o).forEach(function(k){if(/^occ_/.test(k))localStorage.setItem(k,o[k]);});home();}catch(e){inp.insertAdjacentHTML('afterend','<p class="small">Файл не подходит.</p>');}};r.readAsText(f);});
  row.appendChild(inp);row.appendChild(el('button',{cls:'btn ghost',on:{click:function(){inp.click();}}},'Загрузить прогресс из файла'));
  w.appendChild(row);
  w.appendChild(el('p',{cls:'small'},'Прогресс хранится в этом браузере. Чтобы перенести его на другое устройство, сохраните файл и загрузите его там.'));
  w.appendChild(el('div',{cls:'foot'},'Карты: колода Райдера–Уэйта, рисунки Памелы Колман Смит, 1909, общественное достояние.'));
  app.appendChild(w);
}
function openLesson(n){window.scrollTo(0,0);app.innerHTML='<div class="wrap"><p>Загружаю урок '+n+'…</p></div>';
  load('lessons/L'+n+'.js',function(){var L=AUGMENT(window.LESSON);var mm=MAN.filter(function(x){return x.n===n;})[0];if(mm)L.title=mm.title;put('L'+n+'_ids',L.trainers.filter(function(t){return !t.tool&&!t.exam&&!t.dyn;}).map(function(t){return t.id;}));RUN(L);});}
function courseExam(){var items=[];var i=0;app.innerHTML='<div class="wrap"><p>Собираю задания из всех уроков…</p></div>';
  (function step(){if(i>=MAN.length){var t={id:'exam',exam:true,title:'Итоговый экзамен курса',fmt:'66 заданий',desc:'По три задания из каждого урока. Ответы показываются в конце.',mode:'mcq',items:TRU.shuf(items),keep:true,count:items.length,onFinish:function(p){var b=get('L0_examok');if(b==null||p>b)put('L0_examok',p);}};RUN({key:'L0',title:'Итоговый экзамен курса',sub:'Сдан при 85% и выше.',trainers:[t]});return;}
   var m=MAN[i++];load('lessons/L'+m.n+'.js',function(){try{var L=AUGMENT(window.LESSON);var ex=L.trainers.filter(function(t){return t.exam;})[0];ex.build().slice(0,3).forEach(function(x){items.push(x);});}catch(e){}step();});})();}
window.SHELLHOME=home;
var m=/^#L(\d+)/.exec(location.hash);
if(m&&+m[1]===0)courseExam();else if(m&&MAN.some(function(x){return x.n===+m[1];}))openLesson(+m[1]);else home();
})();
