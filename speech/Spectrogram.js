class Spectrogram {
	#width;
	#height;
	#UA_pixelData;
	#t;
	Formants_arr;
	constructor(width, height){
		this.#width = width;
		this.#height = height;
		this.#UA_pixelData = new Uint8ClampedArray(canvas.width * canvas.height * 4);
		this.#t = 0;
		this.Formants_arr = [];
	}

	
	
	dbbyte(db, min, max){
		return map(clamp(db,min,max),min,max,0,255);
	}

	ybin(i, data){
		return this.fbin(map(i,0,canvas.height,50,5000), data);
	}

	biny(bin, data){
		return Math.round(map(this.binf(bin, data), 50, 5000, 0, canvas.height));
	}

	fbin(f, data){
		return Math.round(f * data.length * 2 / audioCtx.sampleRate);
	}

	binf(bin, data){
		return Math.round(bin * audioCtx.sampleRate / (2 * data.length));
	}

	update(FA_data){
		for(let t_old = this.#t; Math.abs(this.#t - t_old) < 2; this.#t = (this.#t + 1) % canvas.width){
		let t = this.#t;
		let width = this.#width;
		let height = this.#height;
		this.Formants_arr.push(formantTable.tmp_formants);

		while(this.Formants_arr.length > 30){
			this.Formants_arr.shift();
		}

		//get average
		let f1 = 0;
		let f2 = 0;
		let f3 = 0;
		let f4 = 0;
		if(this.Formants_arr[0].length > 0){
		f2 = this.Formants_arr.map(x => x[1][0]).reduce((a, b) => a + b, 0) / this.Formants_arr.length;
		f1 = this.Formants_arr.map(x => x[0][0]).reduce((a, b) => a + b, 0) / this.Formants_arr.length;
		f3 = this.Formants_arr.map(x => x[2][0]).reduce((a, b) => a + b, 0) / this.Formants_arr.length;
		f4 = this.Formants_arr.map(x => x[3][0]).reduce((a, b) => a + b, 0) / this.Formants_arr.length;
		}
		let bin1 = this.biny(this.fbin(f1, FA_data), FA_data);
		let bin2 = this.biny(this.fbin(f2, FA_data), FA_data);
		let bin3 = this.biny(this.fbin(f3, FA_data), FA_data);
		let bin4 = this.biny(this.fbin(f4, FA_data), FA_data);
		for (let i = 0; i < height; i++) {
				//check if i is near the frequencies
				let should_overlay = false;
				if(Math.abs(i-bin1) < 5 || Math.abs(i-bin2) < 5 || Math.abs(i-bin3) < 5 || Math.abs(i-bin4) < 5){
					should_overlay = true;
				}
				let pitch_overlay = false;
				let p = graph.pitch_avg ? graph.pitch_avg : 0;
				if(Math.abs(i-this.biny(this.fbin(p, FA_data), FA_data)) < 5){
					pitch_overlay = true;
				}
				//((Math.exp(-100*Math.pow((i-bin1)/(50),2)) + Math.exp(-100*Math.pow((i-bin2)/(50),2)) + Math.exp(-100*Math.pow((i-bin3)/(50),2)) + Math.exp(-100*Math.pow((i-bin4)/(50),2))));
				this.#UA_pixelData[t * 4 + i * width * 4] = 255-this.dbbyte(FA_data[this.ybin(i, FA_data)],-120,-20)+255*should_overlay-100*pitch_overlay;
				this.#UA_pixelData[t * 4 + i * width * 4 + 1] = 255-this.dbbyte(FA_data[this.ybin(i, FA_data)],-120,-20)-100*should_overlay-100*pitch_overlay;
				this.#UA_pixelData[t * 4 + i * width * 4 + 2] = 255-this.dbbyte(FA_data[this.ybin(i, FA_data)],-120,-20)-100*should_overlay+255*pitch_overlay;
				this.#UA_pixelData[t * 4 + i * width * 4 + 3] = 255;
			
			}
		
		}
	}

	
	draw(ctx){
		let imageData = new ImageData(this.#UA_pixelData, this.#width);
  		ctx.putImageData(imageData, 0, 0);
	}


}