const { Engine, World, Bodies, Mouse, MouseConstraint, Constraint, Collision } = Matter;

// ********************************** PARAMETER **********************************

const SLING_XPOS   = 200;
const SLING_YPOS   = 300;
const BOX_XPOS     = [750, 750, 750];
const BOX_YPOS     = [300, 300-75, 300-75-75];

// ********************************** Variables **********************************

// Object
let ground, slingshot, world, engine, mConstraint;

let bird;
const boxes = [];

let worldObj = [];
let worldObjPairs = [];


// Object Images
let RedBirdImg;
let boxImg;
let bkgImg;


// WebSocket
const IP = "127.0.0.1";
const PORT = "8081";
var oscPort;

// ********************************** Core Functions **********************************

function preload() {
  RedBirdImg = loadImage('./images/RedBird.png');
  wood1_Img = loadImage('./images/wood-1.png');
  bkgImg = loadImage('./images/background.png');
}

function setup() {
  const canvas = createCanvas(1000, 500);
  engine = Engine.create();
  world = engine.world;
  const mouse = Mouse.create(canvas.elt);
  const options = {
    mouse: mouse
  };
  
  // A fix for HiDPI displays
  mouse.pixelRatio = pixelDensity();
  mConstraint = MouseConstraint.create(engine, options);
  World.add(world, mConstraint);
  
  // Ground
  ground = new Ground(width / 2, height - 10, width, 20);
  
  // Box
  for (let i = 0; i < 1; i++) {
    boxes[i] = new Box(BOX_XPOS[i], BOX_YPOS[i], 85, 20);
    worldObj.push(boxes[i]);
  }
  
  // Bird
  bird = new RedBird(300, 300, 25);

  // Slingshot
  slingshot = new SlingShot(SLING_XPOS, SLING_YPOS, bird.body);

  
  // Utility
  worldObj.push(bird);
  worldObj.push(ground);
  worldObjPairs = generatePairs(worldObj);

  worldObj.forEach(Obj => {
    //World.add(world, Obj);
    console.log(Obj);
  });
  
  connectSocket();
}


function keyPressed() {
  if (key == ' ') {
    World.remove(world, bird.body);
    bird = new RedBird(150, 300, 25);
    slingshot.attach(bird.body);
  }
}

function mouseReleased() {
  setTimeout(() => {
    slingshot.fly();
  }, 100);
}

function draw() {
  background(bkgImg);
  Matter.Engine.update(engine);
  ground.show();
  for (let box of boxes) {
    box.show();
  }
  slingshot.show();
  bird.show();
  detectCollision();
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

function getMovedDist(){
    
}

function detectCollision() {
  worldObjPairs.forEach(pairs => {
    if((pairs[0].body.speed>0 || pairs[1].body.speed>0) &&Collision.collides(pairs[0].body, pairs[1].body) != null){
      console.log(pairs[0].body.velocity);
    }
    //console.log(Collision.collides(pairs[0].body, pairs[1].body));
  });
}
