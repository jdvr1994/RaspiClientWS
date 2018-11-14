var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var socket = require('socket.io-client')('http://209.182.218.174:8080');
var StreamCamera = require('pi-camera-connect').StreamCamera;
var Codec  = require('pi-camera-connect').Codec;

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
// Capture 5 seconds of H264 video and save to disk
const runApp = async () => {

    const streamCamera = new StreamCamera({
        codec: Codec.H264
    });

    const videoStream = streamCamera.createStream();
    await streamCamera.startCapture();
    const image = await streamCamera.takeImage();
    // Process image...
    videoStream.on("data", data => console.log("New data", data));
    videoStream.on("end", data => console.log("Video stream has ended"));
    await new Promise(resolve => setTimeout(() => resolve(), 5000));
    await streamCamera.stopCapture();
};

runApp();
