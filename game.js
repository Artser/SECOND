'use strict';


class Vector {
  constructor(x = 0, y = 0) {
    this.x =  x;
    this.y =  y;
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  times(count) {
    return new Vector(count * this.x, count * this.y);
  }
}

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
      throw new Error('Класс Actor можно создавать только векторами типа Vector');
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }

  act() {}

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
    if (!(actor instanceof Actor)) {
        throw new Error('Можно сравнивать только объекты класса Actor');
    }
    if(this === actor) {
      return false;
    }
    return this.left < actor.right && actor.left < this.right &&
    this.top < actor.bottom && actor.top < this.bottom;
  }
}

class Level {
  constructor(arrGrid = [], arrActors = []) {
    this.grid = arrGrid;
    this.actors = arrActors;
    this.player = this.actors.find(actor => actor.type === 'player');
    this.height = this.grid.length;
    this.width = this.grid.reduce((memo, el) => el.length > memo ? el.length : memo, 0);
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
    return this.status != null && this.finishDelay < 0;
  }

  actorAt(actor = {}) {
    if (!(actor instanceof Actor)) {
      throw new Error('Можно сравнивать только объекты класса Actor');
    }
    return this.actors.find(el => el.isIntersect(actor));
  }

  obstacleAt(pos, size) {
    if (!(pos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error('В метод obstacleAt можно передавать только вектора типа Vector');
    }

    const top = Math.floor(pos.y),
          bottom = Math.ceil(pos.y + size.y),
          left = Math.floor(pos.x),
          right = Math.ceil(pos.x + size.x);

    if (bottom > this.height) {
      return 'lava';
    }
    if (top < 0 || left < 0 || right > this.width) {
      return 'wall';
    }
    for (let i = top; i < bottom; i++) {
      for (let j = left; j < right; j++) {
          const cell = this.grid[i][j];
        if (cell) {
          return cell;
        }
      }
    }
  }

  removeActor(actor) {
    const index = this.actors.indexOf(actor);
    if (index !== -1) {
      this.actors.splice(index, 1);
    }
  }

  noMoreActors(title) {
    return !this.actors.some(el => el.type === title);
  }

  playerTouched(title, actor = {}) {
    if (this.status !== null) {
      return;
    }

    if (title === 'lava' || title === 'fireball') {
      this.status = 'lost';
    } else if(title === 'coin' && actor.type === 'coin') {
      this.removeActor(actor);
      if (this.noMoreActors(title)) {
        this.status = 'won';
      }
    }
  }
}

class LevelParser {
  constructor(gameObjects = {}) {
    this.gameObjects = gameObjects;
  }

  actorFromSymbol(symbol) {
    return this.gameObjects[symbol];
  }

  obstacleFromSymbol(symbol) {
    if (symbol === 'x') {
      return 'wall';
    }

    if (symbol === '!') {
      return "lava";
    }
  }

  createGrid(plan) {
  	let planEl = plan.map(
  		element => element.split('').map(el => this.obstacleFromSymbol(el))
  	);

    return planEl;
  }

  createActors(plan) {
    const actors = [];
    plan.forEach ((element, y) => {
      element.split('').forEach((el, x) => {
	  
	    /*
				Тут, я полагаю, что в цикле перебираются элементы игрового поля (карты), описанной в schemas
                Вот можете вывести их в консоль, они все выведуться.  (фаербол, стена, лава, пустые пространства и т.п.)
				
					console.dir (el);
				*/
	  
        const classActor = this.actorFromSymbol(el);
		  /*
				Здесь, как видим, возвращаются все элементы  игрофого поля
				
					console.dir (classActor);
				*/
          
        if (typeof classActor === 'function') {
		
		  /*console.dir (classActor);
                    Здесь проверяется уже что элемент - функция.  Т.е. это не пустое пространство. 
                    
						class FireRain
						class HorizontalFireball
						class Coin
						class Player
						class Coin
                    
                      Ну, понятно дело что соответсвие символов их  КЛАССАМ прописано в этом вот объекте. Он определён ниже.  Т.е.  каждый исмвол соответсвует своему классу!
                      А из класса мы можем сделать что?  Правильно - экземпляр класса - ОБЪЕКТ. 
                    
						const actorDict = {
						'@': Player,
						'v': VerticalFireball,
						'o': Coin,
						'=': HorizontalFireball,
						'|': FireRain
						};
					*/

		 
		  // Значит  мы можем  из неё создать экземпляр класса - ОБЪЕКТ
          const actor = new classActor(new Vector(x, y));
         /*
					Кратко.
					Перебрали поле   -> Если Символ - имеет свой класс Создадим объект -> Если объект унаследован от Actor -> Поместим его в массив
					*/
            
            if (actor instanceof Actor) {
		  console.dir (actor)
		   /* 
						 В массив  actors   можно  поместить только  экземпляры коасса унаследованные от Actor
                         Или же  В массив  actors   можно  поместить только объекты класса Actor
                         Всё объекты созданные на поле наследуют от одного родительского класса Actor 
						 */
            actors.push(actor);
          }
        }
      })
    });
    console.log(actors);
    return actors;

		
		
  }

  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan));
  }
}

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
    if (level.obstacleAt(this.getNextPosition(time), this.size)) {
      this.handleObstacle();
    } else {
      this.pos = this.getNextPosition(time);
    }
  }
  
}

class HorizontalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(2, 0));
  }
}

class VerticalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(0, 2));
  }
}

class FireRain extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(0, 3));
    this.startPos = pos;
  }

  handleObstacle() {
    this.pos = this.startPos;
  }
}

class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * 2 * Math.PI;
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
    this.updateSpring(time);
    return this.startPos.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5), new Vector(0, 0));
  }

  get type() {
    return 'player';
  }
}
const schemasWin = [
  [
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
	'                        ',
	'                        ',
	'                        ',
    '!!!!!!!!!!!!!!!!!!!!!!!!'
  ]
];  

const schemas = [
  [
    '           |            ',
    '    =                   ',
    '                      o ',
    '                      x  ',
    ' @    xxx          x   x',
    '   o           x        ',
    'xxx                     ',
	'             xx         ',
	'                        ',
	'                        ',
    '!!!!!!!!!!!!!!!!!!!!!!!!'
  ],
  [
     '           |           ',
    '    =                   ',
    '                        ',
    '                        ',
    ' @    xxx      o  x     ',
    '   o           x       o',
    'xxx                    x',
	'             xx         ',
	'                        ',
	'                        ',
    '!!!!!!!!!!!!!!!!!!!!!!!!'
  ],
  [
     '                       ',
    '                        ',
    '                        ',
    '                        ',
    ' @                      ',
    '   o o o o o o o o o o  ',
    'xxxxxxxxxxxxxxxxxxxxxxxx',
	'                        ',
	'                        ',
	'                        ',
    '!!!!!!!!!!!!!!!!!!!!!!!!'
  ]
];
const actorDict = {
  '@': Player,
  'v': VerticalFireball,
  'o': Coin,
  '=': HorizontalFireball,
  '|': FireRain
};

var gameWin = ()=> {
	console.log('Вы  выиграли приз!')
	const parser = new LevelParser(actorDict);
    runGame(schemasWin, parser, DOMDisplay)
    backgroundMain(4);
    function backgroundMain(n) {
    const element = document.getElementById("pole");
    if(n === 4){
       let background = element.classList.add("background-end");
    }
  }
}


const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => {gameWin()});