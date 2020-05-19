const TILE_SIZE = 32; //맵에 그려지는 벽(cube)의 가로,세로,길이 
const MAP_NUM_ROWS = 11;  //맵 11행
const MAP_NUM_COLS = 15;  //맵 15열
const WINDOW_WIDTH = MAP_NUM_COLS * 32;
const WINDOW_HEIGHT = MAP_NUM_ROWS * 32;

const FOV_ANGLE = 60 * (Math.PI / 180); //Field Of View 플레이어가 볼 수 있는 시각의 범위 60도를 radian으로 변환한 식.
const WALL_STRIP_WIDTH = 30; //컬럼들을 이와 같은 픽셀로 보이게 하겠다.
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH; //벽을 향해 투사할 ray의 개수는 윈도우 넓이를 위 픽셀로 나눈 것이다.

class Map {
  constructor() {
    this.grid = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];
  }

  hasWallAt(x, y) {
    if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
      return true;
    }
    var mapGridIndexX = Math.floor(x / TILE_SIZE);
    var mapGridIndexY = Math.floor(y / TILE_SIZE); //위의 2차원 배열을 볼 때 32픽셀 사이즈의 정사각형이므로 해당 위치의
    return this.grid[mapGridIndexY][mapGridIndexX] != 0; //픽셀을 32로 나눠서 소수점을 버리면 정확하게 2차원 배열의 위치를 알아낼 수 있다.
  }

  render() {
    for (var i = 0; i < MAP_NUM_ROWS; i++) {
      for (var j = 0; j < MAP_NUM_COLS; j++) {
        var tileX = j * TILE_SIZE;
        var tileY = i * TILE_SIZE; //스크린에서는 가로가 column이라서 x,y를 반전시켜야 한다.
        var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
        stroke("#222");
        fill(tileColor);
        rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

class Player {
  constructor() {
    this.x = WINDOW_WIDTH / 2;
    this.y = WINDOW_HEIGHT / 2;
    this.radius = 3;
    this.turnDirection = 0; //-1 if left, +1 if right
    this.walkDirection = 0; //-1 if back, +1 if front
    this.rotationAngle = Math.PI / 2;
    this.moveSpeed = 2.0;
    this.rotationSpeed = 2 * (Math.PI / 180); //2 degree씩 움직이겠다. 1 degree = PI / 180
  }

  update() {
    this.rotationAngle += this.turnDirection * this.rotationSpeed;

    var moveStep = this.walkDirection * this.moveSpeed;

    var newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
    var newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;
    //이동 후의 x,y,좌표를 얻기 위해서는 원래 x좌표에서 이동한 거리만큼 더한다.
    //이 때 삼각형에서 cos, sin을 이용해서 길이를 구할 수 있다.

    //벽이 아니라면 이동해라. 즉, 벽이 있으면 거기로는 못간다.
    if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
      this.x = newPlayerX;
      this.y = newPlayerY;
    }
  }

  render() {
    noStroke();
    fill("red");
    circle(this.x, this.y, this.radius);
    stroke("red");
    line(
      this.x,
      this.y,
      this.x + Math.cos(this.rotationAngle) * 30,
      this.y + Math.sin(this.rotationAngle) * 30
    );
  }
}

class Ray {
  constructor(rayAngle) {
    this.rayAngle = rayAngle;
  }
  render() {
    stroke("rgba(255,0,0,0.3)");

    line(
      player.x,
      player.y,
      player.x + Math.cos(this.rayAngle) * 30,  //ray가 30픽셀만큼만 간다고 가정하고 그린 것. 
      player.y + Math.sin(this.rayAngle) * 30
    );
  }
}

var grid = new Map();
var player = new Player();
var rays = [];

function keyPressed() {
  if (keyCode == UP_ARROW) {
    player.walkDirection = +1;
  } else if (keyCode == DOWN_ARROW) {
    player.walkDirection = -1;
  } else if (keyCode == RIGHT_ARROW) {
    player.turnDirection = +1;
  } else if (keyCode == LEFT_ARROW) {
    player.turnDirection = -1;
  }
}

function keyReleased() {
  if (keyCode == UP_ARROW) {
    player.walkDirection = 0;
  } else if (keyCode == DOWN_ARROW) {
    player.walkDirection = 0;
  } else if (keyCode == RIGHT_ARROW) {
    player.turnDirection = 0;
  } else if (keyCode == LEFT_ARROW) {
    player.turnDirection = 0;
  }
}

function castAllRays() {
  var columnId = 0;

  var rayAngle = player.rotationAngle - FOV_ANGLE / 2; //ray를 투사할 가장 왼 쪽부터 시작하기 위해 선언.
  rays = [];

  for (var i = 0; i < NUM_RAYS; i++) {
    var ray = new Ray(rayAngle);

    rays.push(ray);
    rayAngle += FOV_ANGLE / NUM_RAYS; //각 ray 사이의 거리만큼 더하면서 ray를 왼쪽에서 오른쪽으로 투사한다. 
    columnId++;
  }
}

function setup() {
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
  player.update();
  castAllRays();
}

function draw() {
  update();

  grid.render();
  for (ray of rays) {
    ray.render();
  }
  player.render();
}
