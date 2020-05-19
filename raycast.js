const TILE_SIZE = 32; //�ʿ� �׷����� ��(cube)�� ����,����,���� 
const MAP_NUM_ROWS = 11;  //�� 11��
const MAP_NUM_COLS = 15;  //�� 15��
const WINDOW_WIDTH = MAP_NUM_COLS * 32;
const WINDOW_HEIGHT = MAP_NUM_ROWS * 32;

const FOV_ANGLE = 60 * (Math.PI / 180); //Field Of View �÷��̾ �� �� �ִ� �ð��� ���� 60���� radian���� ��ȯ�� ��.
const WALL_STRIP_WIDTH = 30; //�÷����� �̿� ���� �ȼ��� ���̰� �ϰڴ�.
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH; //���� ���� ������ ray�� ������ ������ ���̸� �� �ȼ��� ���� ���̴�.

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
    var mapGridIndexY = Math.floor(y / TILE_SIZE); //���� 2���� �迭�� �� �� 32�ȼ� �������� ���簢���̹Ƿ� �ش� ��ġ��
    return this.grid[mapGridIndexY][mapGridIndexX] != 0; //�ȼ��� 32�� ������ �Ҽ����� ������ ��Ȯ�ϰ� 2���� �迭�� ��ġ�� �˾Ƴ� �� �ִ�.
  }

  render() {
    for (var i = 0; i < MAP_NUM_ROWS; i++) {
      for (var j = 0; j < MAP_NUM_COLS; j++) {
        var tileX = j * TILE_SIZE;
        var tileY = i * TILE_SIZE; //��ũ�������� ���ΰ� column�̶� x,y�� �������Ѿ� �Ѵ�.
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
    this.rotationSpeed = 2 * (Math.PI / 180); //2 degree�� �����̰ڴ�. 1 degree = PI / 180
  }

  update() {
    this.rotationAngle += this.turnDirection * this.rotationSpeed;

    var moveStep = this.walkDirection * this.moveSpeed;

    var newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
    var newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;
    //�̵� ���� x,y,��ǥ�� ��� ���ؼ��� ���� x��ǥ���� �̵��� �Ÿ���ŭ ���Ѵ�.
    //�� �� �ﰢ������ cos, sin�� �̿��ؼ� ���̸� ���� �� �ִ�.

    //���� �ƴ϶�� �̵��ض�. ��, ���� ������ �ű�δ� ������.
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
      player.x + Math.cos(this.rayAngle) * 30,  //ray�� 30�ȼ���ŭ�� ���ٰ� �����ϰ� �׸� ��. 
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

  var rayAngle = player.rotationAngle - FOV_ANGLE / 2; //ray�� ������ ���� �� �ʺ��� �����ϱ� ���� ����.
  rays = [];

  for (var i = 0; i < NUM_RAYS; i++) {
    var ray = new Ray(rayAngle);

    rays.push(ray);
    rayAngle += FOV_ANGLE / NUM_RAYS; //�� ray ������ �Ÿ���ŭ ���ϸ鼭 ray�� ���ʿ��� ���������� �����Ѵ�. 
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
