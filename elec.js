'use strict'

class Elec {
  constructor(name, x, y, q, vx = 0.0, vy = 0.0) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.q = q;
    this.vx = vx;
    this.vy = vy;

    this.ks = [{}, {}, {}, {}];
  }
}

class Wall {
  constructor(name, x1, y1, x2, y2) {
    this.name = name;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
}

let cv = document.getElementById('cv');
let ctx = cv.getContext('2d');

let coulomb_k = 1.0;

let gx = 0.0;
let gy = 10.0;

let elscs = [new Elec('e0', cv.width/2, 50, 10.0)];
let walls = [new Wall('ground', 0, cv.height, cv.width, cv.height)];

let t  = 0.0;
let ht = 0.001;

function objects_update() {
  for(const e1 of elecs) {
    for(const e2 of elecs) {
      if(e1 == e2) continue;
      
    }
  }

  for(const w of walls) {

    for(const e of elecs) {

    }
  }
}
