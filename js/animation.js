
(function(){
var IW=2752,IH=1536,mobile=matchMedia('(max-width:680px)').matches,BASE=mobile?1:1.015,INTRO=mobile?1.07:1.14,LOGO='assets/logo.png';
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var hero=document.getElementById('hero'),stage=document.getElementById('stage'),cv=document.getElementById('cv');
var bg=document.getElementById('bg'),md=document.getElementById('md');
var W=0,H=0,S=1,zoom=reduce?BASE:INTRO,N=0;
var renderer,scene,cam,pts,pos,mix,home,vel,ph,geo,mat;
var mouse={x:-9999,y:-9999,vx:0,vy:0,on:false},par={x:0,y:0,tx:0,ty:0};

function layout(){
  var vw=hero.clientWidth,vh=hero.clientHeight;
  S=Math.max(vw/IW,vh/IH);W=IW*S;H=IH*S;
  stage.style.width=W+'px';stage.style.height=H+'px';
  stage.style.left=(vw-W)/2+'px';stage.style.top=(vh-H)/2+'px';
  if(renderer){
    var dpr=Math.min(devicePixelRatio||1,1.5);
    renderer.setPixelRatio(dpr);renderer.setSize(W,H,false);
    cv.style.width=W+'px';cv.style.height=H+'px';
    cam.right=W;cam.bottom=H;cam.updateProjectionMatrix();
    mat.uniforms.uSize.value=sizePx()*dpr;
    if(home)placeHome();
  }
}
var logoPx=[],LW=0;
function logoWidth(){
  var vw=hero.clientWidth;
  if(vw<680)return Math.min(0.586*W,vw*0.78);
  if(vw<1024)return Math.min(0.586*W,vw*0.78);
  return 0.586*W;
}
function sizePx(){return Math.max(1.65,Math.min(3.1,logoWidth()/1024*2.6))}
function placeHome(){
  var vw=hero.clientWidth,vh=hero.clientHeight,lw=logoWidth(),lh=lw*530/1358;
  var logoY=vw<680?.25:.31;
  var cx=vw/2-(parseFloat(stage.style.left)||0),cy=vh*logoY-(parseFloat(stage.style.top)||0);
  for(var i=0;i<N;i++){
    home[i*2]=cx-lw/2+logoPx[i*2]*lw;
    home[i*2+1]=cy-lh/2+logoPx[i*2+1]*lh;
  }
}
function sample(img){
  var w=Math.min(1060,Math.max(700,Math.round((window.innerWidth||1200)*.82))),h=Math.round(w*img.height/img.width),c=document.createElement('canvas');
  c.width=w;c.height=h;var x=c.getContext('2d');x.drawImage(img,0,0,w,h);
  var d=x.getImageData(0,0,w,h).data,arr=[];
  for(var j=0;j<h;j++)for(var i=0;i<w;i++){
    if(d[(j*w+i)*4+3]>42){arr.push((i+.5+(Math.random()-.5)*1.1)/w,(j+.5+(Math.random()-.5)*1.1)/h)}
  }
  return arr;
}
function build(img){
  logoPx=sample(img);N=logoPx.length/2;
  home=new Float32Array(N*2);pos=new Float32Array(N*3);vel=new Float32Array(N*2);
  mix=new Float32Array(N);ph=new Float32Array(N);
  renderer=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:false});
  renderer.setClearColor(0x000000,0);
  scene=new THREE.Scene();cam=new THREE.OrthographicCamera(0,1,0,1,-1,1);
  geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aMix',new THREE.BufferAttribute(mix,1).setUsage(THREE.DynamicDrawUsage));
  mat=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,
    uniforms:{uSize:{value:3},uAlpha:{value:0}},
    vertexShader:'attribute float aMix;varying float vM;uniform float uSize;void main(){vM=aMix;gl_PointSize=uSize*(1.0-.25*aMix);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'varying float vM;uniform float uAlpha;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=smoothstep(.5,.26,d);vec3 c=mix(vec3(.647,0.,.094),vec3(1.,.36,.43),vM);gl_FragColor=vec4(c,a*uAlpha*(1.-.4*vM));}'});
  pts=new THREE.Points(geo,mat);pts.frustumCulled=false;scene.add(pts);
  layout();
  var sp=Math.max(W,H)*.14;
  for(var i=0;i<N;i++){
    ph[i]=Math.random()*6.283;
    pos[i*3]=home[i*2]+(Math.random()-.5)*sp*2;
    pos[i*3+1]=home[i*2+1]+(Math.random()-.5)*sp*2;
    if(reduce){pos[i*3]=home[i*2];pos[i*3+1]=home[i*2+1]}
  }
}
var last=0,t0=0;
function frame(t){
  requestAnimationFrame(frame);
  if(!renderer||window.__vis===false)return;
  if(!t0)t0=t;
  var dt=Math.min((t-last)/16.667,3)||1;last=t;var el=(t-t0)/1000;
  // zoom de entrada
  if(!reduce&&el<3.4){var k=1-Math.pow(1-el/3.4,3);zoom=INTRO+(BASE-INTRO)*k;}else zoom=BASE;
  mat.uniforms.uAlpha.value=reduce?1:Math.min(1,el/1.4);
  // parallax suave
  par.x+=(par.tx-par.x)*.05*dt;par.y+=(par.ty-par.y)*.05*dt;
  var m=0;
  stage.style.transform='scale('+zoom+')';
  bg.style.transform='translate('+(-par.x*8*m)+'px,'+(-par.y*6*m)+'px)';
  cv.style.transform='translate('+(par.x*14*m)+'px,'+(par.y*10*m)+'px)';
  md.style.transform='translate('+(par.x*24*m)+'px,'+(par.y*16*m)+'px)';
  // simulación de partículas (agua: fuerza suave, arrastre, retorno lento)
  var sc=W/1920,R=150*sc,R2=R*R,push=1.5*sc,swirl=.8*sc,mvk=.05;
  var mx=mouse.x,my=mouse.y,on=mouse.on;
  var spring=.0032,damp=Math.pow(.93,dt),wob=.38*sc,tt=el*.7;
  for(var i=0;i<N;i++){
    var ix=i*3,px=pos[ix],py=pos[ix+1],vx=vel[i*2],vy=vel[i*2+1];
    var hx=home[i*2]+Math.sin(tt+ph[i])*wob,hy=home[i*2+1]+Math.cos(tt*.9+ph[i]*1.3)*wob;
    vx+=(hx-px)*spring*dt;vy+=(hy-py)*spring*dt;
    if(on){
      var dx=px-mx,dy=py-my,d2=dx*dx+dy*dy;
      if(d2<R2){
        var d=Math.sqrt(d2)+.001,f=1-d/R;f=f*f*(3-2*f);
        vx+=(dx/d*push-dy/d*swirl+mouse.vx*mvk*sc)*f*dt;
        vy+=(dy/d*push+dx/d*swirl+mouse.vy*mvk*sc)*f*dt;
      }
    }
    vx*=damp;vy*=damp;px+=vx*dt;py+=vy*dt;
    pos[ix]=px;pos[ix+1]=py;vel[i*2]=vx;vel[i*2+1]=vy;
    var ox=px-home[i*2],oy=py-home[i*2+1],o=Math.sqrt(ox*ox+oy*oy)/(60*sc);
    mix[i]=o>1?1:o;
  }
  mouse.vx*=.8;mouse.vy*=.8;
  geo.attributes.position.needsUpdate=true;geo.attributes.aMix.needsUpdate=true;
  renderer.render(scene,cam);
}
function move(e){
  var r=cv.getBoundingClientRect();if(!r.width)return;
  var nx=(e.clientX-r.left)/r.width*W,ny=(e.clientY-r.top)/r.height*H;
  if(mouse.on){mouse.vx=nx-mouse.x;mouse.vy=ny-mouse.y}
  mouse.x=nx;mouse.y=ny;mouse.on=true;
  par.tx=e.clientX/innerWidth*2-1;par.ty=e.clientY/innerHeight*2-1;
}
addEventListener('pointermove',move,{passive:true});
addEventListener('pointerdown',move,{passive:true});
document.addEventListener('pointerleave',function(){mouse.on=false;par.tx=0;par.ty=0});
addEventListener('pointerup',function(e){if(e.pointerType!=='mouse'){mouse.on=false}});
addEventListener('resize',layout);
layout();
var li=new Image();
li.onload=function(){
  var ready=0;function go(){if(++ready<2)return;build(li);hero.classList.add('on');requestAnimationFrame(frame)}
  (bg.decode?bg.decode():Promise.resolve()).catch(function(){}).then(go);
  (md.decode?md.decode():Promise.resolve()).catch(function(){}).then(go);
};
li.src=LOGO;[].forEach.call(document.querySelectorAll('.logo-img'),function(i){i.src=LOGO});
})();
