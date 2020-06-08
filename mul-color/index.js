function main() {
  /**
   * @type { HTMLCanvasElement }
   */
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");

  const program = webglUtils.createProgramFromScripts(gl, [
    "vertex-shader-2d",
    "fragment-shader-2d",
  ]);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const colorLocation = gl.getAttribLocation(program, 'a_color')
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // set geometry
  setGeometry(gl);

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)

  setColors(gl)

  const translation = [200, 150];
  let angleInRadians = 0;
  const scale = [1, 1];

  drawScene();

  webglLessonsUI.setupSlider("#x", {
    value: translation[0],
    slide: updatePosition(0),
    max: gl.canvas.width,
  });
  webglLessonsUI.setupSlider("#y", {
    value: translation[1],
    slide: updatePosition(1),
    max: gl.canvas.height,
  });
  webglLessonsUI.setupSlider("#angle", { slide: updateAngle, max: 360 });
  webglLessonsUI.setupSlider("#scaleX", {
    value: scale[0],
    slide: updateScale(0),
    min: -5,
    max: 5,
    step: 0.01,
    precision: 2,
  });
  webglLessonsUI.setupSlider("#scaleY", {
    value: scale[1],
    slide: updateScale(1),
    min: -5,
    max: 5,
    step: 0.01,
    precision: 2,
  });

  function updatePosition(index) {
    return function (event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateAngle(event, ui) {
    var angleInDegrees = 360 - ui.value;
    angleInRadians = (angleInDegrees * Math.PI) / 180;
    drawScene();
  }

  function updateScale(index) {
    return function (event, ui) {
      scale[index] = ui.value;
      drawScene();
    };
  }

  function setGeometry(gl) {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          -150, -100,
           150, -100,
          -150,  100,
           150, -100,
          -150,  100,
           150,  100]),
      gl.STATIC_DRAW);
  }

  function setColors(gl) {
    // Pick 2 random colors.
    // var r1 = Math.random();
    // var b1 = Math.random();
    // var g1 = Math.random();
    // var r2 = Math.random();
    // var b2 = Math.random();
    // var g2 = Math.random();
  
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(
          [ Math.random(), Math.random(), Math.random(), 1,
            Math.random(), Math.random(), Math.random(), 1,
            Math.random(), Math.random(), Math.random(), 1,
            Math.random(), Math.random(), Math.random(), 1,
            Math.random(), Math.random(), Math.random(), 1,
            Math.random(), Math.random(), Math.random(), 1]),
        gl.STATIC_DRAW);
  }

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(program)

    // 告诉webgl我们想要从缓冲中提供数据
    gl.enableVertexAttribArray(positionAttributeLocation)
    // 将缓冲绑定到ARRAY_BUFFER绑定点, 他是WebGL内部的一个全局变量
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    const size = 2 // 顶点有几个单位的数据
    const type = gl.FLOAT // 单位数据类型
    const normalize = false
    const stride = 0 // 从一个数据到下一个数据要跳过多少位
    const offset = 0 // 数据在缓冲的什么位置
    // 告诉webgl从ARRAY_BUFFER绑定点当前绑定的缓冲获取数据
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

    gl.enableVertexAttribArray(colorLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0)

    let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
    matrix = m3.translate(matrix, translation[0], translation[1]);
    matrix = m3.rotate(matrix, angleInRadians);
    matrix = m3.scale(matrix, scale[0], scale[1]);
    gl.uniformMatrix3fv(matrixLocation, false, matrix)

    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }
}

main();
