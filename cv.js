'use strict'

let gx = 0.0, gy = 10.0;
let p_m = 10.0, s_k = 10.0, s_c = 10.0, s_r = 10.0;
let points = [], pins = [], springs = [];

class Point {
  constructor(name, x, y, m, color='blue', vx=0, vy=0, fx=0, fy=0) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.m = m;
    this.color = color;
    this.vx = vx;
    this.vy = vy;
    this.fx = fx;
    this.fy = fy;

    this.ks = [{}, {}, {}, {}];
  }
}

function preset1() {

}

function preset2(n = 20) {
  gy  =   50.0;
  p_m =   20.0;
  s_k = 1000.0;
  s_c =  0.0; //200.0;
  s_r =   10.0;

  points = [];
  springs = [];

  for(let i=0; i<n; ++i) {
    points.push(
      new Point(`p${i}`, 0, 50+i*10, p_m)
      //{ name: `p${i}`, x: 0, y: 50+i*20, vx: 0, vy: 0, m: p_m, fx: 0, fy: 0 }
    );
    if(i>0) {
      springs.push({
        o1: points[i-1], o2: points[i], k: s_k, c: s_c, r: s_r
      });
    }
  }

  pins = [
    { o: points[0] }
  ];

  console.log(points);
}

function preset3(n = 8, m = 6, interval = 50.0) {

  gy  =   50.0;
  p_m =   50.0;
  s_k = 1000.0;
  s_c =   50.0;
  s_r = interval;

  points = [];
  springs = [];

  for(let j=0; j<m; ++j) {
    for(let i=0; i<n; ++i) {
      const r = 0;
      const g = Math.floor(127 + 128*i/(n-1));
      const b = Math.floor(127 + 128*j/(m-1));
      points.push(
        new Point(`p${i+j*n}`, -n*(interval/2) + i*interval, 50+j*interval, p_m, `rgb(${r},${g},${b})`)
      );
    }
  }

  for(let j=0; j<m-1; ++j) {
    for(let i=0; i<n; ++i) {
      springs.push({
        o1: points[j*n+i], o2: points[(j+1)*n+i], k: s_k, c: s_c, r: s_r
      });
    }
  }

  for(let j=0; j<m; ++j) {
    for(let i=0; i<n-1; ++i) {
      springs.push({
        o1: points[j*n+i], o2: points[j*n+i+1], k: s_k, c: s_c, r: s_r
      });
    }
  }

  pins = [
    { o: points[0] },
    { o: points[n-1] },

  ];

  console.log(points);
}


var grip = null;

var fps = 60;

var t = 0.0;
var draw_t = 0.0;
var speed = 1.0;
var ht = 0.001;
var air_res = 0.0;
var ground_y = 300.0;
var ground_x = 500.0;

var mouse_x = 0;
var mouse_y = 0;

var drawoffset_x = 0;
var drawoffset_y = 0;

var point_name_visible = true;
var point_velocity_arrow_visible = false;
var point_acceleration_arrow_visible = true;

var spring_color = 'length';

function init(preset, ...args) {
  if(preset) preset(...args);

  const cv = document.getElementById('cv');

  drawoffset_x = cv.width / 2;

  cv.onmousemove = function(e) {
    mouse_x = e.clientX - drawoffset_x;
    mouse_y = e.clientY - drawoffset_y;
  };

  cv.onclick = function(e) {
    console.log('clicked');
    if(!grip) {
      let grip_ = null;
      let d = 30.0;
      for(let p of points) {
        if(Math.hypot(p.x-mouse_x, p.y-mouse_y) < d) {
          grip_ = p;
        }
      }
      grip = grip_;
    } else {
      grip = null;
    }
  };

  document.getElementById('change_g').value = gy;
  document.getElementById('change_g').onchange = function(e) {
    const gy_ = parseFloat(e.target.value);
    if(gy_!=NaN) { gy = gy_; }
  };
  document.getElementById('change_all_m').value = p_m;
  document.getElementById('change_all_m').onchange = function(e) {
    p_m = parseFloat(e.target.value);
    if(p_m==NaN) { return; }
    for(let p of points) {
      p.m = p_m;
    }
  };
  document.getElementById('change_all_r').value = s_r;
  document.getElementById('change_all_r').onchange = function(e) {
    s_r = parseFloat(e.target.value);
    if(s_r==NaN) { return; }
    for(let s of springs) {
      s.r = s_r;
    }
  };
  document.getElementById('change_all_k').value = s_k;
  document.getElementById('change_all_k').onchange = function(e) {
    s_k = parseFloat(e.target.value);
    if(s_k==NaN) { return; }
    for(let s of springs) {
      s.k = s_k;
    }
  };
  document.getElementById('change_all_c').value = s_c;
  document.getElementById('change_all_c').onchange = function(e) {
    s_c = parseFloat(e.target.value);
    if(s_c==NaN) { return; }
    for(let s of springs) {
      s.c = s_c;
    }
  };
  document.getElementById('point_acceleration_arrow_visible').checked
    = point_acceleration_arrow_visible;
  document.getElementById('point_acceleration_arrow_visible').onchange = (e) => {
    point_acceleration_arrow_visible = e.target.checked;
  }
  document.getElementById('point_name_visible').checked
    = point_name_visible;
  document.getElementById('point_name_visible').onchange = (e) => {
    point_name_visible = e.target.checked;
  }

  point_table_update();
}

function point_table_update() {
  for(let p of points) {
    var tab = document.getElementById('point_table');
    var tr = tab.appendChild(document.createElement('tr'));
    var td_name = tr.appendChild(document.createElement('td'));
    td_name.innerHTML = p.name;
    var td_fix = tr.appendChild(document.createElement('td'));
    var input_fix = td_fix.appendChild(document.createElement('input'));
    input_fix.type = 'checkbox';
  }
}

function object_update_rk() {
  for(let p of points) {
    p.ks[0].x = p.x;
    p.ks[0].y = p.y;
    p.ks[0].vx = p.vx;
    p.ks[0].vy = p.vy;
  }

  for(let i=0; i<4; ++i) {
    const j = i+1;

    for(let p of points) {
      p.ks[i].fx = 0;
      p.ks[i].fy = 0;
    }

    for(let s of springs) {
      const o1 = s.o1.ks[i];
      const o2 = s.o2.ks[i];
      const l = Math.hypot(o1.x - o2.x, o1.y - o2.y);
      const fx_k = s.k * (l - s.r) * ((o1.x - o2.x) / l);
      const fy_k = s.k * (l - s.r) * ((o1.y - o2.y) / l);
      const fx_c = s.c * (o1.vx - o2.vx);
      const fy_c = s.c * (o1.vy - o2.vy);
      const fx = fx_k + fx_c;
      const fy = fy_k + fy_c;

      o1.fx -= fx;
      o1.fy -= fy;
      o2.fx += fx;
      o2.fy += fy;
    }

    for(let p of points) {
      const pk = p.ks[i];

      pk.fx += gx * p.m;
      pk.fy += gy * p.m;

      pk.fx -= air_res * p.vx;
      pk.fy -= air_res * p.vy;
    }

    for(let pin of pins) {
      pin.o.ks[i].fx = 0.0;
      pin.o.ks[i].fy = 0.0;
    }

    if(i==0 || i==1) {
      for(let p of points) {
        const pk = p.ks[i];
        const pk_next = p.ks[j];
        pk_next.vx = p.vx + ht/2 * pk.fx / p.m;
        pk_next.vy = p.vy + ht/2 * pk.fy / p.m;
        pk_next.x  = p.x  + ht/2 * pk.vx;
        pk_next.y  = p.y  + ht/2 * pk.vy;
      }
    } else if(i==2) {
      for(let p of points) {
        const pk = p.ks[i];
        const pk_next = p.ks[j];
        pk_next.vx = p.vx + ht * pk.fx / p.m;
        pk_next.vy = p.vy + ht * pk.fy / p.m;
        pk_next.x  = p.x  + ht * pk.vx;
        pk_next.y  = p.y  + ht * pk.vy;
      }
    }

  }

  for(let p of points) {
    p.fx = (p.ks[0].fx + 2*p.ks[1].fx + 2*p.ks[2].fx + p.ks[3].fx) / 6;
    p.fy = (p.ks[0].fy + 2*p.ks[1].fy + 2*p.ks[2].fy + p.ks[3].fy) / 6;
    p.vx += ht * p.fx / p.m;
    p.vy += ht * p.fy / p.m;
    p.x  += ht * (p.ks[0].vx + 2*p.ks[1].vx + 2*p.ks[2].vx + p.ks[3].vx) / 6;
    p.y  += ht * (p.ks[0].vy + 2*p.ks[1].vy + 2*p.ks[2].vy + p.ks[3].vy) / 6;
  }

  if(grip) { // stub
    grip.vx = 0.0;
    grip.vy = 0.0;
    grip.fx = 0.0;
    grip.fy = 0.0;
    grip.x = mouse_x;
    grip.y = mouse_y;
  }

  t += ht;
}

function object_print() {
  const outs = [];

  outs.push(`t = ${t}`);
  outs.push('');

  var k = 0;
  var u_g = 0;
  for(const p of points) {
    k += p.m * (p.vx**2 + p.vy**2) / 2;
    u_g += p.m * (gx * (ground_x-p.x) + gy * (ground_y-p.y));
  }

  var u_s = 0;
  for(const s of springs) {
    const o1 = s.o1;
    const o2 = s.o2;
    const l2 = (Math.hypot(o1.x-o2.x, o1.y-o2.y) - s.r) ** 2;
    u_s += s.k * l2 / 2;
  }

  outs.push(`K         = ${k}`);
  outs.push(`U_spring  = ${u_s}`);
  outs.push(`U_gravity = ${u_g}`);
  outs.push(`E         = ${k + u_s + u_g}`);

  outs.push(`mouse     = (${mouse_x}, ${mouse_y})`);
  outs.push(`grip      = ${!!grip}`);
  document.getElementById('object').innerHTML = outs.join('<br>');
}

function anime() {
  const cv = document.getElementById('cv');
  const ctx = cv.getContext('2d');

  object_print();

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillRect(0, 0, cv.width, cv.height);

  ctx.save();
  ctx.translate(drawoffset_x, drawoffset_y);

  for(const s of springs) {
    ctx.beginPath();
    let r, g, b;
    if(spring_color == 'length') {
      const cl = 0.1 * (Math.hypot(s.o1.x - s.o2.x, s.o2.y - s.o2.y) - s.r) * s.k;
      r = Math.max(0, Math.min(255, Math.round(128 + cl)));
      b = 255 - r;
      g = 0;
    } else if(spring_color == 'average') {

    }
    ctx.strokeStyle = `rgb(${r},${g},${b})`;
    ctx.moveTo(s.o1.x, s.o1.y);
    ctx.lineTo(s.o2.x, s.o2.y);
    ctx.closePath();
    ctx.stroke();
  }

  for(const p of points) {
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.strokeStyle = p.color;
    ctx.arc(p.x, p.y, 10, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI*2, true);
    ctx.fill();
    if(point_name_visible) {
      ctx.font = '11px Courier, monospace';
      ctx.fillStyle = 'black';
      ctx.fillText(p.name, p.x+10, p.y+10);
    }
    if(point_velocity_arrow_visible) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0,0,255,0.3)";
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + 2*p.vx, p.y + 2*p.vy);
      ctx.closePath();
      ctx.stroke();
    }
    if(point_acceleration_arrow_visible) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,0,0,0.3)";
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.fx/p.m, p.y + p.fy/p.m);
      ctx.closePath();
      ctx.stroke();
    }
  }

  for(const pin of pins) {
    const o = pin.o;
    const r = 20;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(o.x-r, o.y-r);
    ctx.lineTo(o.x+r, o.y+r);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(o.x+r, o.y-r);
    ctx.lineTo(o.x-r, o.y+r);
    ctx.stroke();
  }

  ctx.restore();

  const draw_t_next = draw_t + speed/fps;
  while(t < draw_t_next) {
    object_update_rk();
  }
  draw_t = draw_t_next;

  window.requestAnimationFrame(anime);
}


init(preset3);

window.requestAnimationFrame(anime);

//window.requestAnimationFrame(anime);
//window.setInterval(anime, 1000/fps);
//object_update_rk();
