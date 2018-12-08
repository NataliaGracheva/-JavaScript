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
    // если значение присваивается переменной 1 раз,
    // то лучше использовать const
    let x = this.x + vector.x;
    let y = this.y + vector.y;
    return new Vector(x, y);
  }
  times(n) {
    let x = this.x * n;
    let y = this.y * n;
    return new Vector(x, y);
  }
}

// комментарии можно удалить
// Пример кода для Vector
// const start = new Vector(30, 50);
// const moveTo = new Vector(5, 10);
// const finish = start.plus(moveTo.times(2));

// console.log(`Исходное расположение: ${start.x}:${start.y}`);
// console.log(`Текущее расположение: ${finish.x}:${finish.y}`);
// Результат выполнения кода:
// Исходное расположение: 30:50
// Текущее расположение: 40:70

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
    // слишком много условий, тут простой алгоритм:
    // если объект выше, ниже, левве или правее данного,
    // то они не пересекаются
    return (this.left < actor.right && this.right > actor.left && this.top < actor.bottom && this.bottom > actor.top)
      || ((this.left === actor.left || this.right === actor.right) && this.top < actor.bottom && this.bottom > actor.top)
      || ((this.top === actor.top || this.bottom === actor.bottom) && this.left < actor.right && this.right > actor.left);
  }
}

// комментарии можно удалить
// Пример кода для Actor
// const items = new Map();
// const player = new Actor();
// items.set('Игрок', player);
// items.set('Первая монета', new Actor(new Vector(10, 10)));
// items.set('Вторая монета', new Actor(new Vector(15, 5)));

// function position(item) {
//   return ['left', 'top', 'right', 'bottom']
//     .map(side => `${side}: ${item[side]}`)
//     .join(', ');
// }

// function movePlayer(x, y) {
//   player.pos = player.pos.plus(new Vector(x, y));
// }

// function status(item, title) {
//   console.log(`${title}: ${position(item)}`);
//   if (player.isIntersect(item)) {
//     console.log(`Игрок подобрал ${title}`);
//   }
// }

// items.forEach(status);
// movePlayer(10, 10);
// items.forEach(status);
// movePlayer(5, -5);
// items.forEach(status);
// Результат работы примера:
// Игрок: left: 0, top: 0, right: 1, bottom: 1
// Первая монета: left: 10, top: 10, right: 11, bottom: 11
// Вторая монета: left: 15, top: 5, right: 16, bottom: 6
// Игрок: left: 10, top: 10, right: 11, bottom: 11
// Первая монета: left: 10, top: 10, right: 11, bottom: 11
// Игрок подобрал Первая монета 
// Вторая монета: left: 15, top: 5, right: 16, bottom: 6
// Игрок: left: 15, top: 5, right: 16, bottom: 6
// Первая монета: left: 10, top: 10, right: 11, bottom: 11
// Вторая монета: left: 15, top: 5, right: 16, bottom: 6
// Игрок подобрал Вторая монета 

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = this.actors.find(actor => actor.type === 'player');
    this.height = grid.length;
    this.width = 0;
    // для нахождения width лучше использовать reduce или map + Math.max
    if (grid.length !== 0) {

      // вместо for of лучше использовать просто for или forEach
      for (const arr of this.grid) {
        // не уверен, что тут нужна эта проверка
        // всегда используйте !== и === для сравнения
        if (typeof arr != 'undefined') {
          if (this.width < arr.length) {
            this.width = arr.length;
          }
        }
      }

    }
    this.status = null;
    this.finishDelay = 1;
  }
  isFinished() {
    // скобки можно убрать
    return (this.status !== null) && (this.finishDelay < 0);
  }
  actorAt(actor) {
    // первая половина проверки лишняя
    if (!actor || !(actor instanceof Actor)) {
      throw new Error('Необходим объект типа Actor');
    }

    // для поиска объекта в моссиве есть специальный метод
    for (let el of this.actors) {
      // проверку на undefined можно убрать
      if (typeof el !== 'undefined' && actor.isIntersect(el)) {
        return el;
      }
    }
    return undefined;
  }
  obstacleAt(pos, size) {
    // !pos и !size не нужны, они дублируются другими проверками
    if (!pos || !(pos instanceof Vector) || !size || !(size instanceof Vector)) {
      throw new Error('Нужен объект типа Vector');
    }
    // если значение присваивается переменной 1 раз,
    // то лучше использовкть const
    let xLeft = Math.floor(pos.x);
    let xRight = Math.ceil(pos.x + size.x);
    let yTop = Math.floor(pos.y);
    let yBottom = Math.ceil(pos.y + size.y);
    if ((xLeft < 0) || (xRight > this.width) || (yTop < 0)) {
      return 'wall';
    }
    if (yBottom > this.height) {
      return 'lava';
    }

    for (let y = yTop; y < yBottom; y++) {
      for (let x = xLeft; x < xRight; x++) {
        // const
        let obstacle = this.grid[y][x];
        // я бы проверял просто if (obstacle) {
        if (typeof obstacle !== 'undefined') {
          return obstacle;
        }
      }
    }
    // эта строчка ничего не делает,
    // функция и так возвращает undefined,
    // если не указано иное
    return undefined;
  }
  removeActor(actor) {
    // const
    let indexActor = this.actors.indexOf(actor);
    if (indexActor !== -1) {
      this.actors.splice(indexActor, 1);
    }
  }
  noMoreActors(type) {
    // если нужно эту проверку лучше поместить в конструктор,
    // чтобы нельзя было создать невалидный объект,
    // иначе придётся проверять поля в каждом методе, где они используются
    if (this.actors) {
      // для проверки наличия объектов в массиве по условию есть специальный метод,
      // который принимает функцию обратного вызова и возвращает true/false
      for (let actor of this.actors) {
        if (actor.type === type) {
          return false;
        }
      }
    }
    return true;
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

// комментарии можно удалить
// Пример кода для Level
// const grid = [
//   [undefined, undefined],
//   ['wall', 'wall']
// ];

// function MyCoin(title) {
//   this.type = 'coin';
//   this.title = title;
// }
// MyCoin.prototype = Object.create(Actor);
// MyCoin.constructor = MyCoin;

// const goldCoin = new MyCoin('Золото');
// const bronzeCoin = new MyCoin('Бронза');
// const player2 = new Actor();
// const fireball = new Actor();

// const level = new Level(grid, [goldCoin, bronzeCoin, player2, fireball]);

// level.playerTouched('coin', goldCoin);
// level.playerTouched('coin', bronzeCoin);

// if (level.noMoreActors('coin')) {
//   console.log('Все монеты собраны');
//   console.log(`Статус игры: ${level.status}`);
// }

// const obstacle = level.obstacleAt(new Vector(1, 1), player2.size);
// if (obstacle) {
//   console.log(`На пути препятствие: ${obstacle}`);
// }

// const otherActor = level.actorAt(player2);
// if (otherActor === fireball) {
//   console.log('Пользователь столкнулся с шаровой молнией');
// }
// Результат выполнения:
// Все монеты собраны
// Статус игры: won
// На пути препятствие: wall 
// На пути препятствие: wall
// Пользователь столкнулся с шаровой молнией

// 3. Парсер уровня
class LevelParser {
  constructor(dictionary) {
    this.dictionary = dictionary;
  }

  actorFromSymbol(symbol) {
    // проверка лишняя
    if (symbol && this.dictionary) {
      return this.dictionary[symbol];
    }
  }
  obstacleFromSymbol(symbol) {
    // symbols я бы сделал полем класса,
    // или вынес обявление за пределы класса,
    // чтобы не создавать кадый раз объект
    const symbols = { 'x': 'wall', '!': 'lava' };
    return symbols[symbol];
  }
  createGrid(strings) {
    // этот метод лучше переписать с помощью map
    const array = [];
    let i = 0;

    for (const string of strings) {
      array[i] = [];
      for (let j = 0; j < string.length; j++) {
        const symbol = string.charAt(j);
        if (symbol === 'x' || symbol === '!') {
          array[i].push(this.obstacleFromSymbol(symbol));
        } else {
          array[i].push(undefined);
        }
      }
      i++;
    }

    return array;
  }
  createActors(strings) {
    const array = [];
    let j = 0;

    for (let k = 0; k < strings.length; k++) {
      const string = strings[k];
      for (let i = 0; i < string.length; i++) {
        const symbol = string.charAt(i);
        const actorCtr = this.actorFromSymbol(symbol);
        if (typeof actorCtr === 'function') {
          // лучше создать объект сразу с правильными параметрами
          const actor = new actorCtr();
          if (actor instanceof Actor) {
            // тут вы создаётё объект ещё раз
            array[j] = new actorCtr();
            // позиция должна задаваться через конструктор
            array[j].pos = new Vector(i, k);
            // эту переменную можно убрать если использовать .push
            // а array можно убрать, если использовать reduce
            j++;
          }
        }
      }
    }

    return array;
  }
  parse(strings) {
    return new Level(this.createGrid(strings), this.createActors(strings));
  }
}
// комменттарии можно убрать
//Пример использования для LevelParser
// const plan = [
//   ' @ ',
//   'x!x'
// ];

// const actorsDict = Object.create(null);
// actorsDict['@'] = Actor;

// const parser = new LevelParser(actorsDict);
// const level3 = parser.parse(plan);

// level3.grid.forEach((line, y) => {
//   line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
// });

// level3.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));
// Результат выполнения кода:
// (0:0) undefined
// (1:0) undefined
// (2:0) undefined 
// (0:1) wall
// (1:1) lava 
// (2:1) wall 
// (1:0) actor

// 4. Игрок
class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
    // лучше не менять значения аргументов функции
    pos = pos.plus(new Vector(0, -0.5));
    super(pos, new Vector(0.8, 1.5), new Vector(0, 0));
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

// Пример использования
// const time = 5;
// const speed = new Vector(1, 0);
// const position4 = new Vector(5, 5);

// const ball = new Fireball(position4, speed);

// const nextPosition = ball.getNextPosition(time);
// console.log(`Новая позиция: ${nextPosition.x}: ${nextPosition.y}`);

// ball.handleObstacle();
// console.log(`Текущая скорость: ${ball.speed.x}: ${ball.speed.y}`);
// Результат работы кода:
// Новая позиция: 10: 5
// Текущая скорость: -1: 0

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
    // значения аргументов функцим лучше не менять
  	pos = pos.plus(new Vector(0.2, 0.1));
    super(pos, new Vector(0.6, 0.6));
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * Math.PI * 2;
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
    this.updateSpring(time);
    return this.pos.plus(this.getSpringVector());
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