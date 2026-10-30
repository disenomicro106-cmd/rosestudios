
(function(){
var D={
en:{'nav.collection':'Collection','nav.lookbook':'Lookbook','nav.about':'About','nav.contact':'Contact',
'h.l1':'Fall–Winter 2026','h.l2':'Cut, knitted and finished in small runs.','h.r1':'M-01 Denim Jacket','h.r2':'Hand-knitted red sleeves','h.r3':'One of one. Made to order.','h.cta':'Order the M-01',
'f.tag':'Clothes made once, for one person.','f.nl':'Get first access to every drop.','f.ph':'Your email','f.btn':'Subscribe','f.ok':'You’re on the list.',
'f.shop':'Shop','f.s1':'M-01 Denim Jacket','f.s2':'FW26 Collection','f.s3':'Made to order','f.help':'Help','f.h1':'Sizing','f.h2':'Shipping','f.h3':'Care','f.follow':'Follow',
'f.copy':'©2026 Rose Studios. All rights reserved.','f.priv':'Privacy','f.terms':'Terms','a.lang':'Change language','a.fs':'Toggle full screen','a.th':'Toggle light and dark mode','a.menu':'Open menu','a.close':'Close menu'},
es:{'nav.collection':'Colección','nav.lookbook':'Lookbook','nav.about':'Nosotros','nav.contact':'Contacto',
'h.l1':'Otoño–Invierno 2026','h.l2':'Cortado, tejido y terminado en series pequeñas.','h.r1':'Chaqueta de denim M-01','h.r2':'Mangas rojas tejidas a mano','h.r3':'Pieza única. Hecha por encargo.','h.cta':'Pide la M-01',
'f.tag':'Ropa hecha una sola vez, para una sola persona.','f.nl':'Entérate primero de cada lanzamiento.','f.ph':'Tu correo','f.btn':'Suscribirme','f.ok':'Ya estás en la lista.',
'f.shop':'Tienda','f.s1':'Chaqueta de denim M-01','f.s2':'Colección FW26','f.s3':'Por encargo','f.help':'Ayuda','f.h1':'Tallas','f.h2':'Envíos','f.h3':'Cuidado','f.follow':'Síguenos',
'f.copy':'©2026 Rose Studios. Todos los derechos reservados.','f.priv':'Privacidad','f.terms':'Términos','a.lang':'Cambiar idioma','a.fs':'Pantalla completa','a.th':'Cambiar entre modo claro y oscuro','a.menu':'Abrir menú','a.close':'Cerrar menú'}};
var root=document.documentElement,L='en',T='dark',g=window.gsap;
try{L=localStorage.getItem('rose-lang')||'en';T=localStorage.getItem('rose-theme')||'dark'}catch(e){}
L=L==='es'?'es':'en';T=T==='light'?'light':'dark';
function $(s){return Array.prototype.slice.call(document.querySelectorAll(s))}
var burger=$('#bBg')[0],menu=$('#menu')[0],open=false,menuSettings=$('.menu-settings')[0],ctl=$('.ctl')[0],langBtn=$('#bLang')[0],themeBtn=$('#bTh')[0],fsb=$('#bFs')[0],media=matchMedia('(max-width:860px)'),previousOverflow='';
function save(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function apply(){
  root.lang=L;
  $('[data-i18n]').forEach(function(e){e.textContent=D[L][e.getAttribute('data-i18n')]});
  $('[data-i18n-ph]').forEach(function(e){e.placeholder=D[L][e.getAttribute('data-i18n-ph')]});
  $('[data-i18n-aria]').forEach(function(e){e.setAttribute('aria-label',D[L][e.getAttribute('data-i18n-aria')])});
  $('#bLang span').forEach(function(s){s.classList.toggle('on',s.getAttribute('data-l')===L)});
  burger.setAttribute('aria-label',D[L][open?'a.close':'a.menu']);
}
root.setAttribute('data-theme',T);apply();
langBtn.onclick=function(){
  L=L==='en'?'es':'en';save('rose-lang',L);
  if(!g){apply();return}
  var els=$('[data-i18n]');
  g.to(els,{opacity:0,duration:.2,onComplete:function(){apply();g.to(els,{opacity:1,duration:.4})}});
};
themeBtn.onclick=function(){
  T=T==='dark'?'light':'dark';save('rose-theme',T);root.setAttribute('data-theme',T);
  if(g)g.fromTo('#bTh svg',{rotate:-90,scale:.6},{rotate:0,scale:1,duration:.55,ease:'back.out(2)'});
};
if(!(root.requestFullscreen||root.webkitRequestFullscreen))fsb.style.display='none';
fsb.onclick=function(){
  try{
    if(document.fullscreenElement||document.webkitFullscreenElement){var exit=document.exitFullscreen||document.webkitExitFullscreen;if(exit)exit.call(document)}
    else{var enter=root.requestFullscreen||root.webkitRequestFullscreen;if(enter)enter.call(root)}
  }catch(e){}
};
document.addEventListener('fullscreenchange',function(){root.classList.toggle('fs',!!(document.fullscreenElement||document.webkitFullscreenElement))});
document.addEventListener('webkitfullscreenchange',function(){root.classList.toggle('fs',!!(document.fullscreenElement||document.webkitFullscreenElement))});
function placeMenuControls(){
  if(media.matches){menuSettings.appendChild(langBtn);menuSettings.appendChild(themeBtn)}
  else{ctl.insertBefore(langBtn,fsb);ctl.insertBefore(themeBtn,burger)}
}
placeMenuControls();
function toggleMenu(){
  open=!open;
  burger.setAttribute('aria-expanded',String(open));
  burger.setAttribute('aria-label',D[L][open?'a.close':'a.menu']);
  menu.setAttribute('aria-hidden',String(!open));
  root.classList.toggle('menu-open',open);
  if(open){
    previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';menu.style.display='flex';
    if(g){g.fromTo(menu,{opacity:0},{opacity:1,duration:.35});g.from('#menu a',{y:40,opacity:0,stagger:.07,duration:.6,ease:'power3.out',delay:.1})}
  }else{
    document.body.style.overflow=previousOverflow;
    if(g){g.to(menu,{opacity:0,duration:.25,onComplete:function(){menu.style.display='none'}})}else{menu.style.display='none'}
  }
}
burger.onclick=toggleMenu;
function handleMediaChange(){
  placeMenuControls();
  if(open&&!media.matches)toggleMenu();
}
if(media.addEventListener)media.addEventListener('change',handleMediaChange);
else if(media.addListener)media.addListener(handleMediaChange);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&open)toggleMenu()});
$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){
  e.preventDefault();
  if(open)toggleMenu();
  var h=a.getAttribute('href');
  if(h==='#contact'){document.getElementById('contact').scrollIntoView({behavior:'smooth'})}
  else{window.scrollTo({top:0,behavior:'smooth'})}
})});
var nl=$('#nl')[0];
nl.addEventListener('submit',function(e){
  e.preventDefault();
  nl.innerHTML='<p data-i18n="f.ok" style="margin:0;font-weight:500"></p>';apply();
  if(g)g.from(nl.firstChild,{opacity:0,y:10,duration:.6,ease:'power3.out'});
});
new IntersectionObserver(function(en){window.__vis=en[0].isIntersecting},{threshold:0}).observe(document.getElementById('hero'));
if(g&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  g.from('.hdr > *',{y:-18,opacity:0,duration:1,ease:'power3.out',stagger:.12,delay:.9});
  g.from('.meta p,.meta .cta',{opacity:0,y:14,duration:1,ease:'power3.out',stagger:.12,delay:1.6});
  if(window.ScrollTrigger){
    g.registerPlugin(ScrollTrigger);
    g.from('.ft-top > *,.ft-cols > div',{y:36,opacity:0,duration:.9,ease:'power3.out',stagger:.1,scrollTrigger:{trigger:'.ft',start:'top 80%'}});
    g.from('.ft-word img',{yPercent:35,opacity:0,duration:1.4,ease:'power3.out',scrollTrigger:{trigger:'.ft-word',start:'top 95%'}});
  }
}
})();
