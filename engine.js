/* Occulteria · движок тренажёров */
window.RUN=function(L){
var app=document.getElementById('app');var LN=L.key.slice(1);
function el(tag,attrs,html){var e=document.createElement(tag);if(attrs)for(var k in attrs){if(k==='cls')e.className=attrs[k];else if(k==='on')for(var ev in attrs.on)e.addEventListener(ev,attrs.on[ev]);else e.setAttribute(k,attrs[k]);}if(html!=null)e.innerHTML=html;return e;}
function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function pick(a,n){return shuf(a).slice(0,n);}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem('occ_'+k));localStorage.setItem('occ_'+k,JSON.stringify(v));}catch(e){return null;}}
window.TRU=window.TRU||{};TRU.shuf=shuf;TRU.pick=pick;
function cardsHtml(ids,big){
  if(!ids||!ids.length)return '';
  var h='<div class="cards'+(big?' big':'')+'">';
  ids.forEach(function(id){var r=/r$/.test(id);var b=r?id.slice(0,-1):id;var im='<img src="'+DECK.img(b)+'" alt="">';if(L.hideNames)im='<div class="mask">'+im+'</div>';h+='<figure class="'+(r?'rev':'')+'">'+im+'<figcaption>'+(L.hideNames?'':esc(DECK.name(id)))+'</figcaption></figure>';});
  return h+'</div>';
}
function cardsNoName(ids,big){var s=L.hideNames;L.hideNames=true;var h=cardsHtml(ids,big);L.hideNames=s;return h;}
window.TRU.cardsHtml=cardsHtml;

/* ---------- главная страница урока ---------- */
function home(){
  document.body.classList.remove('examrun');
  try{if(location.hash!=='#L'+LN)history.replaceState(null,'','#L'+LN);}catch(e){}
  app.innerHTML='';
  var hero=el('div',{cls:'hero'});
  hero.innerHTML='<div class="wrap"><div class="kick">Occulteria · Курс Таро · '+(LN==='0'?'Итог курса':'Урок '+LN)+'</div><h1>'+esc(L.title)+'</h1><p>'+esc(L.sub||'')+'</p></div>';var hb=el('button',{cls:'btn ghost inv',on:{click:function(){window.SHELLHOME();}}},'← Все уроки');hero.querySelector('.wrap').insertBefore(hb,hero.querySelector('.kick'));
  app.appendChild(hero);
  var w=el('div',{cls:'wrap'});
  w.appendChild(el('p',{cls:'small'},'Выберите тренажёр. Каждый раунд берёт задания из большого банка вперемешку, поэтому повторный раунд не совпадает с прошлым. Ошибки собираются в конце раунда, их можно прорешать заново.'));
  var g=el('div',{cls:'grid'});
  L.trainers.forEach(function(t,i){
    var best=store(L.key+'_'+t.id);
    var n=t.items?t.items.length:(t.dyn?t.dyn().length:(t.bank||'∞'));
    var tile=el('div',{cls:'tile'+(t.exam?' examt':'')+(t.grp?' g-'+t.grp:''),on:{click:function(){start(i);}}});
    tile.innerHTML='<div class="kick">'+(t.exam?'Экзамен':'Тренажёр '+(i+1))+'</div><h3>'+esc(t.title)+'</h3><div>'+esc(t.desc||'')+'</div><div class="meta">'+esc(t.fmt||'')+(t.tool?'':' · в банке: '+n)+(t.timer?' · '+t.timer+' с на ответ':'')+(best!=null?' · <span class="best">лучший: '+best+'%</span>':'')+'</div>';
    g.appendChild(tile);
  });
  w.appendChild(g);
  w.appendChild(el('div',{cls:'foot'},'Карты: колода Райдера–Уэйта, рисунки Памелы Колман Смит, 1909, общественное достояние.'));
  app.appendChild(w);
  window.scrollTo(0,0);
}

/* ---------- раунд ---------- */
var S;
function start(i,only){
  var t=L.trainers[i];
  var items;
  if(only)items=only;
  else if(t.dyn){items=shuf(t.dyn()).slice(0,t.count||30);if(!items.length){var nt=document.querySelectorAll('.tile')[i];if(nt)nt.insertAdjacentHTML('beforeend','<div class="small" style="color:#DF481A">Пока пусто: ошибки появятся, когда вы пройдёте тренажёры.</div>');return;}}
  else if(t.build){items=t.build();}
  else if(t.gen){items=[];var n=t.count||20;var seen={};var guard=0;while(items.length<n&&guard<n*20){guard++;var it=t.gen();var key=JSON.stringify(it.q||it.s||it.story||it.front||'')+JSON.stringify(it.img||'');if(seen[key]&&guard<n*10)continue;seen[key]=1;items.push(it);}}
  else items=t.keep?t.items.slice(0,t.count||t.items.length):pick(t.items,Math.min(t.count||t.items.length,t.items.length));
  S={t:t,ti:i,items:items,k:0,ok:0,wrong:[],answered:0};
  try{history.replaceState(null,'','#L'+LN+'/t'+(i+1));}catch(e){}
  render();
}
function header(){
  var w=el('div',{cls:'wrap'});
  var top=el('div',{cls:'top'});
  top.innerHTML='<h2>'+esc(S.t.title)+'</h2>';
  var b=el('button',{cls:'btn ghost',on:{click:function(){if(S.t.exam&&S.k<S.items.length&&!b._sure){b._sure=1;b.textContent='Точно выйти? Нажмите ещё раз';return;}home();}}},'← К тренажёрам');
  top.appendChild(b);
  w.appendChild(top);
  var pr=el('div',{cls:'score'},'Задание '+(S.k+1)+' из '+S.items.length+' · верно: '+S.ok);
  w.appendChild(pr);
  var bar=el('div',{cls:'bar'},'<i style="width:'+(100*S.k/S.items.length)+'%"></i>');
  w.appendChild(bar);
  if(S.t.instr&&S.k===0)w.appendChild(el('p',{cls:'small'},esc(S.t.instr)));
  return w;
}
function render(){
  clearInterval(S.tm);document.body.classList.toggle('examrun',!!S.t.exam);
  app.innerHTML='';window.scrollTo(0,0);
  if(S.k>=S.items.length)return finish();
  var w=header();app.appendChild(w);
  var it=S.items[S.k];var mode=it.mode||S.t.mode;
  (MODES[mode]||MODES.mcq)(w,it);
}
function next(){S.k++;render();}
function result(ok,it,expl,extra){
  S.answered++;if(ok)S.ok++;else S.wrong.push(it);
  try{var m=it.mode||S.t.mode;if(/^(mcq|tf|fill|multi|match|order|sort)$/.test(m)&&!S.t.tool){var ek=L.key+'_err';var eb=store(ek)||[];var kk=JSON.stringify([it.q||it.s||it.story||'',it.img||'']);eb=eb.filter(function(x){return JSON.stringify([x.q||x.s||x.story||'',x.img||''])!==kk;});if(!ok){var c=JSON.parse(JSON.stringify(it));c.mode=m;eb.push(c);}store(ek,eb.slice(-200));}}catch(e){}
  return ok;
}
function fb(w,ok,e,label){
  if(S.t.exam){setTimeout(next,ok===null?0:350);return;}
  var f=el('div',{cls:'fb'});
  f.innerHTML=(ok===null?'':'<b class="'+(ok?'ok':'bad')+'">'+(label||(ok?'Верно.':'Неверно.'))+'</b> ')+(e?esc(e).replace(/\n/g,'<br>'):'');
  w.appendChild(f);
  var nb=el('button',{cls:'btn acc',on:{click:next}},S.k+1<S.items.length?'Дальше →':'Итоги');
  w.appendChild(el('div',{},'')).appendChild(nb);
  nb.focus();
}
function timer(w,sec,onTimeout){
  if(S.t.exam)return;
  var left=sec;var t=el('div',{cls:'timer'},'⏱ '+left);w.appendChild(t);
  S.tm=setInterval(function(){left--;t.textContent='⏱ '+left;if(left<=0){clearInterval(S.tm);onTimeout();}},1000);
}
var MODES={
mcq:function(w,it){
  if(it.story)w.appendChild(el('div',{cls:'story'},esc(it.story)));
  w.appendChild(el('div',{cls:'q'},esc(it.q)));
  if(it.img)w.insertAdjacentHTML('beforeend',it.noname?cardsNoName(it.img,it.big):cardsHtml(it.img,it.big));
  var order=it.keep?it.o.map(function(_,i){return i;}):shuf(it.o.map(function(_,i){return i;}));
  var box=el('div',{cls:'opts'});var done=false;var btns=[];
  function answer(idx){
    if(done)return;done=true;clearInterval(S.tm);
    var ok=idx===it.a;result(ok,it);
    btns.forEach(function(b){var j=+b.dataset.i;if(j===it.a)b.classList.add('ok');else if(j===idx)b.classList.add('bad');});
    fb(w,ok,it.e,idx===-1?'Время вышло.':null);
  }
  order.forEach(function(i){var b=el('button',{cls:'opt','data-i':i,on:{click:function(){answer(i);}}},esc(it.o[i]));btns.push(b);box.appendChild(b);});
  w.appendChild(box);
  if(S.t.timer)timer(w,S.t.timer,function(){answer(-1);});
},
tf:function(w,it){
  w.appendChild(el('div',{cls:'small'},esc(S.t.tfq||'Верно или неверно?')));
  if(it.img)w.insertAdjacentHTML('beforeend',cardsHtml(it.img));
  w.appendChild(el('div',{cls:'q'},esc(it.s)));
  var box=el('div',{cls:'opts'});var done=false;var bs=[];
  [[true,it.yes||'Верно'],[false,it.no||'Неверно']].forEach(function(p){
    var b=el('button',{cls:'opt',on:{click:function(){if(done)return;done=true;clearInterval(S.tm);var ok=p[0]===it.a;result(ok,it);b.classList.add(ok?'ok':'bad');if(!ok)bs.forEach(function(x){if(x!==b)x.classList.add('ok');});fb(w,ok,it.e);}}},esc(p[1]));bs.push(b);box.appendChild(b);});
  w.appendChild(box);
  if(S.t.timer)timer(w,S.t.timer,function(){if(done)return;done=true;result(false,it);fb(w,false,it.e,'Время вышло.');});
},
fill:function(w,it){
  w.appendChild(el('div',{cls:'q'},esc(it.q)));
  if(it.story)w.insertBefore(el('div',{cls:'story'},esc(it.story)),w.lastChild);
  if(it.img)w.insertAdjacentHTML('beforeend',it.noname?cardsNoName(it.img,it.big):cardsHtml(it.img));
  var inp=el('input',{cls:'inp',type:'text',placeholder:'Ваш ответ'});w.appendChild(inp);
  var done=false;
  function check(){if(done)return;done=true;function nz(x){return String(x).toLowerCase().replace(/ё/g,'е').replace(/[«»"'.,!?()–-]/g,' ').replace(/\s+/g,' ').trim();}var v=nz(inp.value);var acc=[].concat(it.a).map(nz);var ok=acc.indexOf(v)>=0;result(ok,it);fb(w,ok,(ok?'':'Правильный ответ: '+[].concat(it.a)[0]+'. ')+(it.e||''));}
  inp.addEventListener('keydown',function(e){if(e.key==='Enter')check();});
  w.appendChild(el('div',{},'')).appendChild(el('button',{cls:'btn',on:{click:check}},'Проверить'));
  inp.focus();
},
sort:function(w,it){
  w.appendChild(el('div',{cls:'q'},esc(it.q||'Разложите по группам: нажмите на карточку, затем на группу.')));
  var sel=null;var place={};
  var chips=el('div',{cls:'chips'});
  var items=shuf(it.items.map(function(x,i){x._i=i;return x;}));
  function chipHtml(x){var hide=x.hide||it.hide;var im=x.img?'<img src="'+DECK.img(x.img.replace(/r$/,''))+'" style="'+(hide?'width:78px;':'')+(/r$/.test(x.img)?'transform:rotate(180deg)':'')+'">':'';if(hide&&im)im='<div class="mask" style="width:78px">'+im+'</div>';return im+(x.t?esc(x.t):(x.img&&!hide?esc(DECK.name(x.img)):''));}
  var chipEls={};
  items.forEach(function(x){var c=el('div',{cls:'chip',on:{click:function(){if(sel)sel.classList.remove('sel');sel=c;c.classList.add('sel');}}},chipHtml(x));c._x=x;chipEls[x._i]=c;chips.appendChild(c);});
  w.appendChild(chips);
  var bk=el('div',{cls:'buckets'});var bEls=[];
  it.buckets.forEach(function(name,bi){var b=el('div',{cls:'bucket',on:{click:function(){if(!sel)return;b.appendChild(sel);place[sel._x._i]=bi;sel.classList.remove('sel');sel=null;}}},'<h4>'+esc(name)+'</h4>');bEls.push(b);bk.appendChild(b);});
  w.appendChild(bk);
  var done=false;
  var cb=el('button',{cls:'btn',on:{click:function(){
    if(done)return;
    if(Object.keys(place).length<items.length){alertBox(w,'Разложите все карточки.');return;}
    done=true;var bad=0;items.forEach(function(x){var c=chipEls[x._i];if(place[x._i]===x.b)c.classList.add('ok');else{c.classList.add('bad');bad++;c.title='Правильно: '+it.buckets[x.b];c.insertAdjacentHTML('beforeend',' <span class="small">→ '+esc(it.buckets[x.b])+(x.img&&(x.hide||it.hide)?' ('+esc(DECK.name(x.img))+')':'')+'</span>');}});
    var ok=bad===0;result(ok,it);fb(w,ok,(ok?'Всё разложено верно.':'Ошибок: '+bad+'. Неверные карточки отмечены, рядом показана правильная группа.')+(it.e?' '+it.e:''));
  }}},'Проверить');
  w.appendChild(el('div',{},'')).appendChild(cb);
},
order:function(w,it){
  w.appendChild(el('div',{cls:'q'},esc(it.q||'Расставьте по порядку: нажимайте на пункты в правильной последовательности.')));
  var seq=[];var box=el('div',{cls:'opts'});var out=el('ol',{});
  var done=false;
  shuf(it.items.map(function(x,i){return i;})).forEach(function(i){
    var b=el('button',{cls:'opt',on:{click:function(){if(done||b.disabled)return;b.disabled=true;b.classList.add('sel');seq.push(i);out.appendChild(el('li',{},esc(it.items[i])));if(seq.length===it.items.length)check();}}},esc(it.items[i]));box.appendChild(b);
  });
  w.appendChild(box);w.appendChild(out);
  var rb=el('button',{cls:'btn ghost',on:{click:function(){if(done)return;seq=[];out.innerHTML='';[].forEach.call(box.children,function(b){b.disabled=false;b.classList.remove('sel');});}}},'Сбросить');
  w.appendChild(el('div',{},'')).appendChild(rb);
  function check(){done=true;var ok=seq.every(function(v,i){return v===i;});result(ok,it);fb(w,ok,it.e?(ok?it.e:'Правильный порядок:\n'+it.e):(ok?'':'Правильный порядок: '+it.items.join(' → ')));}
},
match:function(w,it){
  w.appendChild(el('div',{cls:'q'},esc(it.q||'Соедините пары: выберите элемент слева, затем справа.')));
  var m=el('div',{cls:'match'});var lc=el('div',{cls:'col'}),rc=el('div',{cls:'col'});m.appendChild(lc);m.appendChild(rc);
  var selL=null;var got={};var done=false;
  function lab(s){return /^#/.test(s)?cardsHtml([s.slice(1)]):esc(s);}
  var lEls=[],rEls=[];
  shuf(it.pairs.map(function(p,i){return i;})).forEach(function(i){var b=el('button',{cls:'opt',on:{click:function(){if(done||got.hasOwnProperty('L'+i))return;lEls.forEach(function(x){x.classList.remove('sel');});selL=i;b.classList.add('sel');}}},lab(it.pairs[i][0]));b._i=i;lEls.push(b);lc.appendChild(b);});
  shuf(it.pairs.map(function(p,i){return i;})).forEach(function(i){var b=el('button',{cls:'opt',on:{click:function(){if(done||selL===null||b._used)return;b._used=true;got['L'+selL]=i;b.classList.add('sel');b.insertAdjacentHTML('afterbegin','<b>'+(Object.keys(got).length)+'.</b> ');lEls.forEach(function(x){if(x._i===selL){x.classList.remove('sel');x.disabled=true;x.insertAdjacentHTML('afterbegin','<b>'+(Object.keys(got).length)+'.</b> ');}});selL=null;if(Object.keys(got).length===it.pairs.length)check();}}},lab(it.pairs[i][1]));b._i=i;rEls.push(b);rc.appendChild(b);});
  w.appendChild(m);
  function check(){done=true;var bad=0;it.pairs.forEach(function(p,i){if(got['L'+i]!==i)bad++;});var ok=bad===0;result(ok,it);
    var e=(ok?'':'Ошибок: '+bad+'. Правильные пары:\n'+it.pairs.map(function(p){return (/^#/.test(p[0])?DECK.name(p[0].slice(1)):p[0])+' → '+p[1];}).join('\n'))+(it.e?'\n'+it.e:'');fb(w,ok,e);}
},
flash:function(w,it){
  var f=el('div',{cls:'flash'});var shown=false;
  f.innerHTML=(it.img?cardsHtml([it.img],true).replace('class="cards big"','class="cards big" style="justify-content:center"'):'')+'<div class="q">'+esc(it.front||'')+'</div><div class="back" style="display:none">'+esc(it.back).replace(/\n/g,'<br>')+'</div><div class="small">Сначала вспомните сами, потом нажмите на карточку.</div>';
  if(!it.showName)f.querySelectorAll('figcaption').forEach(function(x){x.textContent='';});
  w.appendChild(f);
  var row=el('div',{});
  f.addEventListener('click',function(){if(shown)return;shown=true;f.querySelector('.back').style.display='block';row.style.display='block';});
  row.style.display='none';
  row.appendChild(el('button',{cls:'btn acc',on:{click:function(){result(true,it);next();}}},'Знал'));
  row.appendChild(el('button',{cls:'btn ghost',on:{click:function(){result(false,it);next();}}},'Не вспомнил'));
  w.appendChild(row);
},
case:function(w,it){
  if(it.story)w.appendChild(el('div',{cls:'story'},esc(it.story)));
  if(it.img)w.insertAdjacentHTML('beforeend',cardsHtml(it.img,true));
  if(it.pos)w.appendChild(el('div',{cls:'small'},esc(it.pos)));
  w.appendChild(el('div',{cls:'q'},esc(it.q||'Как вы прочитаете?')));
  var ta=el('textarea',{cls:'inp',placeholder:'Сначала напишите своё толкование (по желанию), потом выберите вариант.'});w.appendChild(ta);
  if(it.o){MODES.mcq(w,{q:'',o:it.o,a:it.a,e:(it.e||'')+(it.model?'\nОбразец ответа: '+it.model:'')});}
  else{var b=el('button',{cls:'btn acc',on:{click:function(){b.disabled=true;fb(w,null,'Образец ответа: '+it.model+(it.e?'\n'+it.e:''));var r=el('div',{});r.appendChild(el('span',{cls:'small'},'Сравните со своим ответом: '));r.appendChild(el('button',{cls:'btn ghost',on:{click:function(){result(true,it);next();}}},'Совпало по сути'));r.appendChild(el('button',{cls:'btn ghost',on:{click:function(){result(false,it);next();}}},'Не совпало'));w.appendChild(r);w.querySelectorAll('.btn.acc').forEach(function(x){if(x.textContent.indexOf('Дальше')===0||x.textContent==='Итоги')x.remove();});}}},'Показать разбор');w.appendChild(b);}
},
spread:function(w,it){
  if(it.story)w.appendChild(el('div',{cls:'story'},esc(it.story)));
  w.appendChild(el('div',{cls:'q'},esc(it.q||'Прочитайте каждую позицию, запишите толкование, затем откройте подсказку.')));
  it.cards.forEach(function(cid,i){
    var p=el('div',{cls:'pos'});var r=/r$/.test(cid);var b=r?cid.slice(0,-1):cid;
    p.innerHTML='<h4>'+(i+1)+'. '+esc(it.positions[i])+'</h4><div class="row"><img src="'+DECK.img(b)+'" style="'+(r?'transform:rotate(180deg)':'')+'"><div style="flex:1"><b>'+esc(DECK.name(cid))+'</b><textarea class="inp" placeholder="Ваше толкование в этой позиции"></textarea><button class="btn ghost">Подсказка</button><div class="hint">'+esc(it.hints[i]||'')+'</div></div></div>';
    p.querySelector('button').addEventListener('click',function(){p.querySelector('.hint').classList.add('on');});
    w.appendChild(p);
  });
  if(it.summary){var sb=el('button',{cls:'btn ghost',on:{click:function(){sb.disabled=true;w.insertBefore(el('div',{cls:'fb'},esc(it.summary)),nb);}}},'Подсказка к общему выводу');w.appendChild(sb);}
  w.appendChild(el('textarea',{cls:'inp',placeholder:'Общий вывод по раскладу'}));
  var nb=el('div',{});
  nb.appendChild(el('button',{cls:'btn acc',on:{click:function(){result(true,it);next();}}},'Готово, следующий расклад'));
  w.appendChild(nb);
}
};
function alertBox(w,msg){var a=el('div',{cls:'fb'},'<b class="bad">'+esc(msg)+'</b>');w.appendChild(a);setTimeout(function(){a.remove();},2500);}
function finish(){
  app.innerHTML='';var w=el('div',{cls:'wrap'});app.appendChild(w);
  var pct=S.items.length?Math.round(100*S.ok/S.items.length):0;
  var key=L.key+'_'+S.t.id;var best=store(key);if(best==null||pct>best)store(key,pct);if(S.t.onFinish)S.t.onFinish(pct);
  w.innerHTML='<div class="top"><h2>'+esc(S.t.title)+': итог</h2></div><div class="q">Верно '+S.ok+' из '+S.items.length+' ('+pct+'%).</div><p>'+(pct>=95?'Отлично: материал усвоен уверенно.':pct>=85?'Хорошо: порог пройден. Прорешайте ошибки, чтобы закрепить.':'Пока ниже порога 85%. Повторите главу урока и пройдите раунд ещё раз.')+'</p>'+(S.t.exam?'<p><b>'+(pct>=85?'Экзамен сдан.':'Экзамен не сдан.')+'</b> Ошибки сохранены в тренажёр «Мои ошибки».</p>':'');
  var row=el('div',{});
  row.appendChild(el('button',{cls:'btn acc',on:{click:function(){start(S.ti);}}},'Новый раунд'));
  if(S.wrong.length&&S.t.mode!=='spread'){var wr=S.wrong.slice();row.appendChild(el('button',{cls:'btn',on:{click:function(){start(S.ti,wr);}}},'Прорешать ошибки ('+wr.length+')'));}
  row.appendChild(el('button',{cls:'btn ghost',on:{click:home}},'К тренажёрам'));
  w.appendChild(row);
  if(S.wrong.length&&S.t.mode!=='spread'&&S.t.mode!=='flash'){
    var rv=el('div',{cls:'review'},'<h3>Разбор ошибок</h3>');
    S.wrong.forEach(function(it){var t=it.q||it.s||it.story||'';rv.appendChild(el('div',{cls:'it'},'<b>'+esc(t)+'</b>'+(it.o&&it.a!=null?'<br>Правильно: '+esc(it.o[it.a]):'')+(it.e?'<br>'+esc(it.e):'')+(it.model?'<br>Образец: '+esc(it.model):'')));});
    w.appendChild(rv);
  }
}
function route(){var m=/^#L\d+\/t(\d+)$/.exec(location.hash);if(m&&L.trainers[+m[1]-1]){start(+m[1]-1);}else home();}
if(window.EXTMODES)window.EXTMODES(MODES,{el:el,esc:esc,result:result,fb:fb,next:next,cardsHtml:cardsHtml,cardsNoName:cardsNoName,S:function(){return S;},shuf:shuf,timer:timer});
window.ENG={el:el,esc:esc,store:store,result:result,fb:fb,next:next,cardsHtml:cardsHtml,cardsNoName:cardsNoName,MODES:MODES,S:function(){return S;}};
document.title='Урок '+LN+'. '+L.title+' · Тренажёры Occulteria';
route();
};
