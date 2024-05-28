let realtime = true;

let samplingRate = 11000;

//set sample rate from audio context to support other mics

let audioCtx = new AudioContext({sampleRate: samplingRate});


let canvas = document.getElementById("canvas");
let graphCanvas = document.getElementById("graph");
let table = document.getElementById("table");
let ipa = document.getElementById("ipa");

canvas.width = window.innerWidth / 2 - 2;
canvas.height = window.innerHeight/3;

graphCanvas.width = window.innerWidth / 2 - 2;
graphCanvas.height = window.innerHeight/3;

ipa.style.width = window.innerWidth / 2 - 2 + "px";
ipa.style.height = window.innerHeight*2/3 - 4 + "px";
ipa.width = window.innerWidth / 2 - 2;
ipa.height = window.innerHeight*2/3;

//set ipa position
ipa.style.top = window.innerHeight/3 - 8 + "px";

table.style.height = window.innerHeight/3 - 4 - 10 + "px";

let ctx = canvas.getContext("2d");
let graphctx = graphCanvas.getContext("2d");
let ipactx = ipa.getContext("2d");

let analyzer = null;

let spectrogram = new Spectrogram(canvas.width, canvas.height);
let graph = new SpectrumGraph(graphCanvas.width, graphCanvas.height);
let formantTable = new FormantTable(document.getElementById("formants"));
let ipachart = new IPAChart(ipa.width, ipa.height);


let a = [];
let env = [];
let peak_indices = [];
 let pitch = 0;

function log_formants(){
  formantTable.add_formants(LPC.accurate_peaks(a));
}


function start() {
  document.getElementById("start").remove();
  formantTable.start();
  audioCtx.resume();
  navigator.mediaDevices.getUserMedia({ audio: true }).then(async stream => {
    let audioInput;
    try {
      audioInput = audioCtx.createMediaStreamSource(stream);
    } catch (error) {
      alert('Your browser does not support resampling audio streams. The real-time formant calculation algorithm will fall back to a less accurate, much slower version. Please use a different browser for better results.');
      realtime = false;
      audioCtx = new AudioContext();
      audioInput = audioCtx.createMediaStreamSource(stream);
    }

    await audioCtx.audioWorklet.addModule("worklet.js");

    analyzer = audioCtx.createAnalyser();
	  analyzer.fftSize = 2048;
    audioInput.connect(analyzer);

    let worklet = new AudioWorkletNode(audioCtx, "recorder");
    audioInput.connect(worklet);


    worklet.port.onmessage = e => {
      let data = new Float32Array(analyzer.frequencyBinCount);
      analyzer.getFloatFrequencyData(data); //Data is in decibels

      spectrogram.update(data);

      let timedomain = new Float32Array(analyzer.frequencyBinCount);
      analyzer.getFloatTimeDomainData(timedomain);
      //TEMP
      timedomain = timedomain.slice(-256);

      a = LPC.calculate_coeffs(timedomain);
      env = LPC.envelope(timedomain);
      peak_indices = LPC.peaks(env).filter(x => x < 1000);
      pitch = LPC.cepstrum(timedomain);

      graph.update(data.map(x => Math.pow(10, x/10)), timedomain, env, peak_indices, pitch);
      // console.log(timedomain);
      

      
	  
    };
    
    let fworker = new Worker('formantWorker.js');

    

    fworker.postMessage({sampleRate: audioCtx.sampleRate});

    send = function(){
      if(a == null || a.reduce((a,b)=>Math.abs(a)+Math.abs(b),0) - 2 < 5){
        setTimeout(send, 10);
      } else {
        fworker.postMessage(a);
      }
    }

    fworker.onmessage = function(e) {
      if(e.data && e.data[0][0]<10000) {
        formantTable.temp_formants(e.data);
        let F1 = e.data[0][0];
        let F2 = e.data[1][0];
        ipachart.update(F1, F2);
      }
        send();
    	
    };
  });
}


function draw() {
  
  spectrogram.draw(ctx);

  graph.draw(graphctx);

  
  ipactx.clearRect(0, 0, ipa.width, ipa.height);
  ipachart.draw(ipactx);
  
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

function clamp(x, min, max) {
  if (x < min) return min;
  if (x > max) return max;
  return x;
}

function map(t, a, b, x, y) {
  return ((t - a) / (b - a)) * (y - x) + x;
}