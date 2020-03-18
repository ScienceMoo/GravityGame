var canvas;
var context; // used for drawing on the canvas

var mars = false;
var earth = false;
var moon = false;
var jupiter = false;
var marsBackground = new Image();
marsBackground.src = "mars.jpg";
var earthBackground = new Image();
earthBackground.src = "earth.png";
var moonBackground = new Image();
moonBackground.src = "moon.jpg";
var jupiterBackground = new Image();
jupiterBackground.src = "jupiter.jpg";

var bluePortal = new Image();
bluePortal.src = "blueportal.png";

var scores = 0;

var missed = true;

DARK_COLOR = "black";
LIGHT_COLOR = "lavender";

// constants for game play
var TARGET_PIECES = 7; // sections in the target
var MISS_PENALTY = 2; // seconds deducted on a miss
var HIT_REWARD = 3; // seconds added on a hit
var TIME_INTERVAL = 25; // screen refresh interval in milliseconds

// variables for the game loop and tracking statistics
var intervalTimer; // holds interval timer
var timerCount; // number of times the timer fired since the last second
var timeLeft; // the amount of time left in seconds
var shotsFired; // the number of shots the user has fired
var timeElapsed; // the number of seconds elapsed

// variables for the blocker and target
var blocker; // start and end points of the blocker
var blockerDistance; // blocker distance from left
var blockerBeginning; // blocker distance from top
var blockerEnd; // blocker bottom edge distance from top
var blockerLength;
var initialBlockerVelocity; // initial blocker speed multiplier
var blockerVelocity; // blocker speed multiplier during game

var blockerSpeed = 300;

var blockerThreshhold;
var targetThreshhold;

var target; // start and end points of the target
var targetDistance; // target distance from left
var targetBeginning; // target distance from top
var targetEnd; // target bottom's distance from top
var pieceLength; // length of a target piece
var initialTargetVelocity; // initial target speed multiplier
var targetVelocity; // target speed multiplier during game

var lineWidth; // width of the target and blocker
var hitStates; // is each target piece hit?
var targetPiecesHit; // number of target pieces hit (out of 7)

// variables for the cannon and cannonball
var cannonball; // cannonball image's upper-left corner
var cannonballOnScreen; // is the cannonball on the screen

var cannonballVelocity; // cannonball's velocity
var cannonballRadius = 20; // cannonball radius
var cannonballSpeed = 700 * 1.5; // cannonball speed
var cannonballBaseSpeed = 700 * 1.5;
var cannonballVolume; // m^3
var cannonballDensity = 7860; //  kg per m^3
var cannonballMass; // in kg

var gravity = -9.8;

var cannon;
var cannonBaseRadius; // cannon base radius
var cannonLength; // cannon barrel length
var barrelEnd; // the end point of the cannon's barrel
var barrelDif;
var canvasWidth; // width of the canvas
var canvasHeight; // height of the canvas

// variables for sounds
var targetSound;
var cannonSound;
var blockerSound;
var planetSound;
var missedSound;
var monsterSound;

// called when the app first launches
function setupGame()
{
   // stop timer if document unload event occurs
   document.addEventListener( "unload", stopTimer, false );
   document.addEventListener( "keypress", newGame, false );
   document.addEventListener( "keydown", moveCannon, false);

   // get the canvas, its context and setup its click event handler
   canvas = document.getElementById( "theCanvas" );
   context = canvas.getContext("2d");

   // Planets
   document.getElementById( "marsButton" ).addEventListener(
      "click", goToMars, false );
   document.getElementById( "earthButton" ).addEventListener(
      "click", goToEarth, false );
   document.getElementById( "moonButton" ).addEventListener(
      "click", goToMoon, false );
   document.getElementById( "jupButton" ).addEventListener(
      "click", goToJupiter, false );

   // start a new game when user clicks Start Game button
   document.getElementById( "startButton" ).addEventListener( 
      "click", newGame, false );
   document.getElementById( "resetButton" ).addEventListener(
      "click", reset, false );

   document.getElementById( "increaseSpeed" ).addEventListener(
      "click", increaseSpeed);
   document.getElementById( "decreaseSpeed" ).addEventListener(
      "click", decreaseSpeed);

   document.getElementById( "increaseTargets" ).addEventListener(
      "click", increaseTargets);
   document.getElementById( "decreaseTargets" ).addEventListener(
      "click", decreaseTargets);

   document.getElementById( "increaseBallSize" ).addEventListener(
      "click", increaseBallSize);
   document.getElementById( "decreaseBallSize" ).addEventListener(
      "click", decreaseBallSize);
   /*document.getElementById( "inputRadius" ).addEventListener(
      "submit", toggleRadius);*/

   document.getElementById( "increaseBallSpeed" ).addEventListener(
      "click", increaseBallSpeed);
   document.getElementById( "decreaseBallSpeed" ).addEventListener(
      "click", decreaseBallSpeed);

   document.getElementById( "increaseBallDensity" ).addEventListener(
      "click", increaseBallDensity);
   document.getElementById( "decreaseBallDensity" ).addEventListener(
      "click", decreaseBallDensity);

   document.getElementById( "increaseGravity" ).addEventListener(
      "click", increaseGravity);
   document.getElementById( "decreaseGravity" ).addEventListener(
      "click", decreaseGravity);
   document.getElementById( "reverseGravity" ).addEventListener(
      "click", reverseGravity);

   // JavaScript Object representing game items
   blocker = new Object(); // object representing blocker line
   blocker.start = new Object(); // will hold x-y coords of line start
   blocker.end = new Object(); // will hold x-y coords of line end
   target = new Object(); // object representing target line
   target.start = new Object(); // will hold x-y coords of line start
   target.end = new Object(); // will hold x-y coords of line end
   cannonball = new Object(); // object representing cannonball point
   cannonballVelocity = new Object();  //will hold x-y coords of velocity
   barrelEnd = new Object(); // object representing end of cannon barrel
   cannon = new Object();

   // initialize hitStates as an array
   hitStates = new Array(TARGET_PIECES);

   blockerThreshhold = new Object(); // will hold x-y coords of blocker threshhold
   targetThreshhold = new Object(); // will hold x-y coords

   // get sounds
   targetSound = document.getElementById( "targetSound" );
   cannonSound = document.getElementById( "cannonSound" );
   blockerSound = document.getElementById( "blockerSound" );
   planetSound = document.getElementById( "planetSwitchSound" );
   missedSound = document.getElementById( "missedSound" );
   monsterSound = document.getElementById( "monsterSound" );
   newGame();
} // end function setupGame

// set up interval timer to update game
function startTimer()
{
   canvas.addEventListener( "click", fireCannonball, false );
   intervalTimer = window.setInterval( updatePositions, TIME_INTERVAL );
} // end function startTimer

// terminate interval timer
function stopTimer()
{
   canvas.removeEventListener( "click", fireCannonball, false );
   window.clearInterval( intervalTimer );
} // end function stopTimer

// called by function newGame to scale the size of the game elements
// relative to the size of the canvas before the game begins
function resetElements()
{
   var w = canvas.width;
   var h = canvas.height;
   canvasWidth = w; // store the width
   canvasHeight = h; // store the height
   cannonBaseRadius = cannonballRadius * 1.1;
   cannonLength = cannonBaseRadius * 3;

   //cannonballRadius = w / 36; // cannonball radius 1/36 canvas width
   //cannonballSpeed = w * 1.3; // cannonball speed multiplier

   lineWidth = w / 40; // target and blocker 1/24 canvas width

   // configure instance variables related to the blocker
   blockerDistance = w * 5 / 8; // blocker 5/8 canvas width from left
   blockerBeginning = h / 8; // distance from top 1/8 canvas height
   blockerEnd = h * 3 / 8; // distance from top 3/8 canvas height
   blockerLength = (blockerEnd - blockerBeginning);
   initialBlockerVelocity = h / 2; // initial blocker speed multiplier
   blocker.start.x = blockerDistance;
   blocker.start.y = blockerBeginning;
   blocker.end.x = blockerDistance;
   blocker.end.y = blockerEnd;

   // configure instance variables related to the target
   targetDistance = w * 7 / 8; // target 7/8 canvas width from left
   targetBeginning = h / 8; // distance from top 1/8 canvas height
   targetEnd = h * 7 / 8; // distance from top 7/8 canvas height
   pieceLength = (targetEnd - targetBeginning) / TARGET_PIECES;
   initialTargetVelocity = -h / 4; // initial target speed multiplier
   target.start.x = targetDistance;
   target.start.y = targetBeginning;
   target.end.x = targetDistance;
   target.end.y = targetEnd;

   // end point of the cannon's barrel initially points horizontally
   cannon.y = canvasHeight / 2;
   barrelEnd.x = cannonLength;
   barrelEnd.y = cannon.y;
   blockerThreshhold.x = 20;
   targetThreshhold.x = 20;
   blockerThreshhold.y = (cannonballRadius * 5) / blockerLength;
   targetThreshhold.y = cannonballRadius * 2 / pieceLength;
   if (targetThreshhold.y < 0.5) {
      targetThreshhold.y = 0.5;
   }

   let r = cannonballRadius/100;
   cannonballVolume = 4 * Math.PI * r * r * r / 3;
   cannonballMass = cannonballDensity * cannonballVolume;

   document.getElementById("speed").innerHTML = blockerSpeed + " pixels/second";
   document.getElementById("targets").innerHTML = TARGET_PIECES + " targets";
   document.getElementById("ballSize" +
       "").innerHTML = cannonballRadius + " cm";
   document.getElementById("volumeEquation").innerHTML = cannonballRadius;
   cannonballVolume = cannonballVolume * 100;
   cannonballVolume = Math.trunc(cannonballVolume);
   cannonballVolume = cannonballVolume / 100;
   document.getElementById("volume").innerHTML = cannonballVolume;

   document.getElementById("ballSpeed").innerHTML = cannonballBaseSpeed + " m/s";
   document.getElementById("ballDensity").innerHTML = cannonballDensity + " kg/m<sup>3</sup>";
   document.getElementById("gravity").innerHTML = gravity + " m/s<sup>2</sup>";
   cannonballMass = cannonballMass * 100;
   cannonballMass = Math.trunc(cannonballMass);
   cannonballMass = cannonballMass/100;
   document.getElementById("mass").innerHTML = cannonballMass;
} // end function resetElements

// reset all the screen elements and start a new game
function newGame()
{
   resetElements(); // reinitialize all game elements
   stopTimer(); // terminate previous interval timer
   document.getElementById( "startButton" ).value = "Restart";

   // set every element of hitStates to false--restores target pieces
   for (var i = 0; i < TARGET_PIECES; ++i)
      hitStates[i] = false; // target piece not destroyed

   targetPiecesHit = 0; // no target pieces have been hit
   blockerVelocity = initialBlockerVelocity; // set initial velocity
   targetVelocity = initialTargetVelocity; // set initial velocity
   timeLeft = 30; // start the countdown at 10 seconds
   timerCount = 0; // the timer has fired 0 times so far
   cannonballOnScreen = false; // the cannonball is not on the screen
   shotsFired = 0; // set the initial number of shots fired
   timeElapsed = 0; // set the time elapsed to zero

   startTimer(); // starts the game loop
} // end function newGame

function moveCannon(event) {
   var key = event.code;
   if (key === "ArrowUp") {
      console.log("up arrow pressed");
      if ((cannon.y > cannonBaseRadius + 50) && (barrelEnd.y > cannonBaseRadius + 50)) {
         cannon.y = cannon.y - 50;
         barrelEnd.y = cannon.y;
         barrelDif = cannon.y - barrelEnd.y;
      }
   }
   else if (key === "ArrowDown"){
      if ((cannon.y < canvasHeight - cannonBaseRadius - 50) && (barrelEnd.y < canvasHeight - cannonBaseRadius - 50)) {
         cannon.y = cannon.y + 50;
         barrelEnd.y = cannon.y;
      }
   }
}

function goToMars() {
   earth = false;
   mars = true;
   moon = false;
   jupiter = false;

   DARK_COLOR = "red";
   LIGHT_COLOR = "white";

   gravity = -3.7;
   document.getElementById("gravity").innerHTML = gravity + " m/s<sup>2</sup>";
   draw();
   planetSound.play();
}

function goToEarth() {
   earth = true;
   mars = false;
   moon = false;
   jupiter = false;

   DARK_COLOR = "green";
   LIGHT_COLOR = "white";

   gravity = -9.8;
   document.getElementById("gravity").innerHTML = gravity + " m/s<sup>2</sup>";
   draw();
   monsterSound.play();
}

function goToMoon() {
   earth = false;
   mars = false;
   moon = true;
   jupiter = false;

   DARK_COLOR = "orange";
   LIGHT_COLOR = "white";

   gravity = -1.6;
   document.getElementById("gravity").innerHTML = gravity + " m/s<sup>2</sup>";
   planetSound.play();
   draw();
}
function goToJupiter() {
   earth = false;
   mars = false;
   moon = false;
   jupiter = true;

   DARK_COLOR = "blue";
   LIGHT_COLOR = "white";

   gravity = -24.8;
   document.getElementById("gravity").innerHTML = gravity + " m/s<sup>2</sup>";
   planetSound.play();
   draw();
}

function reset() {
   blockerSpeed = 300;
   blockerVelocity = 300;

   cannonballRadius = 20; // cannonball radius
   cannonballSpeed = 700 * 1.5; // cannonball speed
   cannonballBaseSpeed = 700 * 1.5;
   cannonballDensity = 7860; //  kg per m^3
   gravity = -9.8;

   blockerThreshhold.y = (cannonballRadius * 5) / blockerLength;
   targetThreshhold.y = cannonballRadius * 2 / pieceLength;
   if (targetThreshhold.y < 0.5) {
      targetThreshhold.y = 0.5;
   }

   let r = cannonballRadius/100;
   cannonballVolume = 4 * Math.PI * r * r * r / 3;
   cannonballMass = cannonballDensity * cannonballVolume;

   document.getElementById("speed").innerHTML = blockerSpeed + " pixels/second";
   document.getElementById("targets").innerHTML = TARGET_PIECES + " targets";
   document.getElementById("ballSize" +
       "").innerHTML = cannonballRadius + " cm";
   document.getElementById("volumeEquation").innerHTML = cannonballRadius;
   cannonballVolume = cannonballVolume * 100;
   cannonballVolume = Math.trunc(cannonballVolume);
   cannonballVolume = cannonballVolume / 100;
   document.getElementById("volume").innerHTML = cannonballVolume;
   cannonballMass = cannonballMass * 100;
   cannonballMass = Math.trunc(cannonballMass);
   cannonballMass = cannonballMass/100;
   document.getElementById("mass").innerHTML = cannonballMass;
   document.getElementById("ballSpeed").innerHTML = cannonballBaseSpeed + " m/s";
   document.getElementById("ballDensity").innerHTML = cannonballDensity + " kg/m<sup>3</sup>";
   document.getElementById("gravity").innerHTML = gravity + " m/s<sup>2</sup>";
}

function increaseSpeed() {
   blockerVelocity = blockerVelocity*1.5;
   blockerSpeed = blockerSpeed*1.5;
   blockerSpeed = Math.trunc(blockerSpeed);
   document.getElementById("speed").innerHTML = blockerSpeed + " pixels/second";
   blockerThreshhold.y = blockerThreshhold.y * 1.2;
}

function decreaseSpeed() {
   blockerVelocity = blockerVelocity/1.5;
   blockerSpeed = blockerSpeed/1.5;
   blockerSpeed = Math.trunc(blockerSpeed);
   document.getElementById("speed").innerHTML = blockerSpeed + " pixels/second";
   blockerThreshhold.y = blockerThreshhold.y / 1.2;
}

function increaseBallSpeed() {
   cannonballBaseSpeed = cannonballBaseSpeed + 50;
   cannonballSpeed = cannonballSpeed + 50;
   document.getElementById("ballSpeed").innerHTML = cannonballBaseSpeed + " m/s";
   blockerThreshhold.y = blockerThreshhold.y * 1.05;
}

function decreaseBallSpeed() {
   cannonballBaseSpeed = cannonballBaseSpeed - 50;
   cannonballSpeed = cannonballSpeed - 50;
   document.getElementById("ballSpeed").innerHTML = cannonballBaseSpeed + " m/s";
   blockerThreshhold.y = blockerThreshhold.y / 1.05;
}

function increaseBallDensity() {
   cannonballDensity = cannonballDensity + 200;
   document.getElementById("ballDensity").innerHTML = cannonballDensity + " kg/m<sup>3</sup>";
   cannonballMass = cannonballDensity * cannonballVolume;

   cannonballMass = cannonballMass * 100;
   cannonballMass = Math.trunc(cannonballMass);
   cannonballMass = cannonballMass/100;
   document.getElementById("mass").innerHTML = cannonballMass;

}

function decreaseBallDensity() {
   cannonballDensity = cannonballDensity - 200;
   document.getElementById("ballDensity").innerHTML = cannonballDensity + " kg/m<sup>3</sup>";
   cannonballMass = cannonballDensity * cannonballVolume;

   cannonballMass = cannonballMass * 100;
   cannonballMass = Math.trunc(cannonballMass);
   cannonballMass = cannonballMass/100;
   document.getElementById("mass").innerHTML = cannonballMass;
}

function increaseGravity() {
   gravity = gravity + 1;
   gravity = gravity * 10;
   gravity = Math.trunc(gravity);
   gravity = gravity / 10;
   document.getElementById("gravity").innerHTML = gravity + " m/s<sup>2</sup>";
}

function decreaseGravity() {
   gravity = gravity - 1;
   gravity = gravity * 10;
   gravity = Math.trunc(gravity);
   gravity = gravity / 10;
   document.getElementById("gravity").innerHTML = gravity + " m/s<sup>2</sup>";
}

function reverseGravity() {
   gravity = gravity * -1;
   gravity = gravity * 10;
   gravity = Math.trunc(gravity);
   gravity = gravity / 10;
   document.getElementById("gravity").innerHTML = gravity + " m/s<sup>2</sup>";
}

function increaseTargets() {
   if (TARGET_PIECES < 100) {
      TARGET_PIECES = TARGET_PIECES + 1;
      targetThreshhold.y = targetThreshhold.y + 0.2;
      document.getElementById("targets").innerHTML = TARGET_PIECES + " targets";
      hitStates = new Array(TARGET_PIECES);
      pieceLength = (targetEnd - targetBeginning) / TARGET_PIECES;
      targetThreshhold.y = cannonballRadius * 2 / pieceLength;
      if (targetThreshhold.y < 0.5) {
         targetThreshhold.y = 0.5;
      }
      targetPiecesHit = 0;
   }
}

function decreaseTargets() {
   if (TARGET_PIECES > 0) {
      TARGET_PIECES = TARGET_PIECES - 1;
      targetThreshhold.y = targetThreshhold.y - 0.2;
      document.getElementById("targets").innerHTML = TARGET_PIECES + " targets";
      hitStates = new Array(TARGET_PIECES);
      pieceLength = (targetEnd - targetBeginning) / TARGET_PIECES;
      targetThreshhold.y = cannonballRadius * 2 / pieceLength;
      if (targetThreshhold.y < 0.5) {
         targetThreshhold.y = 0.5;
      }
      targetPiecesHit = 0;
   }

}

function increaseBallSize() {
   if (cannonballRadius < 5) {
      cannonballRadius = cannonballRadius + 1;
   }
   else if (cannonballRadius >= 5) {
      cannonballRadius = cannonballRadius + 5;
   }
   document.getElementById("ballSize" +
       "").innerHTML = cannonballRadius + " cm";
   document.getElementById("volumeEquation").innerHTML = cannonballRadius;


   targetThreshhold.y = cannonballRadius * 2 / pieceLength;
   if (targetThreshhold.y < 0.5) {
      targetThreshhold.y = 0.5;
   }
   blockerThreshhold.y = cannonballRadius * 5 / blockerLength;

   let r = cannonballRadius/100;
   cannonballVolume = 4 * Math.PI * r * r * r / 3;
   cannonballMass = cannonballDensity * cannonballVolume;
   cannonballVolume = cannonballVolume * 100;
   cannonballVolume = Math.trunc(cannonballVolume);
   cannonballVolume = cannonballVolume / 100;
   document.getElementById("volume").innerHTML = cannonballVolume;

   cannonballMass = cannonballMass * 100;
   cannonballMass = Math.trunc(cannonballMass);
   cannonballMass = cannonballMass/100;
   document.getElementById("mass").innerHTML = cannonballMass;

   cannonBaseRadius = cannonballRadius * 1.1;
   cannonLength = cannonBaseRadius * 3;
   barrelEnd.x = cannonLength;
   barrelEnd.y = cannon.y;
}

function decreaseBallSize() {
   if (cannonballRadius > 1) {
      if (cannonballRadius > 5) {
      cannonballRadius = cannonballRadius - 5;
      }
      else if (cannonballRadius <= 5) {
         cannonballRadius = cannonballRadius - 1;
      }
   }
   document.getElementById("ballSize" +
       "").innerHTML = cannonballRadius + " cm";
   document.getElementById("volumeEquation").innerHTML = cannonballRadius;

   targetThreshhold.y = cannonballRadius * 2 / pieceLength;
   if (targetThreshhold.y < 0.5) {
      targetThreshhold.y = 0.5;
   }
   blockerThreshhold.y = cannonballRadius * 2 / blockerLength;

   let r = cannonballRadius/100;
   cannonballVolume = 4 * Math.PI * r * r * r / 3;
   cannonballMass = cannonballDensity * cannonballVolume;

   cannonballVolume = cannonballVolume * 100;
   cannonballVolume = Math.trunc(cannonballVolume);
   cannonballVolume = cannonballVolume / 100;
   document.getElementById("volume").innerHTML = cannonballVolume;
   cannonballMass = cannonballMass * 100;
   cannonballMass = Math.trunc(cannonballMass);
   cannonballMass = cannonballMass/100;
   document.getElementById("mass").innerHTML = cannonballMass;
}

function toggleRadius(event){
   var rad = document.getElementById("inputRadius").value;
   if (rad === "") {

   }
   else if (rad > 0){
      cannonballRadius = rad;
   }
   document.getElementById("ballSize" +
       "").innerHTML = rad + " cm";
   document.getElementById("volumeEquation").innerHTML = cannonballRadius;

   targetThreshhold.y = cannonballRadius * 2 / pieceLength;
   if (targetThreshhold.y < 0.5) {
      targetThreshhold.y = 0.5;
   }
   blockerThreshhold.y = cannonballRadius * 2 / blockerLength;
   let r = cannonballRadius/100;
   cannonballVolume = 4 * Math.PI * r * r * r / 3;
   cannonballMass = cannonballDensity * cannonballVolume;

   cannonballVolume = cannonballVolume * 100;
   cannonballVolume = Math.trunc(cannonballVolume);
   cannonballVolume = cannonballVolume / 100;
   document.getElementById("volume").innerHTML = cannonballVolume;
   cannonballMass = cannonballMass * 100;
   cannonballMass = Math.trunc(cannonballMass);
   cannonballMass = cannonballMass/100;
   document.getElementById("mass").innerHTML = cannonballMass;
   event.preventDefault();
}

// called every TIME_INTERVAL milliseconds
function updatePositions()
{
   // update the blocker's position
   var blockerUpdate = TIME_INTERVAL / 1000.0 * blockerVelocity;
   blocker.start.y += blockerUpdate;
   blocker.end.y += blockerUpdate;

   // update the target's position
   var targetUpdate = TIME_INTERVAL / 1000.0 * targetVelocity;
   target.start.y += targetUpdate;
   target.end.y += targetUpdate;

   // if the blocker hit the top or bottom, reverse direction
   if (blocker.start.y < 0 || blocker.end.y > canvasHeight)
      blockerVelocity *= -1;

   // if the target hit the top or bottom, reverse direction
   if (target.start.y < 0 || target.end.y > canvasHeight)
      targetVelocity *= -1;

   if (cannonballOnScreen) // if there is currently a shot fired
   {
      // update cannonball position
      var interval = TIME_INTERVAL / 1000.0;

      cannonballVelocity.y = cannonballVelocity.y - (cannonballMass*gravity/40);
      cannonball.x += interval * cannonballVelocity.x;
      cannonball.y += interval * cannonballVelocity.y;

      // check for collision with blocker
      if ( cannonballVelocity.x > 0 &&
         cannonball.x + cannonballRadius >= (blockerDistance-blockerThreshhold.x) &&
         cannonball.x + cannonballRadius <= (blockerDistance + lineWidth +blockerThreshhold.x) &&
         cannonball.y + cannonballRadius > (blocker.start.y - blockerThreshhold.y) &&
         cannonball.y - cannonballRadius < (blocker.end.y + blockerThreshhold.y))
      {
         blockerSound.play(); // play blocker hit sound
         missed = false;
         cannonballVelocity.x *= -1; // reverse cannonball's direction
         timeLeft -= MISS_PENALTY; // penalize the user
      } // end if

      // check for collisions with left and right walls
      else if (cannonball.x + cannonballRadius > canvasWidth ||
         cannonball.x - cannonballRadius < 0)
      {
         cannonballOnScreen = false; // remove cannonball from screen
         if (missed === true) {
            missedSound.play();
         }
      } // end else if

      // check for collisions with top and bottom walls
      else if (cannonball.y + cannonballRadius > canvasHeight ||
         cannonball.y - cannonballRadius < 0)
      {
         cannonballOnScreen = false; // make the cannonball disappear
         if (missed === true) {
            missedSound.play();
         }
      } // end else if

      // check for cannonball collision with target
      else if (cannonballVelocity.x > 0 &&
         cannonball.x + cannonballRadius >= (targetDistance - blockerThreshhold.x) &&
         cannonball.x + cannonballRadius <= (targetDistance + lineWidth + blockerThreshhold.x) &&
         cannonball.y - cannonballRadius > (target.start.y-targetThreshhold.y) &&
         cannonball.y + cannonballRadius < (target.end.y+targetThreshhold.y))
      {
         // determine target section number (0 is the top)
         for (let i=0; i < TARGET_PIECES; i++) {
            let upper_pos = (cannonball.y  - (target.start.y)) / pieceLength;
            let lower_pos = (cannonball.y  - (target.end.y)) / pieceLength;
            if (((i>(upper_pos-targetThreshhold.y) && (i<(upper_pos+targetThreshhold.y)))
                || (i<(lower_pos+targetThreshhold.y)) && (i>(lower_pos-targetThreshhold.y)))
                && !hitStates[i]){
               targetSound.play(); // play target hit sound
               hitStates[i] = true; // section was hit
               cannonballOnScreen = false; // remove cannonball
               timeLeft += HIT_REWARD; // add reward to remaining time

               // if all pieces have been hit
               if (++targetPiecesHit === TARGET_PIECES)
               {
                  stopTimer(); // game over so stop the interval timer
                  draw(); // draw the game pieces one final time
                  if (TARGET_PIECES === 1) {
                     showGameOverDialog("You Won! Not bad.. considering");
                  }
                  else {
                     showGameOverDialog("You Won!");
                  }
                  var c = document.createElement("P");
                  var txt = "";
                  if (scores++ >0) {
                     txt += ", " + timeElapsed;
                  }
                  else {
                     txt += timeElapsed;
                  }
                  if (timeElapsed === 1) {
                        txt += " second";
                  }
                  else {
                     txt += " seconds ";
                  }
                  c.innerText = txt;
                  c.classList.add("horizontal");
                  document.getElementById("highScoreTitle").style.display = "block";
                  document.getElementById("highScores").appendChild(c);
               } // end if
            }
         }
         /*var section =
            Math.floor((cannonball.y  - (target.start.y)) / pieceLength);

         // check whether the piece hasn't been hit yet
         if ((section >= 0 && section < TARGET_PIECES) && 
            !hitStates[section])
         {
            targetSound.play(); // play target hit sound
            hitStates[section] = true; // section was hit
            cannonballOnScreen = false; // remove cannonball
            timeLeft += HIT_REWARD; // add reward to remaining time

            // if all pieces have been hit
            if (++targetPiecesHit == TARGET_PIECES)
            {
               stopTimer(); // game over so stop the interval timer
               draw(); // draw the game pieces one final time
               showGameOverDialog("You Won!"); // show winning dialog
            } // end if
         } // end if  */
      } // end else if
   } // end if

   ++timerCount; // increment the timer event counter

   // if one second has passed
   if (TIME_INTERVAL * timerCount >= 1000)
   {
      --timeLeft; // decrement the timer
      ++timeElapsed; // increment the time elapsed
      timerCount = 0; // reset the count
   } // end if

   draw(); // draw all elements at updated positions

   // if the timer reached zero
   if (timeLeft <= 0)
   {
      stopTimer();
      showGameOverDialog("You lost HAHA!"); // show the losing dialog
   } // end if
} // end function updatePositions

// fires a cannonball
function fireCannonball(event)
{
   if (cannonballOnScreen) // if a cannonball is already on the screen
      return; // do nothing

   var angle = alignCannon(event); // get the cannon barrel's angle

   missed = true;

   // move the cannonball to be inside the cannon
   cannonball.x = cannonLength; // align x-coordinate with cannon
   cannonball.y = cannon.y - barrelDif; // centers ball vertically
   console.log(barrelEnd.y);

   // get the x component of the total velocity
   cannonballVelocity.x = (cannonballSpeed * Math.sin(angle)).toFixed(0);

   // get the y component of the total velocity
   cannonballVelocity.y = (-cannonballSpeed * Math.cos(angle)).toFixed(0);
   cannonballOnScreen = true; // the cannonball is on the screen
   ++shotsFired; // increment shotsFired

   // play cannon fired sound
   cannonSound.play();
} // end function fireCannonball

// aligns the cannon in response to a mouse click
function alignCannon(event)
{
   // get the location of the click 
   var clickPoint = new Object();

   // get the relative offset of the canvas
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var currentElement = canvas;
    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

   // get the location of the click
   var clickPoint = {};
   clickPoint.x = event.x - totalOffsetX;
   clickPoint.y = event.y - totalOffsetY;

   // compute the click's distance from center of the screen
   // on the y-axis
   var centerMinusY = (canvasHeight / 2 - clickPoint.y);

   var angle = 0; // initialize angle to 0

   // calculate the angle the barrel makes with the horizontal
   if (centerMinusY !== 0) // prevent division by 0
      angle = Math.atan(clickPoint.x / centerMinusY);

   // if the click is on the lower half of the screen
   if (clickPoint.y > canvasHeight / 2)
      angle += Math.PI; // adjust the angle

   // calculate the end point of the cannon's barrel
   barrelEnd.x = (cannonLength * Math.sin(angle)).toFixed(0);
   barrelEnd.y =
      (-cannonLength * Math.cos(angle) + cannon.y).toFixed(0);
   barrelDif = cannon.y - barrelEnd.y;

   return angle; // return the computed angle
} // end function alignCannon

// draws the game elements to the given Canvas
function draw()
{
   canvas.width = canvas.width; // clears the canvas (from W3C docs)

   if (mars === true) {
      document.body.style.background = "#ff353d";
      context.drawImage(marsBackground,0,0, canvas.width, canvas.height);
      context.fillStyle = "white";
   }
   else if (earth === true) {
      document.body.style.background = "#00bd13";
      context.drawImage(earthBackground,0,0, canvas.width, canvas.height);
      context.fillStyle = "white";
   }
   else if (moon === true) {
      document.body.style.background = "yellow";
      context.drawImage(moonBackground,0,0, canvas.width, canvas.height);
      context.fillStyle = "white";
   }
   else if (jupiter === true) {
      document.body.style.background = "#3800ca";
      context.drawImage(jupiterBackground,0,0, canvas.width, canvas.height);
      context.fillStyle = "white";
   }
   else {
      context.fillStyle = "black";
   }

   // display time remaining
   context.fontFamily = "Futura, sans serif";
   context.font = "bold 24px sans-serif";
   context.textBaseline = "top";
   context.fillText("Time remaining: " + timeLeft, 5, 5);

   // if a cannonball is currently on the screen, draw it
   if (cannonballOnScreen)
   { 
      context.fillStyle = "gray";
      context.beginPath();
      context.arc(cannonball.x, cannonball.y, cannonballRadius,
         0, Math.PI * 2);
      context.closePath();
      context.fill();
   } // end if

   // draw the cannon barrel
   context.beginPath(); // begin a new path
   context.strokeStyle = "black";
   context.moveTo(0, cannon.y); // path origin
   context.lineTo(barrelEnd.x, barrelEnd.y);
   context.lineWidth = 2 * cannonballRadius; // line width
   context.stroke(); //draw path

   // draw the cannon base
   context.beginPath();
   context.fillStyle = "gray";
   context.arc(0, cannon.y, cannonballRadius * 1.1, 0, Math.PI * 2);
   context.closePath();
   context.fill();

   // draw blocker
   context.drawImage(bluePortal,blocker.start.x - lineWidth, blocker.start.y , 2 * lineWidth, blockerLength);

   // initialize currentPoint to the starting point of the target
   var currentPoint = new Object();
   currentPoint.x = target.start.x;
   currentPoint.y = target.start.y;

   // draw the target
   for (var i = 0; i < TARGET_PIECES; ++i)
   {
      // if this target piece is not hit, draw it
      if (!hitStates[i])
      {
         context.beginPath(); // begin a new path for target

         // alternate coloring the pieces yellow and blue
         if (i % 2 === 0)
            context.strokeStyle = DARK_COLOR;
         else
            context.strokeStyle = LIGHT_COLOR;

         context.moveTo(currentPoint.x, currentPoint.y); // path origin
         context.lineTo(currentPoint.x, currentPoint.y + pieceLength);
         context.lineWidth = lineWidth; // line width
         context.stroke(); // draw path
      } // end if
	 
      // move currentPoint to the start of the next piece
      currentPoint.y += pieceLength;
   } // end for
} // end function draw

// display an alert when the game ends
function showGameOverDialog(message)
{
   context.fillStyle = "white";
   context.fontFamily = "Futura, sans serif";
   context.font = "bold 20px sans-serif";
   context.textBaseline = "top";
   context.fillText(message, 40, 60);

   context.fillText("Shots fired: " + shotsFired, 40, 90);
   context.fillText("Total time: " + timeElapsed + " seconds ", 40, 120);
} // end function showGameOverDialog

window.addEventListener("load", setupGame, false);


/*************************************************************************
* (C) Copyright 1992-2012 by Deitel & Associates, Inc. and               *
* Pearson Education, Inc. All Rights Reserved.                           *
*                                                                        *
* DISCLAIMER: The authors and publisher of this book have used their     *
* best efforts in preparing the book. These efforts include the          *
* development, research, and testing of the theories and programs        *
* to determine their effectiveness. The authors and publisher make       *
* no warranty of any kind, expressed or implied, with regard to these    *
* programs or to the documentation contained in these books. The authors *
* and publisher shall not be liable in any event for incidental or       *
* consequential damages in connection with, or arising out of, the       *
* furnishing, performance, or use of these programs.                     *
*************************************************************************/