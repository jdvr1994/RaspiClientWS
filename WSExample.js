var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var socket = require('socket.io-client')('http://209.182.218.174:8080');
const PiCamera = require('pi-camera');

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

//Camera
const myCamera = new PiCamera({
  mode: 'video',
  output: `${ __dirname }/video.h264`,
  width: 1920,
  height: 1080,
  timeout: 5000, // Record for 5 seconds
  nopreview: false,
});

myCamera.record()
  .then((result) => {
    // Your video was captured
  })
  .catch((error) => {
     // Handle your error
  });
