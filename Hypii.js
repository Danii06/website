//===========================================Hypii=============================================
let distancetoStop=20;
let hypii;
let hypiiIMG;
let selectedText;
function initHypii(){
  document.write("<span id=\"Hypii\" class=\"tooltip\" style=\"position:absolute; left:25%; top:25%; z-index: 5;\"><img id=\"HypiiIMG\" src=\"Hypii.png\"></img><span class=\"tooltiptext\">Highlight some text then click Hypii to read aloud</span></span>");
  for(var i = 0;i<53;i++){
    document.write("<link rel='prefetch' href='/Talkinghypii/hypii"+i.toString()+".png'>");
  }
  for(var i = 0;i<31;i++){
    document.write("<link rel='prefetch' href='/Idlehypii/hypii"+i.toString()+".png'>");
  }
  document.write("<link rel=\"prefetch\" href=\"/Talkinghypii/hypii0.png\">")
  hypii=document.getElementById("Hypii");
  hypiiIMG=document.getElementById("HypiiIMG");
  setStateImage(0);
  
}
initHypii();

hypii.ondragstart = function() {
  return false;
};
hypii.onmousedown = function(event) {
  let shiftX = event.clientX - hypiiIMG.getBoundingClientRect().left;
  let shiftY = event.clientY - hypiiIMG.getBoundingClientRect().top;
  let initialPos=[pxint(hypii.style.left), pxint(hypii.style.top)];
  let distance=0;
  function moveAt(pageX, pageY) {
    hypii.style.left = pageX - shiftX / 2 + 'px';
    hypii.style.top = pageY - shiftY / 2 + 'px';
    distance = Math.abs(pxint(hypii.style.left)-initialPos[0])+Math.abs(pxint(hypii.style.top)-initialPos[0])
  }
  
  function onMouseMove(event) {
    moveAt(event.pageX, event.pageY);
  }
  
  document.addEventListener('mousemove', onMouseMove);
    
  onmouseup = function() {
    document.removeEventListener('mousemove', onMouseMove);
    onmouseup = null;
    if(distance<distancetoStop){
      if(window.speechSynthesis.speaking){
        window.speechSynthesis.cancel();
      }else{
        speak(selectedText);
      }
    }
  };
};
let displayedFrame=0;
//First X frames without button, last x frames with button
function setStateImage(displayedFrame){
  var iframe = document.getElementsByName("iframe")[0];
  try{
  var iwin= iframe.contentWindow || iframe.contentDocument.defaultView;
  
  if(iwin.getSelection().toString().length>0){
    selectedText=iwin.getSelection();
  }
  }catch(e){
  }
  if(window.getSelection().toString().length>0){
    selectedText=window.getSelection();
  }
  if(window.speechSynthesis.speaking){ //TODO spinning, opening and closing
//    let opened=displayedFrame>=X //Set X
//    if(hovering){ //TODO make hovering boolean
//      if(opened){
//        hypiiIMG.src="/Hypii"+displayedFrame+".png" //Make Hypiiopened
//        displayedFrame=X+(displayedFrame+1)%FINALOPENED; //Set X
//        setTimeout("setStateImage(displayedFrame)",220) // TODO make framerate
//      }else{
//        hypiiIMG.src="/HypiiOpening.png" //Make HypiiOpening
//        setTimeout("setStateImage(X)",TIMETOFINISH) //TODO ADD TIME TO FINISH
//      }
//    }else{
//      if(opened){
//        hypiiIMG.src="/HypiiClosing.png" //Make HypiiOpening
//        setTimeout("setStateImage(0)",TIMETOFINISH) //TODO ADD TIME TO FINISH
//      }else{
        displayedFrame=(displayedFrame+1)%54;//TODO Set frame count
        hypiiIMG.src="/Talkinghypii/hypii"+displayedFrame.toString()+".png"
        //TODO make framerate
//      }
//    }
    
  }else{
    displayedFrame=(displayedFrame+1)%17;//TODO Set frame count
    hypiiIMG.src="/Idlehypii/hypii"+displayedFrame.toString()+".png"
  }
  setTimeout("setStateImage("+displayedFrame.toString()+");",100)
}


function speak (message) {
  var msg = new SpeechSynthesisUtterance(message);
  var voices = window.speechSynthesis.getVoices();
  msg.voice = voices[0];
  window.speechSynthesis.speak(msg);
}


function pxint(str){
  return parseInt(str.substring(0,str.length-2));
}




