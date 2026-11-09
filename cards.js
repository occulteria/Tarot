/* Колода Райдера: базовые сведения о 78 картах */
(function(){
  var MAJ=['Дурак','Маг','Верховная Жрица','Императрица','Император','Иерофант','Влюблённые','Колесница','Сила','Отшельник','Колесо Фортуны','Правосудие','Повешенный','Смерть','Умеренность','Дьявол','Башня','Звезда','Луна','Солнце','Суд','Мир'];
  var ROM=['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];
  var RANK=['Туз','Двойка','Тройка','Четвёрка','Пятёрка','Шестёрка','Семёрка','Восьмёрка','Девятка','Десятка','Паж','Рыцарь','Королева','Король'];
  var SUITS=[['wands','Жезлов','Жезлы','Огонь'],['cups','Кубков','Кубки','Вода'],['swords','Мечей','Мечи','Воздух'],['pents','Пентаклей','Пентакли','Земля']];
  var C=[];
  MAJ.forEach(function(n,i){C.push({id:'maj'+(i<10?'0':'')+i,name:n,kind:'major',num:i,rom:ROM[i]});});
  SUITS.forEach(function(s){
    for(var k=1;k<=14;k++){
      C.push({id:s[0]+(k<10?'0':'')+k,name:RANK[k-1]+' '+s[1],kind:k<=10?'pip':'court',suit:s[0],suitName:s[2],suitGen:s[1],el:s[3],num:k,rank:RANK[k-1]});
    }
  });
  var BY={};C.forEach(function(c){BY[c.id]=c;});
  window.DECK={cards:C,by:BY,MAJ:MAJ,RANK:RANK,SUITS:SUITS,
    img:function(id){return (window.CARDIMG&&CARDIMG[id])||('cards/'+id+'.jpg');},
    name:function(id){var r=id.slice(-1)==='r';var c=BY[r?id.slice(0,-1):id];return c?c.name+(r?' (перевёрнутая)':''):id;},
    majors:function(){return C.filter(function(c){return c.kind==='major';});},
    minors:function(){return C.filter(function(c){return c.kind!=='major';});},
    pips:function(){return C.filter(function(c){return c.kind==='pip';});},
    courts:function(){return C.filter(function(c){return c.kind==='court';});},
    suit:function(s){return C.filter(function(c){return c.suit===s;});}
  };
})();
window.TRU={shuf:function(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;},pick:function(a,n){return window.TRU.shuf(a).slice(0,n);}};
