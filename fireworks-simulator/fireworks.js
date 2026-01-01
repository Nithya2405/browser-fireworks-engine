const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

let rockets = [];
let particles = [];
let stars = [];

// ---------- BACKGROUND STARS ----------
for(let i=0;i<200;i++){
  stars.push({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    r:Math.random()*1.5,
    alpha: Math.random(),
    blink: Math.random()*0.02 + 0.005
  });
}

// ---------- SOUND (NO FILE NEEDED) ----------
function boomSound(){
  const ctxAudio = new AudioContext();
  const osc = ctxAudio.createOscillator();
  const gain = ctxAudio.createGain();
  osc.type = "triangle";
  osc.frequency.value = 120;
  gain.gain.value = 0.1;
  osc.connect(gain); gain.connect(ctxAudio.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.00001, ctxAudio.currentTime+1.5);
  osc.stop(ctxAudio.currentTime+1.5);
}

// ---------- ROCKET ----------
class Rocket{
  constructor(x,dir){
    this.x=x;
    this.y=canvas.height;
    this.vx=dir*2;
    this.vy=-Math.random()*8-10;
    this.color=`hsl(${Math.random()*360},100%,70%)`;
    this.explodeY=Math.random()*canvas.height/2+120;
  }
  update(){
    this.x+=this.vx;
    this.y+=this.vy;
    this.vy+=0.12;
    particles.push(new Spark(this.x,this.y,this.color,true));
    if(this.y<this.explodeY) this.explode();
  }
  explode(){
    boomSound();
    const shape=Math.random()<0.5?"star":"heart";
    for(let i=0;i<120;i++){
      particles.push(new Spark(this.x,this.y,this.color,false,shape));
    }
    this.dead=true;
  }
}

// ---------- SPARK ----------
class Spark{
  constructor(x,y,color,trail,shape){
    this.x=x; this.y=y;
    this.life=trail?30:100;
    this.trail=trail;
    this.shape=shape;
    const a=Math.random()*Math.PI*2;
    const s=trail?Math.random()*0.8:Math.random()*4+1;
    this.vx=Math.cos(a)*s;
    this.vy=Math.sin(a)*s;
    this.color=color;
  }
  update(){
    this.x+=this.vx;
    this.y+=this.vy;
    this.vy+=0.05;
    this.life--;
  }
  draw(){
    ctx.globalAlpha=this.life/100;
    ctx.fillStyle=this.color;
    ctx.beginPath();
    if(this.shape=="heart"){
      ctx.arc(this.x,this.y,2,0,Math.PI*2);
      ctx.arc(this.x+3,this.y,2,0,Math.PI*2);
      ctx.lineTo(this.x+1.5,this.y+4);
    }else{
      ctx.arc(this.x,this.y,1.5,0,Math.PI*2);
    }
    ctx.fill();
    ctx.globalAlpha=1;
  }
}

// ---------- CLICK FIREWORKS ----------
addEventListener("click",()=>{
  for(let i=0;i<Math.random()*3+5;i++){
    rockets.push(new Rocket(Math.random()*canvas.width,(Math.random()-0.5)*3));
  }
});

// ---------- ENGINE LOOP ----------
function loop(){
  ctx.fillStyle="black";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // draw stars
  ctx.fillStyle="white";
  stars.forEach(s=>ctx.fillRect(s.x,s.y,s.r,s.r));

  rockets.forEach(r=>r.update());
  rockets=rockets.filter(r=>!r.dead);

  particles.forEach(p=>{p.update(); p.draw();});
  particles=particles.filter(p=>p.life>0);

  requestAnimationFrame(loop);
}
loop();
