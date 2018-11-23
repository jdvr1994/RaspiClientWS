var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var socket = require('socket.io-client')('http://209.182.218.174:8080');
var socketStream = require('socket.io-stream');
const raspberryPiCamera = require('raspberry-pi-camera-native');
const http = require('http');

var stream = socketStream.createStream();

var LED = new Gpio(4, 'out'); //use GPIO pin 4, and specify that it is output
var blinkInterval = setInterval(blinkLED, 250); //run the blinkLED function every 250ms

function blinkLED() { //function to start blinking
  if (LED.readSync() === 0) { //check the pin state, if the state is 0 (or off)
    LED.writeSync(1); //set pin state to 1 (turn LED on)
  } else {
    LED.writeSync(0); //set pin state to 0 (turn LED off)
  }
}

function endBlink() { //function to stop blinking
  clearInterval(blinkInterval); // Stop blink intervals
  LED.writeSync(0); // Turn LED off
  LED.unexport(); // Unexport GPIO to free resources

  var message = {
    author: 'raspiWS',
    text: 'chao joven'
  };
  socket.emit('new-message', message)
}

setTimeout(endBlink, 5000); //stop blinking after 5 seconds

socket.on('connect', function (socket) {
    console.log('Connected!');
});

socket.on('event', function(data){});
socket.on('disconnect', function(){});

socket.on('wsID', function (id) {
    console.log(id);
});

//Camera
// add frame data event listener
raspberryPiCamera.on('frame', (frameData) => {
  // frameData is a Node.js Buffer
  // ...
  socket.emit('stream',frameData)
   //socketStream(socket).emit('image', stream, {name: frameData});
});

// start capture
options = {
  width: 640,
  height: 480,
  fps: 15,
  encoding: 'JPEG',
  quality: 7
}

raspberryPiCamera.start(options, ()=>{});

const server = http.createServer((req, res) => {
  raspberryPiCamera.once('frame', (data) => {
    res.end(data);
  });
});

server.listen(8000);
