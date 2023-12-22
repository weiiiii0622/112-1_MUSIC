const { Engine, World, Bodies, Mouse, MouseConstraint, Constraint, Collision, Detector } = Matter;

// ********************************** PARAMETER **********************************
const DEBUG        = 1;
const FONT_SIZE    = 40;
const GAME_TIME    = 60; // seconds

const SLING_XPOS   = 0.15;
const SLING_YPOS   = 0.75;

const BOX_XPOS     = [250, 100, 175];
const BOX_YPOS     = [0, 0, 85];
const BOX_TYPE     = [1, 1, 2];
const BOX_SIZEX    = [85, 20, 203,  18, 80, 38];
const BOX_SIZEY    = [20, 85,  18, 203, 38, 80];

const TOTAL_BIRDS  = 5;

// ********************************** Variables **********************************

// Object
let ground, slingshot, world, engine, mConstraint;
let collideDetector;

let bird;
let current_bird = 1;
const birds = [];

let boxCount = 3;
const boxes = [];

let worldObj = [];
let worldObjPairs = [];


// Object Images
let RedBirdImg;
let boxImg = [];
let bkgImg;

// Font
let font;

// Timer

let isReset = 0;
let gameTimer;
let remainingTime;

// WebSocket
const IP = "127.0.0.1";
const PORT = "8081";
var oscPort;

// ********************************** Core Functions **********************************

function preload() {
  RedBirdImg = loadImage('./images/RedBird.png');
  boxImg[0] = loadImage('./images/wood-1.png');    // short left-right
  boxImg[1] = loadImage('./images/wood-1-2.png');  // short top-down
  boxImg[2] = loadImage('./images/wood-2.png');    // long  lr
  boxImg[3] = loadImage('./images/wood-2-2.png');  // long  td
  boxImg[4] = loadImage('./images/wood-3.png');    // fat   lr
  boxImg[5] = loadImage('./images/wood-3-2.png');  // fat   td
  bkgImg = loadImage('./images/background.png');
  groundImg = loadImage('./images/ground.jpg');
  
  font = loadFont('./assets/angrybirds-regular.ttf');
}

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  
  // Text
  textFont(font);
  textSize(FONT_SIZE);
  textAlign(CENTER, CENTER);
  
  // Timer
  gameTimer = new Timer((GAME_TIME+1) * 1000, false);
  
  // Game Engine
  engine = Engine.create();
  world = engine.world;
  const mouse = Mouse.create(canvas.elt);
  const options = {
    mouse: mouse
  };
  mouse.pixelRatio = pixelDensity();
  mConstraint = MouseConstraint.create(engine, options);
  World.add(world, mConstraint);
 
  // Ground
  ground = new Ground(width / 2, height - 10, width, 20, groundImg);
  
  // Bird
  bird = new RedBird(300, 300, 30, RedBirdImg);
  worldObj.push(bird);
  
  // Box
  for(let i = 0; i < boxCount; i++){
    boxes[i] = new Box(width - BOX_XPOS[i], height-20 - BOX_YPOS[i], BOX_SIZEX[BOX_TYPE[i]], BOX_SIZEY[BOX_TYPE[i]], boxImg[BOX_TYPE[i]]);
    worldObj.push(boxes[i]);
  }
  
  // Slingshot
  slingshot = new SlingShot(width * SLING_XPOS, height * SLING_YPOS, bird.body);

  // Collision
  worldObj.push(ground);
  worldObjPairs = generatePairs(worldObj);

  worldObj.forEach(Obj => {
    console.log(Obj);
  });
  
  gameTimer.reset();
  gameTimer.start();
  
  // Socket
  connectSocket();
}

function reset(){
  console.log("Reset!");
  isReset = 1;
  worldObj = [];
  
  // Reset Bird
  World.remove(world, bird.body);
  bird = new RedBird(300, 300, 30, RedBirdImg);
  worldObj[0] = bird;
  worldObjPairs = generatePairs(worldObj);
  current_bird = 1;
  slingshot.attach(bird.body);
  
  // Reset Box
  for(let i = 0; i < boxCount; i++){
    World.remove(world, boxes[i].body);
    boxes[i] = new Box(width - BOX_XPOS[i], height-20 - BOX_YPOS[i], BOX_SIZEX[BOX_TYPE[i]], BOX_SIZEY[BOX_TYPE[i]], boxImg[BOX_TYPE[i]]);
    worldObj.push(boxes[i]);
  }
  console.log(worldObj);
  
  // Timer
  gameTimer.reset();
  gameTimer.start();
  
  isReset = 0;
}


function keyPressed() {
  if (key == ' ') {
    if(!slingshot.isAttach()){
      // slingshot is now empty
      World.remove(world, bird.body);
      bird = new RedBird(300, 300, 30, RedBirdImg);
      
      // Regenerate pairs for collision detection since the bird is a new object
      worldObj[0] = bird;
      console.log(worldObj);
      worldObjPairs = generatePairs(worldObj);
      current_bird += 1;
      slingshot.attach(bird.body);
     
    }
  }
  else if(key == 'r'){
     reset(); 
  }
}

function mouseReleased() {
  setTimeout(() => {
    slingshot.fly();
  }, 50);
}

function draw() {
  background(bkgImg);
  stroke(0);
  
  // Timer
  if(isReset == 0){
    fill(0);
    remainingTime = int(gameTimer.getRemainingTime() / 1000);
    str = 'R e m a i n i n g : ' + remainingTime;
    text(str, 180, 50);
    
    // Game
    Engine.update(engine);
    ground.show();
    for (let box of boxes) {
      box.show();
    }
    bird.show();
    slingshot.show();
    detectCollision();
   }
}


// ********************************** Socket Related **********************************
function createPacket(address, isActive, x_coord, y_coord, x_speed, y_speed) {
  return {
        address: address,
        args: [
                {
                    type: "f",
                    value: isActive
                },
                {
                    type: "f",
                    value: x_coord
                },
                {
                    type: "f",
                    value: y_coord
                },
                {
                    type: "f",
                    value: x_speed
                },
                {
                    type: "f",
                    value: y_speed
                },
        ]
    };
}

function connectSocket(){
    oscPort = new osc.WebSocketPort({
      url: "ws://"+IP+":"+PORT // URL to your Web Socket server.
    });
    
    
    console.log(oscPort)
    oscPort.open();
    oscPort.on("ready", function () {
      console.log("connected");
      oscPort.send(createPacket("/wood", 1, 12, 34, 56, 78));
      oscPort.send(createPacket("/bird", -1, -12, -34, -56, -78));
    });
    oscPort.on("error", function (e) {
      console.log("error:")
      console.log(e.message)
    });
}

// ********************************** Game Related ********************************** 
function generatePairs(list) {
  let pairs = [];
  for (let i = 0; i < list.length - 1; i++) {
    for (let j = i + 1; j < list.length; j++) {
      pairs.push([list[i], list[j]]);
    }
  }
  return pairs;
}

function checkValidCollision(obj1, obj2){
  // Collided
  const speed_thres = 0.009;
  if(Collision.collides(obj1.body, obj2.body) != null){
    // Some condtion that they are newly collided
    if((obj1.type == "ground" || obj1.body.speed > speed_thres) && (obj2.type == "ground" || obj2.body.speed > speed_thres)){
      return true
    }
  }
  return false;
}

function handleCollision(obj1, obj2){
   if(DEBUG) console.log(obj1.type , obj2.type, "collided!", obj1.body.speed, obj2.body.speed);
   
   if(obj1.type == "box" || obj2.type == "box"){    
     // box collide with anything -> box sound
   }
   else if(obj1.type == "bird" || obj2.type == "bird"){ 
     // bird collide -> bird sound stop
   }
   else if(obj1.type == "pig" && obj2.type == "ground" || obj1.type == "ground" && obj2.type == "pig"){
     // pig collide with ground -> pig die
   }
}

function detectCollision(collisionDetector) {
  worldObjPairs.forEach(pairs => {
    if(checkValidCollision(pairs[0], pairs[1])){
      handleCollision(pairs[0], pairs[1]);
    }
  });
}
