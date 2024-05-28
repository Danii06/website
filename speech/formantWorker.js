importScripts('/speech/durand-kerner/roots.js');
importScripts('/speech/fft.js/lib/fft.js');
importScripts('/speech/svd-js/svd.js');
let audioCtx = {};
importScripts('LPC.js');
self.onmessage = function(e){
	// console.log("worker received");
	// console.log(e.data);
	if(e.data && e.data.sampleRate){
		 audioCtx.sampleRate = e.data.sampleRate;
		 postMessage(undefined);
	}
	else if(e.data) {
		// let t1 = performance.now();
		// if the data is blank
		postMessage(LPC.accurate_peaks(e.data));
		// let t2 = performance.now(); 
		// if(t2-t1>20) console.log("Worker took " + (t2 - t1) + " milliseconds");
	} else postMessage(undefined);
}
