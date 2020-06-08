/**
 * 
 * @param {string} url
 * @returns {Promise<HTMLImageElement>} 
 */
function loadImage (url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = url
    image.onload = () => {
      resolve(image)
    }
  })
}

/**
 * 
 * @param {Array<string>} urls 
 */
function loadImages (urls) {
  return Promise.all(urls.map(url => loadImage(url)))
}

async function main() {
  const images = await loadImages(['./leaves.jpg', './star.jpg'])

  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");

  const program = webglUtils.createProgramFromScripts(gl, [
    "vertex-shader-2d",
    "fragment-shader-2d",
  ])

  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const texcoordLocation = gl.getAttribLocation(program, 'a_texCoord')

  const u_image0Location = gl.getUniformLocation(program, 'u_image0')
  const u_image1Location = gl.getUniformLocation(program, 'u_image1')

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  // 这里面对应的点要和下面 texcoordBuffer传入的点位置一致
  setRectangle(gl, 0, 0, images[0].width, images[0].height)

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

  // 创建两个纹理
  const textures = []
  for (let i = 0; i < 2; i++) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // 设置参数以便使用任意尺的影像
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
    // 上传图像到纹理
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
 
    // 将纹理添加到纹理序列
    textures.push(texture);
  }
  
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
  
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  
  // 这句话很重要
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.useProgram(program)

  gl.enableVertexAttribArray(positionLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(texcoordLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0)

  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)

  gl.uniform1i(u_image0Location, 0)
  gl.uniform1i(u_image1Location, 1)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, textures[0])
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, textures[1])

  gl.drawArrays(gl.TRIANGLES, 0, 6)

  /**
   * 
   * @param {WebGL2RenderingContext} gl 
   * @param {*} x 
   * @param {*} y 
   * @param {*} width 
   * @param {*} height 
   */
  function setRectangle(gl, x, y, width, height) {
    const x1 = x
    const y1 = y
    const x2 = x + width
    const y2 = y + height
    console.log(x1, y1, x2, y2)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2
    ]), gl.STATIC_DRAW)
  }
}

main()