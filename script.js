// script.js
// Made for CSE 110 Lab #5 by Artyom Muradyan

// for image upload and display
const img = new Image(); // used to load image from <input> and draw to canvas
const img_input = document.getElementById("image-input");

// canvas element and context
const canvas = document.getElementById('user-image')
const context = canvas.getContext('2d');

// form element
const form = document.getElementById("generate-meme");

// button elements
const submit_button = document.querySelector("[type='submit']");
const clear_button = document.querySelector("[type='reset']");
const read_button = document.querySelector("[type='button']");

// volume elements
const volume = document.getElementById("volume-group");
const slider = document.querySelector("[type='range']");

// speeech synthesis
var synth = window.speechSynthesis;
var voiceSelect = document.getElementById('voice-selection');
voiceSelect.remove(0); // delete "No availible voices"
let icon = document.querySelector("[src='icons/volume-level-3.svg']")
var voices = [];

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const obj = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  context.drawImage(img, obj.startX, obj.startY, obj.width, obj.height);
});

// Fires whenever the image input file is changed
img_input.addEventListener('change', () => {
  img.src = URL.createObjectURL(img_input.files[0]);
  img.alt =  img_input.files[0].name;
});

// Fires when the generate button is submitted, adds the top and bottom text
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const top_text = document.getElementById('text-top').value;
  const bottom_text = document.getElementById('text-bottom').value;

  // fill top and bottom text with impact font in the center
  context.font = '50px impact';
  context.fillStyle = "white";
  context.textAlign = "center";
  context.fillText(top_text, canvas.width/2, 75);
  context.fillText(bottom_text, canvas.width/2, 360);

  // outline for top and bottom
  context.strokeText(top_text, canvas.width/2, 75);
  context.strokeText(bottom_text, canvas.width/2, 360);
  
  // change button states
  submit_button.disabled = true;
  clear_button.disabled = false;
  read_button.disabled = false;
});

// Fires when the clear button is clicked, empties the canvas
clear_button.addEventListener('click', () => {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // change button states
  submit_button.disabled = false;
  clear_button.disabled = true;
  read_button.disabled = true;
});

// Fires when the read button is clicked, reads the text out loud
read_button.addEventListener('click', (e) => {
  e.preventDefault();

  const top_text = document.getElementById('text-top').value;
  const bottom_text = document.getElementById('text-bottom').value;
  
  var utterThis_top = new SpeechSynthesisUtterance(top_text);
  var utterThis_bottom = new SpeechSynthesisUtterance(bottom_text);
  
  // choose correct selection
  var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utterThis_top.voice = voices[i];
      utterThis_bottom.voice = voices[i];
    }
  }

  // pick correct volume and read the text
  utterThis_top.volume = slider.value / 100;
  utterThis_bottom.volume = slider.value / 100;
  synth.speak(utterThis_top);
  synth.speak(utterThis_bottom);
});

// change volume icon depending on slider's value
volume.addEventListener('input', () => {
  if(slider.value == 0){
    icon.src = "icons/volume-level-0.svg";
    icon.alt = "Volume Level 0";
  }else if(slider.value <= 33 && slider.value >= 1){
    icon.src = "icons/volume-level-1.svg";
    icon.alt = "Volume Level 1";
  }else if(slider.value <= 66 && slider.value >= 34){
    icon.src = "icons/volume-level-2.svg";
    icon.alt = "Volume Level 2";
  }else {
    icon.src = "icons/volume-level-3.svg";
    icon.alt = "Volume Level 3";
  }
});


// From Mozilla's SpeechSynthesis Documentation
function populateVoiceList() {
  voices = synth.getVoices();

  for(var i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.disabled = false;
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}


/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
