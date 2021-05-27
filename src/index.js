// 
let COL = 10,
    ROW = 20;

function init() {
  let screen = document.getElementById('screen');
  let htmlStr = '';
  for(let i=0; i < 200; i++) {
    htmlStr += '<div class="square"></div>';
  }
  screen.innerHTML = htmlStr;

  let preview = document.getElementById('preview');
  htmlStr = '';
  for(let i=0; i < 4*4; i++) {
    htmlStr += '<div class="square"></div>';
  }
  preview.innerHTML = htmlStr;
}

init();
let Util = {
  getRandomNumber(start, end) {
    return Math.floor(Math.random() * end) + start;
  }
}
class Element {
  constructor(matrix, squares) {
    this.matrix = matrix;
    this.position = {x: 0, y: 0};
    this.prePosition = {x: 0, y: 0};
    this.preMatrix = [];
    this.squares = squares;
    this.matrix.forEach((ele) => {
      this.preMatrix.push(ele.slice());
    })
  }
  rotate() {
    this.backup();
    this.matrix = this.matrix.map((val, index) => this.matrix.map(row => row[index]).reverse());
    if(this.checkCollision(this.squares)) {
      this.restore();
    }
  }
  moveLeft() {
    this.backup();
    this.position.y -= 1;
    if(this.checkCollision(this.squares)) {
      this.restore();
    }
  }
  moveRight() {
    this.backup();
    this.position.y += 1;
    if(this.checkCollision(this.squares)) {
      this.restore();
    }
  }
  moveDown() {
    this.backup();
    this.position.x += 1;
    if(this.checkCollision(this.squares)) {
      this.restore();
    }
  }
  moveUp() {
    this.backup();
    this.position.x -= 1;
    if(this.checkCollision(this.squares)) {
      this.restore();
    }
  }
  restore() {
    this.position.x = this.prePosition.x;
    this.position.y = this.prePosition.y;
    for(let i=0; i<this.matrix.length; i++) {
      for(let j=0; j<this.matrix.length; j++) {
        this.matrix[i][j] = this.preMatrix[i][j];
      }
    }
  }
  backup() {
    this.prePosition.x = this.position.x;
    this.prePosition.y = this.position.y;
    for(let i=0; i<this.matrix.length; i++) {
      for(let j=0; j<this.matrix.length; j++) {
        this.preMatrix[i][j] = this.matrix[i][j];
      }
    }
  }
  checkCollision() {
    for(let i=0; i<this.matrix.length; i++) {
      for(let j=0; j<this.matrix[i].length; j++) {
        if(this.matrix[i][j] > 0) {
          if(this.position.x + i < 0 || this.position.x + i >= ROW || this.position.y + j < 0 || this.position.y + j >= COL) {
            return true;
          }
          if(this.squares[this.position.x + i][this.position.y + j] > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
class ElementFactory {
  getRandomElement(squares,eleNum) {
    let num = typeof eleNum !== 'undefined' ? eleNum : Util.getRandomNumber(0, 7);
    if(num === 0) {
      return new Element([ // I
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
      ], squares);
    } else if(num === 1) {
      return new Element([ // L
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
      ], squares);
    } else if(num === 2) {
      return new Element([ // J
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
      ], squares);
    } else if(num === 3) {
      return new Element([ // N
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1]
      ], squares);
    } else if(num === 4) {
      return new Element([ // Z
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0]
      ], squares);
    } else if(num === 5) {
      return new Element([ // T
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0]
      ], squares);
    } else if(num === 6) {
      return new Element([ // O
        [1, 1],
        [1, 1]
      ], squares);
    }
  }
}
class Preview {
  constructor(squares) {
    this.doms = document.getElementById('preview').childNodes;
    this.eleFactory = new ElementFactory();
    this.squares = squares;
    this.next = this.eleFactory.getRandomElement(this.squares);
    this.doms = document.getElementById('preview').childNodes;
  }
  nextElement() {
    this.current = this.next;
    this.next = this.eleFactory.getRandomElement(this.squares);
    this.doms.forEach(function(dom) {
      dom.className = 'square';
    })
    for(let i=0; i<this.next.matrix.length; i++) {
      for(let j=0; j<this.next.matrix.length; j++) {
        if(this.next.matrix[i][j] > 0) {
          this.doms[i*4 + j].className = 'square active';
        }
      }
    }
    return this.current;
  }
}
class Tetris {
  constructor() {
    this.squares = new Array(ROW).fill(0).map(()=>Array(COL).fill(0));
    //this.squares[5][2] = 1;
    this.doms = document.getElementById('screen').childNodes;
    this.preview = new Preview(this.squares);
    this.ele = this.preview.nextElement();
    this.counter = 0;
    this.status = 1; // 0:暂停; 1:运行中
    this.speed = 50;
  }
  update() {
    if(this.status === 0) {
      return;
    }
    this.counter++;
    if(this.counter % this.speed === 0) {
      let x = this.ele.position.x;
      this.ele.moveDown();
      if(this.ele.position.x === x) {
        for(let i=0; i<this.ele.matrix.length; i++) {
          for(let j=0; j<this.ele.matrix.length; j++) {
            if(this.ele.matrix[i][j] > 0) {
              this.squares[this.ele.position.x + i][this.ele.position.y + j] = this.ele.matrix[i][j];
            }
          }
        }
        for(let i=0; i<ROW; i++) {
          let j = 0;
          for(j=0; j<COL; j++) {
            if(this.squares[i][j] === 0) {
              break;
            }
          }
          if(j === COL) {
            this.squares.splice(i, 1);
            this.squares.unshift(Array(COL).fill(0));
            i--;
          }
        }
        this.ele = this.preview.nextElement();
      }
    }
    for(let i=0; i<this.squares.length; i++) {
      for(let j=0; j<this.squares[i].length; j++) {
        if(this.squares[i][j] > 0) {
          this.doms[i * COL + j].className = 'square active';
        } else {
          this.doms[i * COL + j].className = 'square';
        }
      }
    }
    for(let i=0; i<this.ele.matrix.length; i++) {
      for(let j=0; j<this.ele.matrix[i].length; j++) {
        if(this.ele.position.x + i < 0 || this.ele.position.x + i >= ROW || this.ele.position.y + j < 0 || this.ele.position.y + j >= COL) {
          continue;
        }
        if(this.ele.matrix[i][j] > 0) {
          this.doms[(this.ele.position.x + i) * COL + this.ele.position.y + j].className = 'square active';
        }
      }
    }
  }
  init() {
    var game = this;
    function loop(stamp) {
      game.update();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
}

let tetris = new Tetris();
tetris.init();

window.addEventListener('keydown', function(event) {
  if(event.key === 'a') {
    tetris.ele.moveLeft();
  } else if(event.key === 'd') {
    tetris.ele.moveRight();
  } else if(event.key === 's') {
    tetris.ele.moveDown();
  } else if(event.key === 'w') {
    tetris.ele.rotate();
  }
});