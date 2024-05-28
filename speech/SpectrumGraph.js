let debug = 0;
class SpectrumGraph {
	#width;
	#height;
	#FA_frequencyData;
	#FA_timeData;
	pitch_arr;
	pitch_avg;
	env;
	peak_indices;
	pitch;
	constructor(width, height){
		this.#width = width;
		this.#height = height;
		this.#FA_frequencyData = [];
		this.pitch_arr = [];
		this.pitch_avg = 0;
		this.env = [];
		this.peak_indices = [];
		this.pitch = 0;
	}

	update(FA_frequencyData, FA_timeData, env, peak_indices, pitch){
		this.#FA_frequencyData = FA_frequencyData;
		this.#FA_timeData = FA_timeData;
		this.env = env;
		this.peak_indices = peak_indices;
		this.pitch = pitch;
		
	}

	draw(graphctx){
		graphctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);

		if(this.pitch > 400 && this.pitch_arr.length > 0){ 
			this.pitch = this.pitch_arr[this.pitch_arr.length-1];
		} else {
			this.pitch_arr.push(this.pitch);
		}

		while(this.pitch_arr.length > 20){
			this.pitch_arr.shift();
		}

		this.pitch_arr.push();
		for(let x = 0; x < this.#FA_frequencyData.length; x++){
			graphctx.fillRect(x, 0, 1, map(Math.log(Math.abs(this.#FA_frequencyData[x]))/Math.log(10),-15,0,0,150));
			
			graphctx.save();
			graphctx.fillStyle = "red";
		  // console.log(env[x]);
		  //semi-transparent
		  graphctx.globalAlpha = 0.5;
		  debug=(debug+1)%10001;
		//   if(debug < 10000){debug=(debug+1)%10001;}else{console.log(LPC.old_a);}
		  if(this.peak_indices.includes(Math.floor(x/2))){graphctx.fillText(Math.floor((1+Math.floor(x/2))*audioCtx.sampleRate/1024),x,100+map(Math.log(Math.abs(this.env[Math.floor(x/2)]))/Math.log(10),0,10,0,150));}
		  graphctx.fillRect(x, 0, 1, 3*map(Math.log(Math.abs(this.env[Math.floor(x/2)]))/Math.log(10),0,10,0,150));
		  graphctx.restore();

		  //draw LPC.cepstrum
		  this.pitch_avg = this.pitch_arr.reduce((a, b) => a + b, 0) / this.pitch_arr.length;
		  if(Math.floor(x/2) === Math.floor(this.pitch_avg * 1024 / audioCtx.sampleRate)){
		  	graphctx.fillStyle = "blue";
		  	graphctx.fillRect(x, 0, 1, 150);
			graphctx.fillText(Math.round(this.pitch_avg),x-7,170);
			graphctx.fillStyle = "black";
		  }


		}
	}

}