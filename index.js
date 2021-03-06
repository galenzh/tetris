let COL = 10,
    ROW = 20,
    COLORS = ['', 'Aquamarine', 'DarkTurquoise', 'DarkCyan', 'CornflowerBlue', 'LightSalmon', 'LightGreen', 'MediumPurple'];

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
    this.tipOffset = 0; // 提示在垂直轴上的偏移量
    this.matrix.forEach((ele) => {
      this.preMatrix.push(ele.slice());
    });
    this.calculateTipOffset();
  }
  rotate() {
    this.backup();
    this.matrix = this.matrix.map((val, index) => this.matrix.map(row => row[index]).reverse());
    if(!this.checkCollision(this.squares)) {
      this.calculateTipOffset();
      return;
    }
    let pY = this.position.y;
    for(let i=0; i<3; i++) {
      this.position.y +=1;
      if(!this.checkCollision(this.squares)) {
        this.calculateTipOffset();
        return;
      }
    }
    this.position.y = pY;
    for(let i=0; i<3; i++) {
      this.position.y -=1;
      if(!this.checkCollision(this.squares)) {
        this.calculateTipOffset();
        return;
      }
    }
    this.restore();
  }
  moveLeft() {
    this.backup();
    this.position.y -= 1;
    if(this.checkCollision(this.squares)) {
      this.restore();
    }
    this.calculateTipOffset();
  }
  moveRight() {
    this.backup();
    this.position.y += 1;
    if(this.checkCollision(this.squares)) {
      this.restore();
    }
    this.calculateTipOffset();
  }
  moveDown() {
    this.backup();
    this.position.x += 1;
    if(this.checkCollision(this.squares)) {
      this.restore();
      return false;
    }
    return true;
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
  calculateTipOffset() {
    this.backup();
    while(!this.checkCollision()) {
      this.position.x += 1;
    }
    this.tipOffset = this.position.x - 1 >=0 ? this.position.x - 1 : 0;
    this.restore();
  }
  quickDown() {
    while(this.moveDown());
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
    num += 1;
    if(num === 1) {
      return new Element([ // I
        [0, num, 0, 0],
        [0, num, 0, 0],
        [0, num, 0, 0],
        [0, num, 0, 0]
      ], squares);
    } else if(num === 2) {
      return new Element([ // L
        [0, num, 0],
        [0, num, 0],
        [0, num, num]
      ], squares);
    } else if(num === 3) {
      return new Element([ // J
        [0, num, 0],
        [0, num, 0],
        [num, num, 0]
      ], squares);
    } else if(num === 4) {
      return new Element([ // N
        [0, num, 0],
        [0, num, num],
        [0, 0, num]
      ], squares);
    } else if(num === 5) {
      return new Element([ // Z
        [0, num, 0],
        [num, num, 0],
        [num, 0, 0]
      ], squares);
    } else if(num === 6) {
      return new Element([ // T
        [0, num, 0],
        [0, num, num],
        [0, num, 0]
      ], squares);
    } else if(num === 7) {
      return new Element([ // O
        [num, num],
        [num, num]
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
    this.doms.forEach((dom) => {
      dom.className = 'square';
      dom.style.backgroundColor = '';
    })
    for(let i=0; i<this.next.matrix.length; i++) {
      for(let j=0; j<this.next.matrix.length; j++) {
        if(this.next.matrix[i][j] > 0) {
          this.doms[i*4 + j].className = 'square';
          this.doms[i*4 + j].style.backgroundColor = COLORS[this.next.matrix[i][j]];
          console.log(this.doms[i*4 + j].style.backgroundColor)
        }
      }
    }
    return this.current;
  }
}
class Score {
  constructor() {
    this.score = 0;
    this.dom = document.getElementById('score');
    this.update();
  }
  update() {
    this.dom.innerHTML = this.score;
  }
  add(score) {
    this.score += score;
    this.update();
  }
}
class Tetris {
  constructor() {
    this.restart();
  }
  update() {
    if(this.status === 0 || this.status === 2) {
      return;
    }
    this.counter++;
    if(this.counter % this.speed === 0) {
      let x = this.ele.position.x;
      this.ele.moveDown();
      if(this.ele.position.x === x) {
        // 到达底部，不能下移，将元素复制到背景方格中
        for(let i=0; i<this.ele.matrix.length; i++) {
          for(let j=0; j<this.ele.matrix.length; j++) {
            if(this.ele.matrix[i][j] > 0) {
              this.squares[this.ele.position.x + i][this.ele.position.y + j] = this.ele.matrix[i][j];
            }
          }
        }
        this.ele = this.preview.nextElement();
        // 判断是否有可消除行
        let deletedRows = [];
        for(let i=0; i<ROW; i++) {
          let j = 0;
          for(j=0; j<COL; j++) {
            if(this.squares[i][j] === 0) {
              break;
            }
          }
          if(j === COL) {
            deletedRows.push(i);
          }
        }
        if(deletedRows.length > 0) {
          this.status = 2;
          for(let i=0; i<deletedRows.length; i++) {
            for(let j=0; j<COL; j++) {
              this.doms[deletedRows[i] * COL + j].classList.add('blink');
            }
          }
          setTimeout(() => {
            for(let i=0; i<deletedRows.length; i++) {
              for(let j=0; j<COL; j++) {
                this.doms[deletedRows[i] * COL + j].classList.remove('blink');
              }
            }
            for(let i=0; i<deletedRows.length; i++) {
              this.squares.splice(deletedRows[i], 1);
              this.squares.unshift(Array(COL).fill(0));
              this.score.add(1);
            }
            this.status = 1;
          }, 700);
          return;
        }
        //判断是否到顶
        for(let i=0; i<this.squares[0].length; i++) {
          if(this.squares[0][i] > 0) {
            this.status = 0;
            // alert('Game over! Your score is ' + this.score.score);
            document.getElementsByClassName("game-over-info")[0].className += ' active';
          }
        }
      }
    }
    this.ele.calculateTipOffset();
    //draw background
    for(let i=0; i<this.squares.length; i++) {
      for(let j=0; j<this.squares[i].length; j++) {
        if(this.squares[i][j] > 0) {
          this.doms[i * COL + j].className = 'square';
          this.doms[i * COL + j].style.backgroundColor = COLORS[this.squares[i][j]];
        } else {
          this.doms[i * COL + j].className = 'square';
          this.doms[i * COL + j].style.backgroundColor = '';
        }
      }
    }
    // draw tip shape
    for(let i=0; i<this.ele.matrix.length; i++) {
      for(let j=0; j<this.ele.matrix[i].length; j++) {
        if(this.ele.matrix[i][j] > 0) {
          this.doms[(this.ele.tipOffset + i) * COL + this.ele.position.y + j].className = 'square tip';
        }
      }
    }
    // draw shape
    for(let i=0; i<this.ele.matrix.length; i++) {
      for(let j=0; j<this.ele.matrix[i].length; j++) {
        if(this.ele.position.x + i < 0 || this.ele.position.x + i >= ROW || this.ele.position.y + j < 0 || this.ele.position.y + j >= COL) {
          continue;
        }
        if(this.ele.matrix[i][j] > 0) {
          this.doms[(this.ele.position.x + i) * COL + this.ele.position.y + j].style.backgroundColor = COLORS[this.ele.matrix[i][j]];
          this.doms[(this.ele.position.x + i) * COL + this.ele.position.y + j].classList.remove('tip');
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
  restart() {
    this.squares = new Array(ROW).fill(0).map(()=>Array(COL).fill(0));
    this.doms = document.getElementById('screen').childNodes;
    this.preview = new Preview(this.squares);
    this.ele = this.preview.nextElement();
    this.counter = 0;
    this.status = 1; // 0:暂停; 1:运行中；2:删除中
    this.speed = 40;
    this.score = new Score();
  }
}

let tetris = new Tetris();
tetris.init();

window.addEventListener('keydown', function(event) {
  if(event.key === 'ArrowLeft') {
    tetris.ele.moveLeft();
  } else if(event.key === 'ArrowRight') {
    tetris.ele.moveRight();
  } else if(event.key === 'ArrowDown') {
    tetris.ele.quickDown();
  } else if(event.key === 'ArrowUp') {
    tetris.ele.rotate();
  }
});
document.getElementById('restart-info').addEventListener('click', function() {
  tetris.restart();
  document.getElementsByClassName("game-over-info")[0].className = 'game-over-info';
});
document.getElementById('restart').addEventListener('click', function() {
  tetris.restart();
  document.getElementsByClassName("game-over-info")[0].className = 'game-over-info';
});
document.getElementById('right-allow').addEventListener('click', function() {
  tetris.ele.moveRight();
});
document.getElementById('left-allow').addEventListener('click', function() {
  tetris.ele.moveLeft();
});
document.getElementById('down-allow').addEventListener('click', function() {
  tetris.ele.quickDown();
});
document.getElementById('up-allow').addEventListener('click', function() {
  tetris.ele.rotate();
});