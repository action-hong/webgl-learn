// Define several convolution kernels
const kernels = {
  normal: [
    0, 0, 0,
    0, 1, 0,
    0, 0, 0
  ],
  gaussianBlur: [
    0.045, 0.122, 0.045,
    0.122, 0.332, 0.122,
    0.045, 0.122, 0.045
  ],
  gaussianBlur2: [
    1, 2, 1,
    2, 4, 2,
    1, 2, 1
  ],
  gaussianBlur3: [
    0, 1, 0,
    1, 1, 1,
    0, 1, 0
  ],
  unsharpen: [
    -1, -1, -1,
    -1,  9, -1,
    -1, -1, -1
  ],
  sharpness: [
     0,-1, 0,
    -1, 5,-1,
     0,-1, 0
  ],
  sharpen: [
     -1, -1, -1,
     -1, 16, -1,
     -1, -1, -1
  ],
  edgeDetect: [
     -0.125, -0.125, -0.125,
     -0.125,  1,     -0.125,
     -0.125, -0.125, -0.125
  ],
  edgeDetect2: [
     -1, -1, -1,
     -1,  8, -1,
     -1, -1, -1
  ],
  edgeDetect3: [
     -5, 0, 0,
      0, 0, 0,
      0, 0, 5
  ],
  edgeDetect4: [
     -1, -1, -1,
      0,  0,  0,
      1,  1,  1
  ],
  edgeDetect5: [
     -1, -1, -1,
      2,  2,  2,
     -1, -1, -1
  ],
  edgeDetect6: [
     -5, -5, -5,
     -5, 39, -5,
     -5, -5, -5
  ],
  sobelHorizontal: [
      1,  2,  1,
      0,  0,  0,
     -1, -2, -1
  ],
  sobelVertical: [
      1,  0, -1,
      2,  0, -2,
      1,  0, -1
  ],
  previtHorizontal: [
      1,  1,  1,
      0,  0,  0,
     -1, -1, -1
  ],
  previtVertical: [
      1,  0, -1,
      1,  0, -1,
      1,  0, -1
  ],
  boxBlur: [
      0.111, 0.111, 0.111,
      0.111, 0.111, 0.111,
      0.111, 0.111, 0.111
  ],
  triangleBlur: [
      0.0625, 0.125, 0.0625,
      0.125,  0.25,  0.125,
      0.0625, 0.125, 0.0625
  ],
  emboss: [
     -2, -1,  0,
     -1,  1,  1,
      0,  1,  2
  ]
};

function main() {
  const image = new Image()
  image.src = './leaves.jpg'
  image.onload = () => {
    render(image)
  }
}

/**
 * 
 * @param {HTMLImageElement} image 
 */
function render(image) {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#canvas')
  const gl = canvas.getContext('webgl')

  const program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);

  // look up where the vertex data needs to go.
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

  // Create a buffer to put three 2d clip space points in
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  setRectangle(gl, 0, 0, image.width, image.height)

  const texcoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0
  ]), gl.STATIC_DRAW)

  // create a texture
  // 默认使用纹理单元0, 所以即使没设置u_image也正常
  const texture = gl.createTexture()
  // gl.bindTexture(gl.TEXTURE_2D, texture)

  // 让u_image使用纹理单元6
  const u_imageLoc = gl.getUniformLocation(program, 'u_image')
  
  // 绑定纹理到单元6
  gl.activeTexture(gl.TEXTURE6)
  gl.bindTexture(gl.TEXTURE_2D, texture)

  // 查看可使用的单元个数
  console.log('单元个数', gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS))
  console.log('可以使用几个顶点着色器纹理单元', gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS))
  // 

  // set the parameters so we can render any size image
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

  // look uniforms
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
  const textureSizeLocation = gl.getUniformLocation(program, 'u_textureSize')
  const kernelLocation = gl.getUniformLocation(program, 'u_kernel[0]')
  const kernelWeightLocation = gl.getUniformLocation(program, 'u_kernelWeight')

  let initialSelection = 'edgeDetect2'

  // setup ui to pick kernels
  var ui = document.querySelector("#ui");
  var select = document.createElement("select");
  for (var name in kernels) {
    var option = document.createElement("option");
    option.value = name;
    if (name === initialSelection) {
      option.selected = true;
    }
    option.appendChild(document.createTextNode(name));
    select.appendChild(option);
  }
  select.onchange = function(event) {
    drawWithKernel(this.options[this.selectedIndex].value);
  };
  ui.appendChild(select);
  drawWithKernel(initialSelection);

  function drawWithKernel(name) {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(program)

    gl.enableVertexAttribArray(positionLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(texcoordLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0)

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)
    gl.uniform2f(textureSizeLocation, image.width, image.height)

    gl.uniform1fv(kernelLocation, kernels[name])
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels[name]))

    // 使用纹理单元6
    gl.uniform1i(u_imageLoc, 6)
  
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

   // Tell WebGL how to convert from clip space to pixels
  //  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  //  // Clear the canvas
  //  gl.clearColor(0, 0, 0, 0);
  //  gl.clear(gl.COLOR_BUFFER_BIT);
 
  //  // Tell it to use our program (pair of shaders)
  //  gl.useProgram(program);

  //  gl.enableVertexAttribArray(positionLocation)
  //  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  //  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  //  gl.enableVertexAttribArray(texcoordLocation)
  //  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
  //  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0)

  //  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)

  //  gl.uniform2f(textureSizeLocation, image.width, image.height)

  //  gl.drawArrays(gl.TRIANGLES, 0, 6)
}

function setRectangle(gl, x, y, width, height) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}

function computeKernelWeight(kernel) {
  const weight = kernel.reduce((prev, cur) => prev + cur)
  return weight <= 0 ? 1 : weight 
}

main()