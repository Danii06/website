import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import "https://unpkg.com/tone@15.0.4/build/Tone.js";

var graphElement = document.getElementById("graph");
var matrixElement = document.getElementById("matrix");

let matrix = [
    [1, 2, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0],
    [1, 2, 1, 2, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 2, 1],
    [0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 1]
];

var simulation = null;

const ROMAN = ['I','II','III','IV','V','VI','VII'];
const NOTES = ['C','D','E','F','G','A','B'];

const RAINBOW = ['#eb7c72','#ea9f6f','#e1cd6a','#b2d18b','#b0d7d6','#b5add4','#e0b6dc'];

let sampler = null;

sampler = new Tone.Sampler({
    'A4': 'A4v10.mp3',
    'C4': 'C4v10.mp3',
    'D#4': 'D#4v10.mp3',
    'F#4': 'F#4v10.mp3',
}).toDestination();


let CMajor = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
let DMajor = ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5'];
let EMajor = ['E4', 'F#4', 'G#4', 'A4', 'B4', 'C#5', 'D#5'];
let FMajor = ['F4', 'G4', 'A4', 'A#4', 'C5', 'D5', 'E5'];
let GMajor = ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5'];
let AMajor = ['A4', 'B4', 'C#5', 'D5', 'E5', 'F#5', 'G#5'];
let BMajor = ['B4', 'C#5', 'D#5', 'E5', 'F#5', 'G#5', 'A#5'];

let CMinor = ['C4', 'D4', 'D#4', 'F4', 'G4', 'G#4', 'A#4'];
let DMinor = ['D4', 'E4', 'F4', 'G4', 'A4', 'A#4', 'C5'];
let EMinor = ['E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5'];
let FMinor = ['F4', 'G4', 'G#4', 'A#4', 'C5', 'C#5', 'D#5'];
let GMinor = ['G4', 'A4', 'A#4', 'C5', 'D5', 'D#5', 'F5'];
let AMinor = ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'];
let BMinor = ['B4', 'C#5', 'D5', 'E5', 'F#5', 'G5', 'A5'];

let keys = {
    'C': CMajor,
    'D': DMajor,
    'E': EMajor,
    'F': FMajor,
    'G': GMajor,
    'A': AMajor,
    'B': BMajor,
    'Cm': CMinor,
    'Dm': DMinor,
    'Em': EMinor,
    'Fm': FMinor,
    'Gm': GMinor,
    'Am': AMinor,
    'Bm': BMinor,
}

let noteToText = {
    'C4': 'C',
    'D4': 'D',
    'E4': 'E',
    'F4': 'F',
    'G4': 'G',
    'A4': 'A',
    'B4': 'B',
    'C#4': 'C#',
    'D#4': 'D#',
    'F#4': 'F#',
    'G#4': 'G#',
    'A#4': 'A#',
    'C5': 'C',
    'D5': 'D',
    'E5': 'E',
    'F5': 'F',
    'G5': 'G',
    'A5': 'A',
    'B5': 'B',
    'C#5': 'C#',
    'D#5': 'D#',
    'F#5': 'F#',
    'G#5': 'G#',
    'A#5': 'A#',
}

let melody = [];

let currentKey = 'C';
let generate100 = false;
let returnstart = false;
let returnstartpreferred = false;

export function importMatrix(){
    let matrixString = prompt("Paste the matrix here:");
    if(!matrixString) return;
    matrix = JSON.parse(matrixString);
    createGraph();
    createMatrix();
}

export function exportMatrix(){
    alert("Copied to clipboard!");
    navigator.clipboard.writeText(JSON.stringify(matrix));
}

var id = 0;
var timer = null;
export function playNextNote(){
    Tone.start();

    sampler.volume.value = -25;
    if(document.getElementById(id)){
        document.getElementById(id).style.fontWeight = 'bold';
        sampler.triggerAttackRelease(melody[id][0], '4n');
    } else {
        id = 0;
        stopPlayback();
        return;
    }
    if(document.getElementById(id-1)){
        document.getElementById(id-1).style.fontWeight = 'normal';
    }
    id++;
    timer = setTimeout(playNextNote, 300);
}

export function stopPlayback(){
    if(document.getElementById(id-1)){
        document.getElementById(id-1).style.fontWeight = 'normal';
    }
    clearTimeout(timer);
}

const start = function(){
    createGraph();
    createMatrix();
}

const createGraph = function(){
    document.getElementsByTagName('svg')[0].innerHTML = '';
    var nodes = Array.from({ length: 7 }, (_, i) => ({
        id: i,
        x: graphElement.offsetWidth / 1.5 * i/7,
        y: graphElement.offsetHeight / 2 + (i%2)*graphElement.offsetHeight / 3
    }));

    const links = [];
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (matrix[i][j] !== 0) {
                links.push({ source: j, target: i, weight: matrix[i][j] });
            }
        }
    }

    const svg = d3.select('svg');
    
    simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-10))
        .force('center', d3.forceCenter(graphElement.offsetWidth/2, graphElement.offsetHeight/2));


    svg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 10)
    .attr('refY', 5) 
    .attr('markerWidth', 5)
    .attr('markerHeight', 5) 
    .attr('orient', 'auto')
    .append('path') 
    .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
    .attr('fill', 'black');
    


    const link = svg.selectAll('.link')
    .data(links)
    .enter().append('line')
    .attr('class', 'link')
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => getTargetNodeCircumferencePoint(d)[0])
    .attr('y2', d => getTargetNodeCircumferencePoint(d)[1])
    .attr('style', d => 'stroke: black; stroke-width: ' + (0.1+(d.weight/(d3.max(matrix.flat())))*2) + 'px;')
    .attr('marker-end', d => d.weight>1 ? 'url(#arrowhead)' : '');


    const node = svg.selectAll('.node')
    .data(nodes)
    .enter().append('circle')
    .attr('class', 'node')
    .attr('r', 20)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);

    const label = svg.selectAll('.label')
    .data(nodes)
    .enter().append('text')
    .attr('class', 'label')
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('dy', 7)
    .attr('text-anchor', 'middle')
    .text(d => ROMAN[d.id]);

    node.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }  
      
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    function getTargetNodeCircumferencePoint(d){

        var t_radius = 20.0;
        var dx = d.target.x - d.source.x;
        var dy = d.target.y - d.source.y;
        var gamma = Math.atan2(dy,dx); 
        var tx = d.target.x - (Math.cos(gamma) * t_radius);
        var ty = d.target.y - (Math.sin(gamma) * t_radius);
        
        return [tx,ty]; 
    }
        
    simulation.on('tick', function() {
    link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => getTargetNodeCircumferencePoint(d)[0])
        .attr('y2', d => getTargetNodeCircumferencePoint(d)[1]);

    node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

    label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });


}

const createMatrix = function(){
    const table = document.getElementById('matrix');
    table.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        let row = document.createElement('tr');
        
        for (let j = 0; j < 7; j++) {
            let cell = document.createElement('td');
            let input = document.createElement('input');
            input.value = matrix[i][j];

            input.addEventListener('input', (e) => {
                matrix[i][j] = parseInt(e.target.value) || 0;
                createGraph();
            });

            input.addEventListener(`focus`, () => input.select());

            cell.appendChild(input);
            row.appendChild(cell);
        }

        table.appendChild(row);
    }
}

export function generateMelody(){
    generate100 = document.getElementById("stopwhen").value == 'Generating 100 notes';
    returnstart = document.getElementById("stopwhen").value == 'Returning to start';
    returnstartpreferred = document.getElementById("stopwhen").value == 'Returning to start on preferred path';
    let startingnote = ROMAN.indexOf(document.getElementById("snote").value);
    melody = ROMAN.indexOf(document.getElementById("snote").value);
    let currnote = iota7equals(1+melody);

    currentKey = document.getElementById("mode").value;

    if(currentKey == 'Select Mode:'){
        alert("Choose a mode!")
        return;
    }

    if(melody == -1){
        alert("Choose a starting note!")
        return;
    } else {
        melody = [[keys[currentKey][melody]]];
    }

    function scale(vector, scale) {
        return vector.map(value => value * scale);
    }

    function mmul(M, vector) {
        let result = [];
        for (let i = 0; i < M.length; i++) {
          let sum = 0;
          for (let j = 0; j < vector.length; j++) {
            sum += M[i][j] * vector[j];
          }
          result.push(sum);
        }
        return result;
    }

    function randvec(vector) {
        return vector.map(value => Math.ceil(Math.random() * value * 10));
    }

    function maxindex(vector) {
        if (Math.max(...vector) == 0) return -1;
        return vector.indexOf(Math.max(...vector));
    }

    function iota7equals(scalar) {
        return [1,2,3,4,5,6,7].map((value, _) => value == scalar ? 1 : 0);
    }

    let prevnote = -1;
    let noteindex = -1;
    for(let i = 0;(i<1000)
                  && (i < 100 || !generate100) 
                  && !(returnstart && noteindex==startingnote && prevnote > -1) 
                  && !(returnstartpreferred && noteindex == startingnote && matrix[noteindex][prevnote]>1); i++){
        prevnote = noteindex;
        noteindex = maxindex(randvec(scale(mmul(matrix,currnote),10)))
        if(noteindex == -1) break;
        currnote = iota7equals(1+noteindex)
        melody.push([keys[currentKey][noteindex]])
    }
    //add coloured divs based on the notes
    let melodydiv = document.getElementById("melody");
    melodydiv.innerHTML = '';
    console.log(melody)
    for(let i = 0; i < melody.length; i++){
        let note = document.createElement('div');
        note.style.color = RAINBOW[keys[currentKey].indexOf(melody[i][0])];
        note.style.display = 'inline-block';
        note.style.cursor = 'pointer';
        note.id = i;
        note.addEventListener('click', function(){
            if(document.getElementById(id)){
                document.getElementById(id).style.fontWeight = 'normal';
            }
            id = i;
            stopPlayback();
            playNextNote();
        });
        note.innerHTML = noteToText[melody[i][0]];
        melodydiv.appendChild(note);
    }
}

window.onload = start;