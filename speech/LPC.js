let log = false;
class LPC {

static calculate_coeffs(data, coeffs){
  if(data===undefined) return;
	let len = data.length;
	data = Array.from(data);
	if(len==0) return [];

  let linsp = Array.from({length: len}, (_, i) => 0.5+i*(len)/(len));

  let window_function = []
  for(let i = 0; i < len; i++){
    window_function.push(Math.pow(Math.sin(3.14*(linsp[i])/len),2));
  }
  
  for(let i = 0; i < len; i++){
    if(data[i]==0){ 
      data[i] = 0.000000000001;
    } else {
      data[i] = data[i]*window_function[i];
    }
  }

  let n = coeffs;
  if(coeffs==undefined) n = Math.floor(audioCtx.sampleRate/1000);
  let a = LPC.solve_yule_walker(data, n);
  a = a.map(x => -x);
  a.unshift(1);
  return a;
}

//https://speechprocessingbook.aalto.fi/Representations/Linear_prediction.html#autocovariance-method-default-approach
static envelope(data, coeffs){
	let a = LPC.calculate_coeffs(data, coeffs);

  a = a.concat(Array(1024-a.length).fill(0));

  
  
  if(a.length==0) return [];
  const f = new FFT(1024);
  const A = f.createComplexArray();
  f.realTransform(A, a);
  let B = new Float32Array(1024);
  for(let i = 0; i < A.length; i++){
    if(i % 2 == 0){
      B[i/2] = Math.pow(Math.pow(A[i],2)+Math.pow(A[i+1],2),0.5);
    }
  }
  B = B.map(x => 1/x);
	return B; 
}


static nextPow2 = function (v) {
  v += v === 0
  --v
  v |= v >>> 1
  v |= v >>> 2
  v |= v >>> 4
  v |= v >>> 8
  v |= v >>> 16
  return v + 1
}

static magnitude(complex_arr){
  let mag = new Float32Array(complex_arr.length / 2);
  for(let i = 0; i < complex_arr.length; i++){
    if(i % 2 == 0){
      mag[i/2] = Math.pow(Math.pow(complex_arr[i],2)+Math.pow(complex_arr[i+1],2),0.5);
    }
  }
  return mag;
}

static cepstrum(data){
  //fft, get magnitude, take log, ifft, get peak
  let f = new FFT(LPC.nextPow2(data.length));
  let A = f.createComplexArray();
  f.realTransform(A, data);
  f.completeSpectrum(A);
  let B = LPC.magnitude(A);
  let B2 = B.map(x => Math.log(Math.abs(x)));
  f = new FFT(LPC.nextPow2(data.length));
  let C = f.createComplexArray();
  B2 = f.toComplexArray(B2);
  f.inverseTransform(C, B2);
  let D = LPC.magnitude(C);
  
  D = D.slice(0, D.length / 2);
  let p = LPC.peaks(D);
  
  let max = 0;
  let max_index = 0;
  for(let i = 1; i < p.length; i++){
    if(D[p[i]] > max){
      max = D[p[i]];
      max_index = p[i];
    }
  }
  let s = max_index / audioCtx.sampleRate; // / LPC.nextPow2(data.length);
  return 1/s;
}

// ⍸~0=2-/×2-/x
static peaks(data){


  let derivative = [];
  for (let i = 0; i < data.length - 1; i++) {
    derivative.push(data[i + 1] - data[i]);
  }

  let sign = derivative.map(value => Math.sign(value));

  let indicator_peaks = [];
  for (let i = 0; i < data.length - 1; i++) {
    indicator_peaks.push(sign[i + 1] - sign[i]);
  }
  
  let indices = [];
  for (let i = 0; i < indicator_peaks.length; i++) {
    if (indicator_peaks[i] < 0) {
      indices.push(i);
    }
  }

  return indices;

}

static accurate_peaks(a1){

  let a = a1;
  a = Array.from(a).filter(x => isFinite(x)).map(x => x);
  a.reverse();
  
  let roots = findRoots(a, undefined, undefined, 1e-6);


  let mag = roots[0].map((x, i) => Math.pow(Math.pow(x,2)+Math.pow(roots[1][i],2),0.5));

  mag = mag.map(x => -(audioCtx.sampleRate/Math.PI)*Math.log(x));

  
  let ang = roots[0].map((x, i) => Math.atan2(roots[1][i], x));
  ang = ang.map(x => (audioCtx.sampleRate/(2*Math.PI))*x);

  
  mag = mag.filter((x,i) => ang[i] > 0);
  ang = ang.filter(x => x > 0);

  ang = ang.filter((x,i) => mag[i] > 0);
  mag = mag.filter(x => x > 0);

  mag = mag.sort((a,b) => ang[ang.indexOf(a)] - ang[ang.indexOf(b)]);
  
  ang = ang.sort((a,b) => a - b);

  ang = ang.map(x => Math.round(x));
  mag = mag.map(x => Math.round(x));

  mag = mag.filter((x,i) => ang[i] > 200);
  ang = ang.filter(x => x > 200);

  let aa = a1;

  aa = aa.concat(Array(1024-aa.length).fill(0));
  
  if(aa.length==0) return [];
  if(!FFT) return [[0,0],[0,0]];
  const f = new FFT(1024);
  const A = f.createComplexArray();
  f.realTransform(A, aa);
  let B = new Float32Array(1024);
  for(let i = 0; i < A.length; i++){
    if(i % 2 == 0){
      B[i/2] = Math.pow(Math.pow(A[i],2)+Math.pow(A[i+1],2),0.5);
    }
  }
  B = B.map(x => 1/x);

  // get relative amplitudes of formants from amplitude array B
  let amplitudes = [];
  for(let i = 0; i < ang.length; i++){
    amplitudes.push(B[Math.floor(ang[i] * 1024 / audioCtx.sampleRate)]);
  }

  //convert from dB to power
  amplitudes = amplitudes.map(x => Math.pow(10, x/10));

  //divide by amplitude[0] to get relative amplitudes
  amplitudes = amplitudes.map(x => x/amplitudes[0]);

  //[[ang[0], mag[0]], [ang[1], mag[1]], [ang[2], mag[2]], [ang[3], mag[3]], [ang[4], mag[4]]]
  return [[ang[0], mag[0]], [ang[1], mag[1]], [ang[2], mag[2]], [ang[3], mag[3]], [ang[4], mag[4]]];

  //document.getElementById("formants").innerHTML += "<tr><td>"+ang[0]+"</td><td>"+mag[0]+"</td><td>"+ang[1]+"</td><td>"+mag[1]+"</td><td>"+ang[2]+"</td><td>"+mag[2]+"</td><td>"+ang[3]+"</td><td>"+mag[3]+"</td><td>"+ang[4]+"</td><td>"+mag[4]+"</td></tr>";

}



// 
static smooth_formants(D){
  if(D.length==0)return;
  function L(x){return Math.floor(x)};
  function A(l,f){return Array.from({length:l},f)};
  function TT(A,i,l){return A.slice(i,i+l)};
  let a=LPC.calculate_coeffs;
  let FBW=LPC.accurate_peaks;

  let M=L(audioCtx.sampleRate/1000);
  let F=A(L(D.length/16),(_,i)=>(
                                    TT(D,i*16,16)
                                  )
         ).map(x=>FBW(a(x,M)));
  
  let Ft=LPC.transpose(F);
  
  //replace undefined with previous values
  for(let i = 0; i < Ft.length; i++){
    for(let j = 0; j < Ft[i].length; j++){
      if(Ft[i][j][0]===undefined){
        Ft[i][j] = Ft[i-1][j];
      }
    }
  }
  
  Ft = Ft.map(x=>LPC.legendre4_coeffs(x.map(x=>x[0]),x.map(x=>x[1])));

 let x = [];
  for(let i = 0; i <= D.length; i++){
    x.push((i-D.length/2)/(D.length/2));
  }

  Ft = Ft.map(z=>LPC.legendre4(z.a,x));

  return Ft;
}

static L0 = function(x){
  return 1;
}

static L1 = function(x){
  return x;
}

static L2 = function(x){
  return 0.5*(3*Math.pow(x,2)-1);
}

static L3 = function(x){
  return 0.5*(5*Math.pow(x,3)-3*x);
}

static legendre4_coeffs(y, sigma) {

  y = y.map((y,i) => y/sigma[i]);

  //make x values
  let x = [];
  for(let i = 0; i <= y.length; i++){
    x.push((i-y.length/2)/(y.length/2));
  }


  let design_matrix = [...Array(4)].map(e => []); // 4xN matrix
  for(let i = 0; i < y.length; i++){
    design_matrix[0].push(LPC.L0(x[i])/sigma[i]);
    design_matrix[1].push(LPC.L1(x[i])/sigma[i]);
    design_matrix[2].push(LPC.L2(x[i])/sigma[i]);
    design_matrix[3].push(LPC.L3(x[i])/sigma[i]);
  }
  design_matrix = LPC.transpose(design_matrix);


  let USV = SVD(design_matrix);

  let U = USV.u;
  let S = USV.q;
  let V = USV.v;

  let Splus = S.map(y => y != 0 ? 1/y : 0);

  let Splus_mat = Array.from({length: Splus.length}, (_, i) => Array.from({length: Splus.length}, (_, j) => 0));
  for(let i = 0; i < Splus.length; i++){
    Splus_mat[i][i] = Splus[i];
  }
  let Ut = LPC.transpose(U);
  let Utb = LPC.matrixVecMul(Ut, y);
  let SUtb = LPC.matrixVecMul(Splus_mat, Utb);

  let a = LPC.matrixVecMul(V, SUtb);

  let std = V.map( row => row.map( (x, i) => Math.pow(x/S[i],2) ).reduce((a,b)=>a+b,0) );


  return {a, std};
}

static legendre4(a, x){
  let values = [];
  for(let i = 0; i < x.length; i++){
    values.push(a[0]*LPC.L0(x[i])+a[1]*LPC.L1(x[i])+a[2]*LPC.L2(x[i])+a[3]*LPC.L3(x[i]));
  }
  return values; 
}


// Solve the yule-walker equations using levinson recursion
// https://ocw.mit.edu/courses/6-341-discrete-time-signal-processing-fall-2005/06e8ddb9555ede1b094f5dc9d17ea254_lec13.pdf
// https://lcav.gitbook.io/dsp-labs/linear-prediction/implementation

static bac(x, p) {
  // compute the biased autocorrelation for x up to lag p
  var L = x.length;
  var r = new Array(p + 1).fill(0);
  for (var m = 0; m < p + 1; m++) {
      for (var n = 0; n < L - m; n++) {
          r[m] += x[n] * x[n + m];
      }
      r[m] /= L;
  }
  return r;
}

static ld(r, p) {
  // solve the toeplitz system using the Levinson-Durbin algorithm
  var g = r[1] / r[0];
  var a = [g];
  var v = (1 - g * g) * r[0];
  for (var i = 1; i < p; i++) {
      g = (r[i + 1] - LPC.dot(a, r.slice(1, i + 1))) / v;
      a = [g, ...a.map((x,j) => x - g * a[i - j - 1])]
      v *= 1 - g * g;
  }
  // return the coefficients of the A(z) filter
  return a.reverse();
}

static solve_yule_walker(x, p) {
  // compute p LPC coefficients for a speech segment
  return LPC.ld(LPC.bac(x, p), p);
}

static dot(a, b) {
  return a.map((x, i) => x * b[i]).reduce((acc, val) => acc + val, 0);
}


static transpose(matrix) {
  if(matrix[0] === undefined) return matrix;
  const rows = matrix.length, cols = matrix[0].length;
  const grid = [];
  for (let j = 0; j < cols; j++) {
    grid[j] = Array(rows);
  }
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[j][i] = matrix[i][j];
    }
  }
  return grid;
}

static matrixVecMul(A, v){
  let m = A.length;
  let n = A[0].length;
  let result = Array(m).fill(0);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      result[i] += A[i][j] * v[j];
    }
  }
  return result;

}

// Copied from https://www.npmjs.com/package/ml-matrix
static matrixMul(A, B){

  let m = A[0].length;
  let n = A.length;
  let p = B[0].length;
  let result = Array.from({length: n}, () => Array.from({length: p}, () => 0));

  let Bcolj = new Float64Array(n);
    for (let j = 0; j < p; j++) {
      for (let k = 0; k < n; k++) {
        Bcolj[k] = B[k][j];
      }

      for (let i = 0; i < m; i++) {
        let s = 0;
        for (let k = 0; k < n; k++) {
          s += A[i][k] * Bcolj[k];
        }
        result[i][j] = s;
      }
    }
    return result;
}
  

// // https://stackoverflow.com/a/52222561 I wish i had the APL N,/ right now
// function windowedSlice(arr, size) {
// 	let result = [];
// 	arr.some((el, i) => {
// 	  if (i + size > arr.length) return true;
// 	  result.push(arr.slice(i, i + size));
// 	});
// 	return result;
//   }
}