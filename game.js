'use strict';
// 1. Базовые классы
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
    const x = this.x + vector.x;
    const y = this.y + vector.y;
    return new Vector(x, y);
  }
  times(n) {
    let x = this.x * n;
    let y = this.y * n;
    return new Vector(x, y);
  }
}

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(pos instanceof Vector)) {
      throw new Error('Расположение не является объектом типа Vector');
    }
    if (!(size instanceof Vector)) {
      throw new Error('Размер не является объектом типа Vector');
    }
    if (!(speed instanceof Vector)) {
      throw new Error('Скорость не является объектом типа Vector');
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }

  act() { }
  get left() {
    return this.pos.x;
  }
  get top() {
    return this.pos.y;
  }
  get right() {
    return this.pos.x + this.size.x;
  }
  get bottom() {
    return this.pos.y + this.size.y;
  }
  get type() {
    return 'actor';
  }
  isIntersect(actor) {
    if (!actor || !(actor instanceof Actor)) {
      throw new Error(`Необходим объект типа Actor`);
    }
    if (actor === this) {
      return false;
    }
    return (!(this.left >= actor.right || this.right <= actor.left || this.top >= actor.bottom || this.bottom <= actor.top));
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = this.actors.find(actor => actor.type === 'player');
    this.height = grid.length;
    //Ширина пустого уровня равна 0!!!
    this.width = Math.max(0, ...(this.grid.map(el => el.length)));
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }
  actorAt(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Необходим объект типа Actor');
    }

    return this.actors.find(el => el.isIntersect(actor));
  }
  obstacleAt(pos, size) {
    if (!(pos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error('Нужен объект типа Vector');
    }
    const xLeft = Math.floor(pos.x);
    const xRight = Math.ceil(pos.x + size.x);
    const yTop = Math.floor(pos.y);
    const yBottom = Math.ceil(pos.y + size.y);
    if ((xLeft < 0) || (xRight > this.width) || (yTop < 0)) {
      return 'wall';
    }
    if (yBottom > this.height) {
      return 'lava';
    }

    for (let y = yTop; y < yBottom; y++) {
      for (let x = xLeft; x < xRight; x++) {
        const obstacle = this.grid[y][x];
        if (obstacle) {
          return obstacle;
        }
      }
    }
  }
  removeActor(actor) {
    const indexActor = this.actors.indexOf(actor);
    if (indexActor !== -1) {
      this.actors.splice(indexActor, 1);
    }
  }
  noMoreActors(type) {
    return !this.actors.some((actor) => actor.type === type);
  }
  playerTouched(type, actor) {
    if (this.status != null) {
      return;
    }
    if (type === 'lava' || type === 'fireball') {
      this.status = 'lost';
    }
    if (type === 'coin' && actor.type === 'coin') {
      this.removeActor(actor);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
    }
  }
}

// 3. Парсер уровня
const symbols = { 'x': 'wall', '!': 'lava' }; 

class LevelParser {
  constructor(dictionary) {
    this.dictionary = dictionary;
  }

  actorFromSymbol(symbol) {
  	//Вернет undefined, если не передать символ
  	if (this.dictionary) {//!!!
    return this.dictionary[symbol];
  }
}
  obstacleFromSymbol(symbol) {
    return symbols[symbol];
  }
  createGrid(strings) {
    return strings.map(string => string.split('')).map(line => line.map(symbol => this.obstacleFromSymbol(symbol)));
  }
  createActors(strings) {
  	//Вернет пустой массив, если не определить символы движущихся объектов!!!
    return strings.reduce((rez, itemY, y) => {
      itemY.split('').forEach((itemX, x) => {
        const constructor = this.actorFromSymbol(itemX);
        if (typeof constructor === 'function') {
          const actor = new constructor(new Vector(x, y));
          if (actor instanceof Actor) {
            rez.push(actor);
          }
        }
      });
      return rez;
    },[]);
}
  parse(strings) {
  	//Высота уровня будет равна количеству строк плана!!!
  	//Ширина уровня будет равна количеству символов в максимальной строке плана!!!
  	//Создаст уровень с припятствиями из плана!!!
    return new Level(this.createGrid(strings), this.createActors(strings));
  }
}

// 4. Игрок
class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
  	// лучше не менять значения аргументов функции?
    const realPos = pos.plus(new Vector(0, -0.5));
    super(realPos, new Vector(0.8, 1.5), new Vector(0, 0));
  }

  get type() {
    return 'player';
  }
}

// 5. Движущиеся объекты игрового поля
// Шаровая молния
class Fireball extends Actor {
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(pos, new Vector(1, 1), speed);
  }

  get type() {
    return 'fireball';
  }
  getNextPosition(time = 1) {
    return this.pos.plus(this.speed.times(time));
  }
  handleObstacle() {
    this.speed = this.speed.times(-1);
  }
  act(time, level) {
    const nextPos = this.getNextPosition(time);
    if (level.obstacleAt(nextPos, this.size)) {
      this.handleObstacle();
    } else {
      this.pos = nextPos;
    }
  }
}

// Горизонтальная шаровая молния
class HorizontalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(2, 0));
  }
}

// Вертикальная шаровая молния
class VerticalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(0, 2));
  }
}

// Огненный дождь
class FireRain extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(0, 3));
    this.initPos = pos;
  }

  get type() {
    return 'firerain';
  }

  handleObstacle() {
    this.pos = this.initPos;
  }
}

// Монета
class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
  	// лучше не менять значения аргументов функции?
  	const realPos = pos.plus(new Vector(0.2, 0.1));
    super(realPos, new Vector(0.6, 0.6));
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * Math.PI * 2;
    this.startPos = this.pos;
  }

  get type() {
    return 'coin';
  }
  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }
  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }
  getNextPosition(time = 1) {
  	//Увеличивается вектор исходной позиции, а не текущей!!!
    this.updateSpring(time);
    return this.startPos.plus(this.getSpringVector());
  }
  act(time) {
    this.pos = this.getNextPosition(time);
  }
}


// runGame
const schemas = [
  [
    '         ',
    '         ',
    '    =    ',
    '       o ',
    '     !xxx',
    ' @       ',
    'xxx!     ',
    '         '
  ],
  [
    '      v  ',
    '    v    ',
    '  v      ',
    '        o',
    '        x',
    '@   x    ',
    'x        ',
    '         '
  ]
];
const actorDict = {
  '@': Player,
  '=': HorizontalFireball,
  'o': Coin,
  'v': FireRain
}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => console.log('Вы выиграли приз!'));
