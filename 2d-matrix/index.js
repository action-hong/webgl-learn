const m3 = {
  projection(w, h) {
    return [
      2 / w, 0, 0,
      0, -2 / h, 0,
      -1, 1, 1
    ]
  },
  translation(x, y) {
    return [
      1, 0, 0,
      0, 1, 0,
      x, y, 1,
    ]
  },
  rotation(angle) {
    angle = Math.PI * angle / 180
    const s = Math.sin(angle)
    const c = Math.cos(angle)
    return [
      c, -s, 0,
      s, c, 0,
      0, 0, 1
    ]
  },
  scaling(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1
    ]
  },
  multiply(a, b) {
    // if (m1.length !== 9 || m2.length !== 9) {
    //   throw new Error('invalid argument, array\'s length must be 9')
    // }

    // const res = []

    // for (let i = 0; i < 9; i++) {
    //   // 第col行 点乘 row 列
    //   const col = Math.floor(i / 3)
    //   const row = i % 3
    //   res[i] = 0
    //   for (let j = 0; j < 3; j++) {
    //     res[i] += m1[j + 3 * col] * m2[row + 3 * j]
    //   }
    // }
    // return res
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
  translate(m, tx, ty) {
    return m3.multiply(m, m3.translation(tx, ty))
  },
  rotate(m, angle) {
    return m3.multiply(m, m3.rotation(angle))
  },
  scale(m, sx, sy) {
    return m3.multiply(m, m3.scaling(sx, sy))
  }
}

function main() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");

  const program = webglUtils.createProgramFromScripts(gl, [
    "vertex-shader-2d",
    "fragment-shader-2d",
  ]);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");
  const colorLocation = gl.getUniformLocation(program, "u_color");

  const translation = [150, 100]
  // const rotation = [0, 1]
  let angle = 0
  const scale = [1, 1]
  const color = [Math.random(), Math.random(), Math.random(), 1];

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(gl);

  drawScene()

  // Setup a ui.
  webglLessonsUI.setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#angle", {slide: updateAngle, max: 360});
  webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
  webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});

  function updateAngle(event, ui) {
    // const angle = (ui.value + 90) * Math.PI / 180
    // rotation[0] = Math.cos(angle)
    // rotation[1] = Math.sin(angle)
    angle = 360 - ui.value
    drawScene()
  }

  function updateScale(idx) {
    return function (event, ui) {
      scale[idx] = ui.value
      drawScene()
    }
  }

  function updatePosition(idx) {
    return function (event, ui) {
      translation[idx] = ui.value
      drawScene()
    }
  }

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program)

    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    gl.uniform4fv(colorLocation, color)

    let matrix = m3.projection(canvas.clientWidth, canvas.clientHeight)
    matrix = m3.translate(matrix, translation[0], translation[1])
    matrix = m3.rotate(matrix, angle)
    matrix = m3.scale(matrix, scale[0], scale[1])

    gl.uniformMatrix3fv(matrixLocation, false, matrix)
    console.log(matrix)
    gl.drawArrays(gl.TRIANGLES, 0, 18)
  }

  function setRectangle(gl) {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        // left column
        0,
        0,
        30,
        0,
        0,
        150,
        0,
        150,
        30,
        0,
        30,
        150,

        // top rung
        30,
        0,
        100,
        0,
        30,
        30,
        30,
        30,
        100,
        0,
        100,
        30,

        // middle rung
        30,
        60,
        67,
        60,
        30,
        90,
        30,
        90,
        67,
        60,
        67,
        90,
      ]),
      gl.STATIC_DRAW
    );
  }
}

main()
