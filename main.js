const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const canvasNext = document.getElementById('next');
const ctxNext = canvasNext.getContext('2d');

let accountValues = {
  score: 0,
  lines: 0,
  level: 0,
}

// Обновление данных на экране
function updateAccount(key, value) {
  let element = document.getElementById(key);
  if (element) {
    element.textContent = value;
  }
}

// Проксирование доступа к свойствам accountValues
let account = new Proxy(accountValues, {
  set: (target, key, value) => {
    target[key] = value;
    updateAccount(key, value);
    return true;
  }
});

let requestId;

const moves = {
  [KEY.LEFT]: p => ({ ...p, x: p.x - 1 }),
  [KEY.RIGHT]: p => ({ ...p, x: p.x + 1 }),
  [KEY.DOWN]: p => ({ ...p, y: p.y + 1 }),
  [KEY.SPACE]: p => ({ ...p, y: p.y + 1 }),
  [KEY.UP]: p => board.rotate(p)
}


let board = new Board(ctx, ctxNext);
addEventListener();
initNext();

function initNext() {
  // Расчет размеров холста по константам
  ctxNext.canvas.width = 4 * BLOCK_SIZE;
  ctxNext.canvas.height = 4 * BLOCK_SIZE;
  ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
}


function addEventListener() {
  document.addEventListener('keydown', event => {
    if (event.keyCode === KEY.P) {
      pause();
    }
    if (event.keyCode === KEY.ESC) {
      gameOver();
    } else if (moves[event.keyCode]) {
      event.preventDefault();
      // Get new state
      let p = moves[event.keyCode](board.piece); // получение новых координат фигурки
      if (event.keyCode === KEY.SPACE) {
        while (board.valid(p)) {
          account.score += POINTS.HARD_DROP;
          board.piece.move(p); // реальное перемещение фигурки, если новое положение допустимо
          p = moves[KEY.DOWN](board.piece);
        }       
      } else if (board.valid(p)) {
        board.piece.move(p);
        if (event.keyCode === KEY.DOWN) {
          account.score += POINTS.SOFT_DROP;         
        }
      }
    }
  });
}

function resetGame() {
  account.score = 0;
  account.lines = 0;
  account.level = 0;
  board.reset();
  time = { start: 0, elapsed: 0, level: LEVEL[account.level] };
}


function play() {
  // console.table(board.grid) =====> Можно посмотреть как выглядит игровое поле
  resetGame();
  time.start = performance.now();
  // Если старая игра, то отменяем ее
  if (requestId) {
    cancelAnimationFrame(requestId);
  }

  animate();
}

function animate(now = 0) {
  time.elapsed = now - time.start; // обновить истекшее время
  if (time.elapsed > time.level) { // если время отображения текущего фрейма прошло 
    time.start = now; // начать отсчет сначала
    if (!board.drop()) { // "уронить" активную фигурку
      gameOver();
      return;
    }
  }

  // очистить холст для отрисовки нового фрейма
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); 
  
  // отрисовать игровое поле 
  board.draw();  
  requestId = requestAnimationFrame(animate);
}

function gameOver() {
  cancelAnimationFrame(requestId);
  ctx.fillStyle = 'black';
  ctx.fillRect(1, 3, 8, 1.2);
  ctx.font = '1px Arial';
  ctx.fillStyle = 'red';
  ctx.fillText('GAME OVER', 1.8, 4);
}

function pause() {
  if (!requestId) {
    animate();
    return;
  }

  cancelAnimationFrame(requestId);
  requestId = null;
  
  ctx.fillStyle = 'black';
  ctx.fillRect(1, 3, 8, 1.2);
  ctx.font = '1px Arial';
  ctx.fillStyle = 'yellow';
  ctx.fillText('PAUSED', 3, 4);
}
