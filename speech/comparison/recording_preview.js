document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("recording");
    if (!canvas) {
        console.error("Canvas element with ID 'recording' not found.");
        return;
    }

    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#333";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Drag & Drop or Click to Upload Audio", canvas.width / 2, canvas.height / 2);

    canvas.addEventListener("dragover", (event) => {
        event.preventDefault();
        canvas.style.border = "2px dashed #000";
    });

    canvas.addEventListener("dragleave", () => {
        canvas.style.border = "1px solid #000";
    });

    canvas.addEventListener("drop", (event) => {
        event.preventDefault();
        canvas.style.border = "1px solid #000";
        const files = event.dataTransfer.files;
        handleFiles(files);
    });

    canvas.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "audio/*";
        input.onchange = (event) => {
            handleFiles(event.target.files);
        };
        input.click();
    });

    resampledSamples = null;
    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();

                audioContext.decodeAudioData(event.target.result, (buffer) => {
                    const originalSampleRate = buffer.sampleRate;
                    console.log("Original Sampling Rate:", originalSampleRate);

                    const targetSampleRate = 44000;
                    if (originalSampleRate === targetSampleRate) {
                        console.log("No resampling needed.");
                        const audioSamples = buffer.getChannelData(0);
                        console.log("Resampled Audio Samples Array:", audioSamples);
                        return;
                    }

                    const offlineContext = new OfflineAudioContext(
                        buffer.numberOfChannels,
                        Math.ceil(buffer.duration * targetSampleRate),
                        targetSampleRate
                    );

                    const source = offlineContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(offlineContext.destination);
                    source.start();

                    offlineContext.startRendering().then((resampledBuffer) => {
                        resampledSamples = resampledBuffer.getChannelData(0);
                        console.log("Resampled Audio Samples Array (11kHz):", resampledSamples);
                        computeSpectrogram(resampledSamples);

                    });
                });
            };

            reader.readAsArrayBuffer(file);
        }
    }

function computeSpectrogram(samples) {
        const fftSize = 2048;
        const frameSize = 256;
        const fft = new FFT(fftSize);
        const spectrogram = [];

        for (let i = 0; i + frameSize <= samples.length; i += frameSize) {
            frame = samples.slice(i, i + frameSize);
            frame = Array.from(frame);
            frame.push(...Array(fftSize - frameSize).fill(0));
            const spectrum = fft.createComplexArray();
            fft.realTransform(spectrum, frame);
            fft.completeSpectrum(spectrum);


            const magnitudes = Array.from({ length: fftSize / 2 }, (_, j) =>
                Math.sqrt(spectrum[2 * j] ** 2 + spectrum[2 * j + 1] ** 2)
            );

            spectrogram.push(magnitudes);
        }

        width = spectrogram.length;
        height = spectrogram[0].length/8;
        UA_pixelData = new Uint8ClampedArray(width * height * 4);
        lower_threshold = 0.2;
        upper_threshold = 5;
        console.log(lower_threshold, upper_threshold);
        console.log(spectrogram);
        for(let j = 0; j < width; j++){
            // t = Math.floor(j * spectrogram.length / canvas.width);
            for (let k = 0; k < height; k++) {
                // i = Math.floor(k * spectrogram[0].length / height);
                data = Math.log10(spectrogram[j][k]);
                if (data < Math.log10(lower_threshold)) data = Math.log10(lower_threshold);
                if (data > Math.log10(upper_threshold)) data = Math.log10(upper_threshold);
                data_as_byte = (data-Math.log10(lower_threshold))/(Math.log10(upper_threshold)-Math.log10(lower_threshold))*255;
                UA_pixelData[j * 4 + k * width * 4] = 255-data_as_byte;
                UA_pixelData[j * 4 + k * width * 4 + 1] = 255-data_as_byte;
                UA_pixelData[j * 4 + k * width * 4 + 2] = 255-data_as_byte
                UA_pixelData[j * 4 + k * width * 4 + 3] = 255;
            }
        }
        
        createImageBitmap(new ImageData(UA_pixelData, width, height)).then((bitmap) => {
            // ctx.imageSmoothingEnabled = false;
            ctx.drawImage(bitmap,0,0, canvas.width, canvas.height);
        });
        
    }

});