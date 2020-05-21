const TILE_SIZE = 64; //맵에 그려지는 벽(cube)의 가로,세로,길이
const MAP_NUM_ROWS = 11; //맵 11행
const MAP_NUM_COLS = 15; //맵 15열
const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180); //Field Of View 플레이어가 볼 수 있는 시각의 범위 60도를 radian으로 변환한 식.
const WALL_STRIP_WIDTH = 1; //벽 한 큐브의 컬럼 하나를 이와 같은 픽셀로 하겠다.
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH; //하나의 벽(cube)을 향해 투사할 ray의 개수는 윈도우 넓이를 위 픽셀로 나눈 것이다.

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
    this.y = WINDOW_HEIGHT / 2; //최초위치를 맵의 정 가운데로
    this.radius = 3; //플레이어 원 모양의 반지름 3픽셀
    this.turnDirection = 0; //-1 if left, +1 if right
    this.walkDirection = 0; //-1 if back, +1 if front
    this.rotationAngle = Math.PI / 2; //최초위치 90도
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
    /*stroke("red");
		line(
			this.x,
			this.y,
			this.x + Math.cos(this.rotationAngle) * 30,
			this.y + Math.sin(this.rotationAngle) * 30
		);*/
  }
}

class Ray {
  constructor(rayAngle) {
    this.rayAngle = normalizeAngle(rayAngle);
    this.wallHitX = 0;
    this.wallHitY = 0;
    this.distance = 0;
    this.wasHitVertical = false;

    this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI; //아래를 바라보고있으면 라디안 값의 범위가 이렇다.
    this.isRayFacingUp = !this.isRayFacingDown;

    this.isRayFacingRight =
      this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
    this.isRayFacingLeft = !this.isRayFacingRight;
  }
  cast(columnId) {
    var xintercept, yintercept;
    var xstep, ystep;

    /* HORIZONTAL INTERCECTION CHECK */
    var foundHorzWallHit = false;
    var horzWallHitX = 0;
    var horzWallHitY = 0;

    yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE; //가장 가까운 y축 접점을 찾는 방법(ray가 위를 향할 때만)
    yintercept += this.isRayFacingDown ? TILE_SIZE : 0; //아래를 보고 있으면 바로 위에서 TILE_SIZE만큼 더해야 상하 반전돼서 아래 접정이 된다.
    xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle); //그 접점의 x좌표를 위에서 구한 y좌표를 활용해 삼각비로 구함

    ystep = TILE_SIZE; //벽을 찾을때까지 계속 더할 y값
    ystep *= this.isRayFacingUp ? -1 : 1; //ray가 위를 향해 있으면 ystep이 점점 줄어야 하므로 음수로 한다.

    xstep = TILE_SIZE / Math.tan(this.rayAngle);
    xstep *= this.isRayFacingLeft && xstep > 0 ? -1 : 1; //왼쪽으로 향하면 음수로 해준다. 양수일 때만
    xstep *= this.isRayFacingRight && xstep < 0 ? -1 : 1; //오른쪽으로 향하면 양수로 바꿔준다. 음수이면.

    var nextHorzTouchX = xintercept;
    var nextHorzTouchY = yintercept;

    if (this.isRayFacingUp) {
      nextHorzTouchY--;
    } //위를 향하고 있으면 그 경계가 yintercept가 되므로 --를 해줘서 한 픽셀 위로 올라가게 한다. 그러면 wall이다.

    while (
      nextHorzTouchX >= 0 &&
      nextHorzTouchX <= WINDOW_WIDTH &&
      nextHorzTouchY >= 0 &&
      nextHorzTouchY <= WINDOW_HEIGHT
    ) {
      if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY)) {
        foundHorzWallHit = true;
        horzWallHitX = nextHorzTouchX;
        horzWallHitY = nextHorzTouchY; //HORIZONTAL로 검사했을 때 벽과 닿는 지점의 x좌표와 y좌표

        stroke("red");
        line(player.x, player.y, horzWallHitX, horzWallHitY);

        break;
      } else {
        nextHorzTouchX += xstep;
        nextHorzTouchY += ystep;
      } //벽에 닿을 때까지 계속 step을 늘려주면서 찾는다.
    }

    /* VERTICAL INTERCECTION CHECK */
    var foundVertWallHit = false;
    var vertWallHitX = 0;
    var vertWallHitY = 0;

    xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE; //가장 가까운 수직 접점의 x좌표를 구한다.
    xintercept += this.isRayFacingRight ? TILE_SIZE : 0;

    yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);
    //위에서 구한 x좌표를 이용해서 삼각비로 y좌표를 구한다.

    xstep = TILE_SIZE;
    xstep *= this.isRayFacingLeft ? -1 : 1;

    ystep = TILE_SIZE * Math.tan(this.rayAngle);
    ystep *= this.isRayFacingUp && ystep > 0 ? -1 : 1;
    ystep *= this.isRayFacingDown && ystep < 0 ? -1 : 1;

    var nextVertTouchX = xintercept;
    var nextVertTouchY = yintercept;

    if (this.isRayFacingLeft) {
      nextVertTouchX--;
    } //ray가 왼쪽으로 가고 있을 때는 y축의 경계에 닿아있는 것이므로 벽을 확인하려면 --를 해줘서 벽 안으로 한 픽셀 더 들어가야 한다.

    while (
      nextVertTouchX >= 0 &&
      nextVertTouchX <= WINDOW_WIDTH &&
      nextVertTouchY >= 0 &&
      nextVertTouchY <= WINDOW_HEIGHT
    ) {
      if (grid.hasWallAt(nextVertTouchX, nextVertTouchY)) {
        foundVertWallHit = true;
        vertWallHitX = nextVertTouchX;
        vertWallHitY = nextVertTouchY;
        break;
      } else {
        nextVertTouchX += xstep;
        nextVertTouchY += ystep;
      }
    }

    //Horizontal 거리와 Vertical거리를 구해서 더 짧은 걸로 선택한다.
    var horzHitDistance = foundHorzWallHit
      ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY)
      : Number.MAX_VALUE;

    var vertHitDistance = foundVertWallHit
      ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
      : Number.MAX_VALUE;

    //거리를 비교해서 더 짧은 거리를 저장한다.
    this.wallHitX =
      horzHitDistance < vertHitDistance ? horzWallHitX : vertWallHitX;
    this.wallHitY =
      horzHitDistance < vertHitDistance ? horzWallHitY : vertWallHitY;
    this.distance =
      horzHitDistance < vertHitDistance ? horzHitDistance : vertHitDistance;
    this.wasHitVertical = vertHitDistance < horzHitDistance;
  }
  render() {
    stroke("rgba(255,0,0,0.3)");

    line(player.x, player.y, this.wallHitX, this.wallHitY);
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
    ray.cast(columnId);

    rays.push(ray);
    rayAngle += FOV_ANGLE / NUM_RAYS; //각 ray 사이의 거리만큼 더하면서 ray를 왼쪽에서 오른쪽으로 투사한다.
    columnId++;
  }
}

//angle이 360도 즉 0부터 2파이 범위 안에 있도록 하는 함수
function normalizeAngle(angle) {
  angle = angle % (2 * Math.PI);
  if (angle < 0) {
    angle = 2 * Math.PI + angle;
  }
  return angle;
}

function distanceBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
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
