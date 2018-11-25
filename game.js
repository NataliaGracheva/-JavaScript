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
  // !!!
  isIntersect(actor) {
    if (!actor || !(actor instanceof Actor)) {
      throw new Error(`Необходим объект типа Actor`);
    }
    if (actor === this) {
      return false;
    }
    return (this.left < actor.right && this.right > actor.left && this.top < actor.bottom && this.bottom > actor.top)
      || ((this.left === actor.left || this.right === actor.right) && this.top < actor.bottom && this.bottom > actor.top)
      || ((this.top === actor.top || this.bottom === actor.bottom) && this.left < actor.right && this.right > actor.left);
  }
}

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
    if (grid.length !== 0) {

      for (const arr of this.grid) {
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
    return (this.status !== null) && (this.finishDelay < 0);
  }
  /// !!!
  actorAt(actor) {
    if (!actor || !(actor instanceof Actor)) {
      throw new Error('Необходим объект типа Actor');
    }

    for (let el of this.actors) {
      if (typeof el !== 'undefined' && actor.isIntersect(el)) {
        return el;
      }
    }
    return undefined;
  }
  // !!!
  obstacleAt(pos, size) {
    if (!pos || !(pos instanceof Vector) || !size || !(size instanceof Vector)) {
      throw new Error('Нужен объект типа Vector');
    }
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
        let obstacle = this.grid[y][x];
        if (typeof obstacle !== 'undefined') {
          return obstacle;
        }
      }
    }
    return undefined;
  }
  removeActor(actor) {
    let indexActor = this.actors.indexOf(actor);
    if (indexActor !== -1) {
      this.actors.splice(indexActor, 1);
    }
  }
  noMoreActors(type) {
    if (this.actors) {
      for (let actor of this.actors) {
        if (actor.type === type) {
          return false;
        }
      }
    }
    return true;
  }
  // !!!
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
// Пользователь столкнулся с шаровой молнией



