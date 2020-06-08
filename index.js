
/**
 * @type { HTMLCanvasElement }
 */
const canvas = document.querySelector('#glcanvas')

const gl = canvas.getContext('webgl')

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {*} type 
 * @param {*} source 
 */
function createShader(gl, type, source) {
  // 着色器对象
  const shader = gl.createShader(type)
  // 提供数据源
  gl.shaderSource(shader, source)
  // 编译 -> 生成着色器
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  console.log(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}

/**
 * 将着色器link到一个program(着色程序)
 * @param {WebGL2RenderingContext} gl 
 * @param {*} vertexShader 
 * @param {*} fragmentShader 
 */
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
 
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

// Fill the buffer with the values that define a rectangle.
function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}

const vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
const fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;
// 创建两个着色器
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// 一个GLSL着色程序
const program = createProgram(gl, vertexShader, fragmentShader)

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
const colorUniformLocation = gl.getUniformLocation(program, "u_color");

const positionBuffer = gl.createBuffer()

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

// const positions = [
//   0, 0,
//   200, 0,
//   0, 200,
//   200, 200,
//   200, 100,
//   100, 200
// ]

// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
gl.clearColor(0, 0, 0, 0)
gl.clear(gl.COLOR_BUFFER_BIT)

gl.useProgram(program)

gl.enableVertexAttribArray(positionAttributeLocation)

// Bind the position buffer.
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
var size = 2;          // 2 components per iteration
var type = gl.FLOAT;   // the data is 32bit floats
var normalize = false; // don't normalize the data
var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
var offset = 0;        // start at the beginning of the buffer
gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

// 设置全局变量 分辨率
gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

// // draw
// var primitiveType = gl.TRIANGLES;
// var offset = 0;
// var count = 6;
// gl.drawArrays(primitiveType, offset, count);

for (let i = 0; i < 50; i++) {
  setRectangle(
    gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300)
  )

  gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1)

  gl.drawArrays(gl.TRIANGLES, 0, 6)
}