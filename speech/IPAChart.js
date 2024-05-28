class IPAChart {
	width
	height
	F1_arr
	F2_arr
	constructor(width, height){
		this.width = width;
		this.height = height;
		this.F1_arr = [];
		this.F2_arr = [];
	}

	x(f){
		return Math.round(f * this.width / 1000);
	}

	y(f){
		return Math.round(f * this.height / 2500);
	}

	update(F1, F2){
		this.F1_arr.push(F1);
		this.F2_arr.push(F2);

		while(this.F1_arr.length > 30){
			this.F1_arr.shift();
			this.F2_arr.shift();
		}

		//remove points where two-sided difference is greater than 
		


	}


	draw(IPActx){

		IPActx.strokeStyle = "black";
		IPActx.fillStyle = "black";
		IPActx.lineWidth = 1;
		
		//draw vowels using wikipedia values
		// i 	240 	2400
		// y 	235 	2100
		// e 	390 	2300
		// ø 	370 	1900 \u00F8
		// ɛ 	610 	1900 \u025B
		// œ 	585 	1710 \u0153
		// a 	850 	1610 
		// ɶ 	820 	1530 \u0276
		// ɑ 	750 	940  \u0251
		// ɒ 	700 	760  \u0252
		// ʌ 	600 	1170 \u028C
		// ɔ 	500 	700  \u0254
		// ɤ 	460 	1310 \u0264
		// o 	360 	640 
		// ɯ 	300 	1390 \u026F
		// u 	250 	595  
		//use hex value


		IPActx.beginPath();
		IPActx.moveTo(this.x(10), this.y(10));
		IPActx.lineTo(this.x(1000), this.y(10));
		IPActx.stroke();
		IPActx.beginPath();
		IPActx.moveTo(this.x(10), this.y(10));
		IPActx.lineTo(this.x(10), this.y(2500));
		IPActx.stroke();
		IPActx.strokeText('F1', this.x(950), this.y(100));
		IPActx.strokeText('F2', this.x(20), this.y(2400));

		// draw numbers on axes
		// Close Close-mid Open-mid Open
		IPActx.strokeText('Close', this.x(200), this.y(300));
		IPActx.strokeText('250', this.x(250), this.y(100));
		// IPActx.strokeText('Close-mid', this.x(400), this.y(300));
		IPActx.strokeText('500', this.x(500), this.y(100));
		// IPActx.strokeText('Open-mid', this.x(600), this.y(300));
		IPActx.strokeText('750', this.x(750), this.y(100));
		IPActx.strokeText('Open', this.x(800), this.y(300));


		//Front Central Back
		IPActx.strokeText('500', this.x(20), this.y(500));
		IPActx.strokeText('Back', this.x(100), this.y(750));
		IPActx.strokeText('1000', this.x(20), this.y(1000));
		IPActx.strokeText('Central', this.x(100), this.y(1500));
		IPActx.strokeText('1500', this.x(20), this.y(1500));
		IPActx.strokeText('Front', this.x(100), this.y(2250));
		IPActx.strokeText('2000', this.x(20), this.y(2000));

		//larger font size
		IPActx.font = "20px Arial";

		IPActx.strokeText('i',  this.x(240), this.y(2400));
		IPActx.strokeText('y', 	this.x(235), this.y(2100));
		IPActx.strokeText('e', 	this.x(390), this.y(2300));
		IPActx.strokeText('\u00F8', 	this.x(370), this.y(1900));
		IPActx.strokeText('\u025B', 	this.x(610), this.y(1900));
		IPActx.strokeText('\u0153', 	this.x(585), this.y(1710));
		IPActx.strokeText('a', 	this.x(850), this.y(1610));
		IPActx.strokeText('\u0276', 	this.x(820), this.y(1530));
		IPActx.strokeText('\u0251', 	this.x(750), this.y(940));
		IPActx.strokeText('\u0252', 	this.x(700), this.y(760));
		IPActx.strokeText('\u028C', 	this.x(600), this.y(1170));
		IPActx.strokeText('\u0254', 	this.x(500), this.y(700));
		IPActx.strokeText('\u0264', 	this.x(460), this.y(1310));
		IPActx.strokeText('o', 	this.x(360), this.y(640));
		IPActx.strokeText('\u026F', 	this.x(300), this.y(1390));
		IPActx.strokeText('u', 	this.x(250), this.y(595));

		//draw point F1 F2
		IPActx.font = "12px Arial";

		let F1_avg =  this.F1_arr.reduce((a, b) => a + b, 0) / this.F1_arr.length;
		let F2_avg =  this.F2_arr.reduce((a, b) => a + b, 0) / this.F2_arr.length;

		//red
		IPActx.fillStyle = "red";

		IPActx.beginPath();
		IPActx.arc(this.x(F1_avg), this.y(F2_avg), 5, 0, 2 * Math.PI);
		IPActx.fill();
		IPActx.stroke();

		IPActx.fillStyle = "black";

		IPActx.font = "20px Arial";



	}
}