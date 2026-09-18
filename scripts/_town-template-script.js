// MOBILE NAV
(function(){
  function lockBodyScroll(){
    var y = window.scrollY;
    document.body.dataset.scrollY = y;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + y + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }
  function unlockBodyScroll(){
    var y = parseInt(document.body.dataset.scrollY || '0', 10);
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, y);
  }

  var burger = document.getElementById('navBurger');
  var menu   = document.getElementById('mobileMenu');
  if(!burger||!menu) return;
  function setOpen(open){
    burger.classList.toggle('open',open);
    menu.classList.toggle('open',open);
    burger.setAttribute('aria-expanded',open?'true':'false');
    burger.setAttribute('aria-label',open?'Close menu':'Menu');
    if(open){lockBodyScroll()}else{unlockBodyScroll()}
  }
  burger.setAttribute('aria-expanded','false');
  burger.addEventListener('click',function(e){
    e.stopPropagation();
    setOpen(!menu.classList.contains('open'));
  });
  // tapping the empty part of the overlay closes it too
  menu.addEventListener('click',function(e){
    if(e.target===menu||e.target.classList.contains('mobile-menu-scroll')) setOpen(false);
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&menu.classList.contains('open')) setOpen(false);
  });
  var av=document.getElementById('mAvToggle'),sub=document.getElementById('mAvSub');
  if(av&&sub){av.addEventListener('click',function(e){e.stopPropagation();av.classList.toggle('open');sub.classList.toggle('open');});}
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click',function(){ setOpen(false) });
  });
})();
