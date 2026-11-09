window.EXTMODES=function(M,H){var el=H.el,esc=H.esc;
M.multi=function(w,it){
  if(it.story)w.appendChild(el('div',{cls:'story'},esc(it.story)));
  w.appendChild(el('div',{cls:'q'},esc(it.q)));
  if(it.img)w.insertAdjacentHTML('beforeend',it.noname?H.cardsNoName(it.img):H.cardsHtml(it.img));
  w.appendChild(el('div',{cls:'small'},'Отметьте все подходящие варианты, затем нажмите «Проверить».'));
  var box=el('div',{cls:'opts'});var sel={};var done=false;var bs=[];
  H.shuf(it.o.map(function(_,i){return i;})).forEach(function(i){var b=el('button',{cls:'opt chk',on:{click:function(){if(done)return;sel[i]=!sel[i];b.classList.toggle('sel',!!sel[i]);}}},esc(it.o[i]));b._i=i;bs.push(b);box.appendChild(b);});
  w.appendChild(box);
  w.appendChild(el('div',{},'')).appendChild(el('button',{cls:'btn',on:{click:function(){if(done)return;done=true;var ok=true;bs.forEach(function(b){var r=it.a.indexOf(b._i)>=0;if(r)b.classList.add('ok');else if(sel[b._i])b.classList.add('bad');if(r!==!!sel[b._i])ok=false;});H.result(ok,it);H.fb(w,ok,it.e);}}},'Проверить'));
};
M.memory=function(w,it){
  w.appendChild(el('div',{cls:'q'},esc(it.q||'Найдите пары: открывайте по две карточки.')));
  var tiles=[];it.pairs.forEach(function(p,i){tiles.push({i:i,v:p[0]});tiles.push({i:i,v:p[1]});});tiles=H.shuf(tiles);
  var g=el('div',{cls:'memo'});var open=[];var found=0;var moves=0;var lock=false;
  var info=el('div',{cls:'small'},'Ходов: 0');
  tiles.forEach(function(t){var c=el('div',{cls:'mc'});var face=/^#/.test(t.v)?'<img src="'+DECK.img(t.v.slice(1))+'">':'<span>'+esc(t.v)+'</span>';c.innerHTML='<div class="mf">'+face+'</div><div class="mb">✦</div>';
    c.addEventListener('click',function(){if(lock||c.classList.contains('up')||c.classList.contains('done'))return;c.classList.add('up');open.push([c,t]);if(open.length===2){moves++;info.textContent='Ходов: '+moves;var a=open[0],b=open[1];open=[];if(a[1].i===b[1].i){a[0].classList.add('done');b[0].classList.add('done');found++;if(found===it.pairs.length){var lim=it.pairs.length*2;var ok=moves<=lim;H.result(ok,it);H.fb(w,ok,'Все пары найдены за '+moves+' ходов. Норма: не больше '+lim+'.\n'+it.pairs.map(function(p){return (/^#/.test(p[0])?DECK.name(p[0].slice(1)):p[0])+' → '+p[1];}).join('\n'));}}else{lock=true;setTimeout(function(){a[0].classList.remove('up');b[0].classList.remove('up');lock=false;},900);}}});
    g.appendChild(c);});
  w.appendChild(g);w.appendChild(info);
};
M.deck=function(w,it){
  w.appendChild(el('div',{cls:'q'},'Перемешайте колоду и вытяните карты. Сначала прочитайте их сами, потом нажмите на карту, чтобы открыть подсказку.'));
  var q=el('textarea',{cls:'inp',placeholder:'Ваш вопрос к раскладу (по желанию)'});w.appendChild(q);
  var row=el('div',{cls:'row2'});var rev={v:false};
  var table=el('div',{cls:'cards big deckt'});var info=el('div',{cls:'fb',style:'display:none'});
  function draw(n){var ids=H.shuf(DECK.cards.map(function(c){return c.id;})).slice(0,n);table.innerHTML='';info.style.display='none';
    ids.forEach(function(id,k){var r=rev.v&&Math.random()<0.3;var f=el('figure',{cls:r?'rev':''});f.innerHTML='<img src="'+DECK.img(id)+'"><figcaption>'+(k+1)+'. '+esc(DECK.name(id))+(r?' (перевёрнутая)':'')+'</figcaption>';
      f.addEventListener('click',function(){info.style.display='block';info.innerHTML='<b>'+esc(DECK.name(id))+(r?', перевёрнутая':'')+'.</b> '+esc((window.OPEN||{})[id]||'')+(r?' Перевёрнутая карта: принцип застрял, перегнулся или ушёл внутрь.':'');});table.appendChild(f);});}
  [1,3,5,10].forEach(function(n){row.appendChild(el('button',{cls:'btn ghost',on:{click:function(){draw(n);}}},n+' '+(n===1?'карта':n<5?'карты':'карт')));});
  var rb=el('button',{cls:'btn ghost',on:{click:function(){rev.v=!rev.v;rb.textContent='Перевороты: '+(rev.v?'да':'нет');}}},'Перевороты: нет');row.appendChild(rb);
  w.appendChild(row);w.appendChild(table);w.appendChild(info);
  w.appendChild(el('textarea',{cls:'inp',placeholder:'Ваше прочтение'}));
  w.appendChild(el('div',{},'')).appendChild(el('button',{cls:'btn acc',on:{click:function(){H.result(true,it);H.next();}}},'Завершить'));
  draw(3);
};
};
