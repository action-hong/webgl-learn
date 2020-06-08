function main() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#canvas')
  const gl = canvas.getContext('webgl')

  const program = webglUtils.createProgramFromScripts(gl, [
    "vertex-shader-2d",
    "fragment-shader-2d",
  ])

  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
  const translationLocation = gl.getUniformLocation(program, 'u_translation')
  const rotationLocation = gl.getUniformLocation(program, 'u_rotation')
  const colorLocation = gl.getUniformLocation(program, 'u_color')
  const scaleLocation = gl.getUniformLocation(program, 'u_scale')

  const translation = [150, 100]
  const rotation = [0, 1]
  const scale = [1, 1]
  const width = 200
  const height = 200
  const color = [Math.random(), Math.random(), Math.random(), 1]

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  console.log(gl.canvas.width, gl.canvas.height)
  console.log(canvas.width, canvas.height)
  // setRectangle(gl, 0, 0, gl.canvas.width, gl.canvas.height)
  setRectangle(gl)



  drawScene()

  // Setup a ui.
  webglLessonsUI.setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#angle", {slide: updateAngle, max: 360});
  webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
  webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});
  // $("#rotation").gmanUnitCircle({
  //   width: 200,
  //   height: 200,
  //   value: 0,
  //   slide: function(e,u) {
  //     rotation[0] = u.x;
  //     rotation[1] = u.y;
  //     drawScene();
  //   }
  // });

  function updateAngle(event, ui) {
    const angle = (ui.value + 90) * Math.PI / 180
    rotation[0] = Math.cos(angle)
    rotation[1] = Math.sin(angle)
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

    // 直接将平移传给gl, 由他去处理
    // 不然图形复杂后, 在js端去计算那就太麻烦了
    gl.uniform2fv(translationLocation, translation)
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)

    gl.uniform4fv(colorLocation, color)

    gl.uniform2fv(rotationLocation, rotation);
    gl.uniform2fv(scaleLocation, scale);

    gl.drawArrays(gl.TRIANGLES, 0, 18)
  }

  /**
   * 
   * @param {WebGL2RenderingContext} gl 
   */
  function setRectangle(gl) {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          // left column
          0, 0,
          30, 0,
          0, 150,
          0, 150,
          30, 0,
          30, 150,

          // top rung
          30, 0,
          100, 0,
          30, 30,
          30, 30,
          100, 0,
          100, 30,

          // middle rung
          30, 60,
          67, 60,
          30, 90,
          30, 90,
          67, 60,
          67, 90,
      ]),
      gl.STATIC_DRAW);
  }
}

main()