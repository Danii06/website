class Recorder extends AudioWorkletProcessor {
	process(inputs, outputs, parameters) {
		let input = inputs[0][0];
		this.port.postMessage(input);
		return true;
	}
}

registerProcessor("recorder", Recorder);