#!/usr/bin/env node


// a naive, simplistic, and downright hackish speech rec system based on sphinx
// should not be used by anyone, ever.
const lifx  = require('node-lifx').Client;
const spawn = require('child_process').spawn;


const off_commands = [
  'OKAY LIGHTS OFF',
  'OKAY LIGHTS OUT',
  'OKAY GOOD NIGHT',
  'OKAY SLEEPY TIME',
  'OKAY LIGHT OFF',
  'OK LIGHT OUT'
];

const on_commands = [
  'OKAY LIGHTS ON',
  'OKAY LIGHT ON'
];

const morning_commands = [
  'OKAY GOOD MORNING',
  'OKAY MORNING'
];

function isCommand(input, commands) {
  for(let i=0; i < commands.length; i++) {
   if (input.indexOf(commands[i]) === 0)
     return true;
  }
  return false;
}

let lights = [];
let client = new lifx();

client.on('light-new', function(light) {
  lights.push(light);
  console.log('new light found!');
});

client.init();


let options = [
  '-hmm', '/usr/local/share/pocketsphinx/model/en-us/en-us',
  '-lm', `${__dirname}/3461.lm`,
  '-dict', `${__dirname}/3461.dic`,
  '-keyphrase', 'OKAY',
  '-kws_threshold', '1e-30',

  // performance settings
  // http://cmusphinx.sourceforge.net/wiki/pocketsphinxhandhelds
  '-ds', '2',
  '-topn', '2',
  '-maxwpf', '5', 

  '-inmic', 'yes'
];

let res = spawn('pocketsphinx_continuous', options);
//res.stdout.pipe(process.stdout);
res.stderr.pipe(process.stderr);


function setColor(light, hue, saturation, brightness, kelvin=3500, duration=0) {
  light.getPower(function(error, data) {
    console.log('power:', data);
    if(data === 0) {
      light.color(hue, saturation, brightness, kelvin);
      setTimeout(function(){
        light.on(duration);
      }, 1200);
    } else {
      light.color(hue, saturation, brightness, kelvin, duration);
    }
  });
}


function toggleLight(light, duration=0) {
  light.getPower(function(error, data) {
    if(data === 0) {
      light.on(duration);
    } else {
      light.off(duration);
    }
  });
}

res.stdout.on('data', function(data) {
  data = data.toString().trim();
  if(data.length === 0) return;

  console.log('command:', data);

  if(data.indexOf('OKAY') !== 0) return;

  if(lights.length === 0) return;

  if(data.indexOf('OKAY EVENING LIGHT') === 0) {
    setColor(lights[0], 29, 100, 50, 3500, 1000);
  } else if(data.indexOf('OKAY READING LIGHT') === 0) {
    setColor(lights[0], 0, 0, 65, 2500, 1000);
  } else if(isCommand(data, morning_commands)) {
    setColor(lights[0], 202, 100, 40, 3500, 60000);
  } else if(isCommand(data, off_commands)) {
    console.log('lights off');
    lights[0].off(600);
  } else if (isCommand(data, on_commands)) {
    lights[0].on(1200);
    console.log('lights on');
  } else if(data === 'OKAY LIGHT' || data === 'OKAY LIGHTS') {
    toggleLight(lights[0], 800);
  }
});
