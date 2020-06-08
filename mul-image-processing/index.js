// Define several convolution kernels
const kernels = {
  normal: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  gaussianBlur: [0.045, 0.122, 0.045, 0.122, 0.332, 0.122, 0.045, 0.122, 0.045],
  gaussianBlur2: [1, 2, 1, 2, 4, 2, 1, 2, 1],
  gaussianBlur3: [0, 1, 0, 1, 1, 1, 0, 1, 0],
  unsharpen: [-1, -1, -1, -1, 9, -1, -1, -1, -1],
  sharpness: [0, -1, 0, -1, 5, -1, 0, -1, 0],
  sharpen: [-1, -1, -1, -1, 16, -1, -1, -1, -1],
  edgeDetect: [
    -0.125,
    -0.125,
    -0.125,
    -0.125,
    1,
    -0.125,
    -0.125,
    -0.125,
    -0.125,
  ],
  edgeDetect2: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
  edgeDetect3: [-5, 0, 0, 0, 0, 0, 0, 0, 5],
  edgeDetect4: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
  edgeDetect5: [-1, -1, -1, 2, 2, 2, -1, -1, -1],
  edgeDetect6: [-5, -5, -5, -5, 39, -5, -5, -5, -5],
  sobelHorizontal: [1, 2, 1, 0, 0, 0, -1, -2, -1],
  sobelVertical: [1, 0, -1, 2, 0, -2, 1, 0, -1],
  previtHorizontal: [1, 1, 1, 0, 0, 0, -1, -1, -1],
  previtVertical: [1, 0, -1, 1, 0, -1, 1, 0, -1],
  boxBlur: [0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111],
  triangleBlur: [
    0.0625,
    0.125,
    0.0625,
    0.125,
    0.25,
    0.125,
    0.0625,
    0.125,
    0.0625,
  ],
  emboss: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
};

function main() {
  const image = new Image();
  image.src = "./leaves.jpg";
  image.onload = () => {
    render(image);
  };
}

/**
 *
 * @param {HTMLImageElement} image
 */
function render(image) {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");

  const program = webglUtils.createProgramFromScripts(gl, [
    "vertex-shader-2d",
    "fragment-shader-2d",
  ]);

  // look up where the vertex data needs to go.
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

  // Create a buffer to put three 2d clip space points in
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(gl, 0, 0, image.width, image.height);

  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0,
    ]),
    gl.STATIC_DRAW
  );

  // create a texture and put the image in it
  const originalImageTexture = createAndSetupTexture(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // CREATE 2 texture and attach them to framebuffers
  const textures = [];
  const framebuffers = [];
  for (let i = 0; i < 2; i++) {
    const texture = createAndSetupTexture(gl);
    textures.push(texture);
    // make the texture the same size as the image
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      image.width,
      image.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );

    // CREATE A FRAMEBUFFER
    const fbo = gl.createFramebuffer();
    framebuffers.push(fbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    // attach a texture to it
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );
  }

  // look uniforms
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
  const kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
  const kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");
  const flipYLocation = gl.getUniformLocation(program, "u_flipY");

  var effects = [
    { name: "gaussianBlur3", on: true },
    { name: "gaussianBlur3", on: true },
    { name: "gaussianBlur3", on: true },
    { name: "sharpness" },
    { name: "sharpness" },
    { name: "sharpness" },
    { name: "sharpen" },
    { name: "sharpen" },
    { name: "sharpen" },
    { name: "unsharpen" },
    { name: "unsharpen" },
    { name: "unsharpen" },
    { name: "emboss", on: true },
    { name: "edgeDetect" },
    { name: "edgeDetect" },
    { name: "edgeDetect3" },
    { name: "edgeDetect3" },
  ];

  // Setup a ui.
  var ui = document.querySelector("#ui");
  var table = document.createElement("table");
  var tbody = document.createElement("tbody");
  for (var ii = 0; ii < effects.length; ++ii) {
    var effect = effects[ii];
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    var chk = document.createElement("input");
    chk.value = effect.name;
    chk.type = "checkbox";
    if (effect.on) {
      chk.checked = "true";
    }
    chk.onchange = drawEffects;
    td.appendChild(chk);
    td.appendChild(document.createTextNode("≡ " + effect.name));
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  ui.appendChild(table);
  $("#ui table").tableDnD({ onDrop: drawEffects });

  drawEffects();

  function drawEffects(name) {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    gl.enableVertexAttribArray(positionLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(texcoordLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0)

    gl.uniform2f(textureSizeLocation, image.width, image.height)
    
    // start with the original iamge
    gl.bindTexture(gl.TEXTURE_2D, originalImageTexture)

    // 这个全局属性是干嘛的 ??
    // don't y flip images while drawing to the textures
    // 渲染时(0, 0)是在左下角, 所以传入-1翻转使得(0, 0)在左上角
    // 而帧缓冲时, 不显示所以无所谓, 而且计算中0,0 对应帧缓冲中的0, 0像素, 所以此时传入1
    gl.uniform1f(flipYLocation, 1)

    // loop through each effect we want to apply.
    let count = 0;
    for (let ii = 0; ii < tbody.rows.length; ++ii) {
      let checkbox = tbody.rows[ii].firstChild.firstChild;
      if (checkbox.checked) {
        // Setup to draw into one of the framebuffers.
        setFramebuffer(framebuffers[count % 2], image.width, image.height);

        drawWithKernel(checkbox.value);

        // for the next draw, use the texture we just rendered to.
        gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);

        // increment count so we use the other texture next time.
        ++count;
      }
    }

    // finally draw the result to the canvas.
    gl.uniform1f(flipYLocation, -1);  // need to y flip for canvas
    setFramebuffer(null, gl.canvas.width, gl.canvas.height);
    drawWithKernel("normal");
  }

  function setFramebuffer(fbo, width, height) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.uniform2f(resolutionLocation, width, height)
    gl.viewport(0, 0, width, height)
  }

  function drawWithKernel(name) {
    gl.uniform1fv(kernelLocation, kernels[name])
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels[name]))

    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }
}

function createAndSetupTexture(gl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 设置材质，这样我们可以对任意大小的图像进行像素操作
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
}

function setRectangle(gl, x, y, width, height) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
}

function computeKernelWeight(kernel) {
  const weight = kernel.reduce((prev, cur) => prev + cur);
  return weight <= 0 ? 1 : weight;
}

main();
