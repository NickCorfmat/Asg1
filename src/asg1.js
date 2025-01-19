// Nick Corfmat
// ncorfmat@ucsc.edu

// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = u_Size;
    }`;

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`;

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Retrieve WebGl rendering context
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get WebGL context.");
    return;
  }
}

function connectShadersToGLSL() {
  // Initialize shaders (compile + install shaders)
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  // Get the storage location of a_Position variable
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position.");
    return;
  }

  // Get the storage location of u_FragColor variable
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor.");
    return;
  }

  // Get the storage location of u_Size variable
  u_Size = gl.getUniformLocation(gl.program, "u_Size");
  if (!u_Size) {
    console.log("Failed to get the storage location of u_Size.");
    return;
  }
}

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // Button Events (Shape Type)
  document.getElementById("green").onclick = function () {
    g_selectedColor = [0.0, 1.0, 0.0, 1.0];
  };
  document.getElementById("red").onclick = function () {
    g_selectedColor = [1.0, 0.0, 0.0, 1.0];
  };
  document.getElementById("clearButton").onclick = function () {
    g_shapesList = [];
    renderAllShapes();
  };

  document
    .getElementById("pointButton")
    .addEventListener("mouseup", function () {
      g_selectedType = POINT;
    });

  document.getElementById("triButton").addEventListener("mouseup", function () {
    g_selectedType = TRIANGLE;
  });
  document
    .getElementById("circleButton")
    .addEventListener("mouseup", function () {
      g_selectedType = CIRCLE;
    });

  // Slider Events
  document.getElementById("redSlider").addEventListener("mouseup", function () {
    g_selectedColor[0] = this.value / 100;
  });
  document
    .getElementById("greenSlider")
    .addEventListener("mouseup", function () {
      g_selectedColor[1] = this.value / 100;
    });
  document
    .getElementById("blueSlider")
    .addEventListener("mouseup", function () {
      g_selectedColor[2] = this.value / 100;
    });

  // Size slider
  document
    .getElementById("sizeSlider")
    .addEventListener("mouseup", function () {
      g_selectedSize = this.value;
    });
}

function main() {
  setupWebGL();
  connectShadersToGLSL();
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = handleClicks;
  canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) {
      handleClicks(ev);
    }
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function handleClicks(ev) {
  // Extract the event click and return it in WebGL coordinates
  let [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }

  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

function renderAllShapes() {
  // Check the time at the start of this function
  //var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;

  for (var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  // Check the time at the end of the function, and display on web page
  // var duration = performance.now() - startTime;
  // sendTextToHTML(
  //   "numdot: " +
  //     len +
  //     " ms: " +
  //     Math.floor(duration) +
  //     " fps: " +
  //     Math.floor(10000 / duration) / 10,
  //   "numdot"
  // );
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML.");
    return;
  }

  htmlElm.innerHTML = text;
}
