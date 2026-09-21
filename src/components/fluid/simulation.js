// Simulation fluide WebGL (Navier-Stokes) — portage fidèle de l'algorithme
// éprouvé du composant d'origine, restructuré en factory avec :
//  - FBOs autodétruits (l'original fuyait divergence/curl/pressure à chaque resize)
//  - syncSize() : re-création des framebuffers UNIQUEMENT si la résolution change
//  - dispose() : suppression de tous les programmes/shaders/textures/FBOs/buffers

import {
  BASE_VERTEX_SHADER,
  COPY_SHADER,
  CLEAR_SHADER,
  DISPLAY_SHADER_SOURCE,
  SPLAT_SHADER,
  ADVECTION_SHADER,
  DIVERGENCE_SHADER,
  CURL_SHADER,
  VORTICITY_SHADER,
  PRESSURE_SHADER,
  GRADIENT_SUBTRACT_SHADER,
} from './shaders'

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl
 * @param {object} ext formats rendables (cf. gl.js)
 * @param {object} config { simResolution, dyeResolution, pressureIterations,
 *   curl, densityDissipation, velocityDissipation, pressure, splatRadius,
 *   splatForce, shading }
 * @param {object} getCanvasSize () => { w, h } en pixels device (aspect ratio)
 */
export function createSimulation({ gl, ext, config, getCanvasSize }) {
  const programs = []
  const shaders = []
  let buffers = []

  // ————— compilation —————

  function compileShader(type, source, keywords) {
    if (keywords && keywords.length) {
      source = keywords.map((k) => `#define ${k}\n`).join('') + source
    }
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader)
      throw new Error('shader: ' + gl.getShaderInfoLog(shader))
    }
    shaders.push(shader)
    return shader
  }

  function createProgram(vertexShader, fragmentShader) {
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program)
      throw new Error('program: ' + gl.getProgramInfoLog(program))
    }
    programs.push(program)
    return program
  }

  function getUniforms(program) {
    const uniforms = {}
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < count; i++) {
      const name = gl.getActiveUniform(program, i).name
      uniforms[name] = gl.getUniformLocation(program, name)
    }
    return uniforms
  }

  class Program {
    constructor(vertexShader, fragmentShader) {
      this.uniforms = {}
      this.program = createProgram(vertexShader, fragmentShader)
      this.uniforms = getUniforms(this.program)
    }
    bind() {
      gl.useProgram(this.program)
    }
  }

  // Le shader d'affichage a des variantes par mots-clés (SHADING on/off).
  class Material {
    constructor(vertexShader, fragmentShaderSource) {
      this.vertexShader = vertexShader
      this.fragmentShaderSource = fragmentShaderSource
      this.programs = {}
      this.activeProgram = null
      this.uniforms = {}
    }
    setKeywords(keywords) {
      let hash = 0
      for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i])
      let program = this.programs[hash]
      if (program == null) {
        const fragmentShader = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords)
        program = createProgram(this.vertexShader, fragmentShader)
        this.programs[hash] = program
      }
      if (program === this.activeProgram) return
      this.uniforms = getUniforms(program)
      this.activeProgram = program
    }
    bind() {
      gl.useProgram(this.activeProgram)
    }
  }

  function hashCode(s) {
    let hash = 0
    for (let i = 0; i < s.length; i++) {
      hash = (hash << 5) - hash + s.charCodeAt(i)
      hash |= 0
    }
    return hash
  }

  const baseVertexShader = compileShader(gl.VERTEX_SHADER, BASE_VERTEX_SHADER)
  const manualFiltering = ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']

  const copyProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, COPY_SHADER))
  const clearProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, CLEAR_SHADER))
  const splatProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, SPLAT_SHADER))
  const advectionProgram = new Program(
    baseVertexShader,
    compileShader(gl.FRAGMENT_SHADER, ADVECTION_SHADER, manualFiltering)
  )
  const divergenceProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, DIVERGENCE_SHADER))
  const curlProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, CURL_SHADER))
  const vorticityProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, VORTICITY_SHADER))
  const pressureProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, PRESSURE_SHADER))
  const gradientSubtractProgram = new Program(
    baseVertexShader,
    compileShader(gl.FRAGMENT_SHADER, GRADIENT_SUBTRACT_SHADER)
  )
  const displayMaterial = new Material(baseVertexShader, DISPLAY_SHADER_SOURCE)

  // ————— quad plein écran —————

  function createQuad() {
    const quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
    const indices = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)
    buffers = [quad, indices]
  }

  createQuad()

  function blit(target, clear = false) {
    if (target == null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    } else {
      gl.viewport(0, 0, target.width, target.height)
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
    }
    if (clear) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  }

  // ————— framebuffers —————

  let dye, velocity, divergence, curl, pressure

  function getResolution(resolution) {
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight
    if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio
    const min = Math.round(resolution)
    const max = Math.round(resolution * aspectRatio)
    if (gl.drawingBufferWidth > gl.drawingBufferHeight) return { width: max, height: min }
    return { width: min, height: max }
  }

  function createFBO(w, h, internalFormat, format, type, param) {
    gl.activeTexture(gl.TEXTURE0)
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)

    const fbo = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    gl.viewport(0, 0, w, h)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const texelSizeX = 1.0 / w
    const texelSizeY = 1.0 / h
    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX,
      texelSizeY,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        return id
      },
      destroy() {
        gl.deleteFramebuffer(fbo)
        gl.deleteTexture(texture)
      },
    }
  }

  function createDoubleFBO(w, h, internalFormat, format, type, param) {
    let fbo1 = createFBO(w, h, internalFormat, format, type, param)
    let fbo2 = createFBO(w, h, internalFormat, format, type, param)
    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() {
        return fbo1
      },
      set read(value) {
        fbo1 = value
      },
      get write() {
        return fbo2
      },
      set write(value) {
        fbo2 = value
      },
      swap() {
        const temp = fbo1
        fbo1 = fbo2
        fbo2 = temp
      },
      destroy() {
        fbo1.destroy()
        fbo2.destroy()
      },
    }
  }

  function resizeFBO(target, w, h, internalFormat, format, type, param) {
    const newFBO = createFBO(w, h, internalFormat, format, type, param)
    copyProgram.bind()
    gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0))
    blit(newFBO)
    target.destroy() // l'original abandonnait l'ancienne texture (fuite)
    return newFBO
  }

  function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
    if (target.width === w && target.height === h) return target
    target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param)
    target.write.destroy()
    target.write = createFBO(w, h, internalFormat, format, type, param)
    target.width = w
    target.height = h
    target.texelSizeX = 1.0 / w
    target.texelSizeY = 1.0 / h
    return target
  }

  function initFramebuffers() {
    const simRes = getResolution(config.simResolution)
    const dyeRes = getResolution(config.dyeResolution)
    const texType = ext.halfFloatTexType
    const rgba = ext.formatRGBA
    const rg = ext.formatRG
    const r = ext.formatR
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST
    gl.disable(gl.BLEND)

    if (!dye) dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering)
    else dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering)

    if (!velocity)
      velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering)
    else
      velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering)

    // champs scalaires : recréés (et détruits proprement) à chaque resize
    if (divergence) divergence.destroy()
    divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST)
    if (curl) curl.destroy()
    curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST)
    if (pressure) pressure.destroy()
    pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST)
  }

  /** Re-calcule les FBOs seulement si la résolution cible a changé. */
  function syncSize() {
    const simRes = getResolution(config.simResolution)
    const dyeRes = getResolution(config.dyeResolution)
    if (
      dye &&
      dye.width === dyeRes.width &&
      dye.height === dyeRes.height &&
      velocity.width === simRes.width &&
      velocity.height === simRes.height
    ) {
      return
    }
    initFramebuffers()
  }

  function updateKeywords() {
    const displayKeywords = []
    if (config.shading) displayKeywords.push('SHADING')
    displayMaterial.setKeywords(displayKeywords)
  }

  updateKeywords()
  initFramebuffers()

  // ————— pas de simulation —————

  function step(dt) {
    gl.disable(gl.BLEND)

    curlProgram.bind()
    gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0))
    blit(curl)

    vorticityProgram.bind()
    gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0))
    gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1))
    gl.uniform1f(vorticityProgram.uniforms.curl, config.curl)
    gl.uniform1f(vorticityProgram.uniforms.dt, dt)
    blit(velocity.write)
    velocity.swap()

    divergenceProgram.bind()
    gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0))
    blit(divergence)

    clearProgram.bind()
    gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0))
    gl.uniform1f(clearProgram.uniforms.value, config.pressure)
    blit(pressure.write)
    pressure.swap()

    pressureProgram.bind()
    gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0))
    for (let i = 0; i < config.pressureIterations; i++) {
      gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1))
      blit(pressure.write)
      pressure.swap()
    }

    gradientSubtractProgram.bind()
    gl.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0))
    gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1))
    blit(velocity.write)
    velocity.swap()

    advectionProgram.bind()
    gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    if (!ext.supportLinearFiltering)
      gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY)
    const velocityId = velocity.read.attach(0)
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId)
    gl.uniform1i(advectionProgram.uniforms.uSource, velocityId)
    gl.uniform1f(advectionProgram.uniforms.dt, dt)
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.velocityDissipation)
    blit(velocity.write)
    velocity.swap()

    if (!ext.supportLinearFiltering)
      gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY)
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0))
    gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1))
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.densityDissipation)
    blit(dye.write)
    dye.swap()
  }

  // ————— rendu —————

  function render() {
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.BLEND)
    displayMaterial.bind()
    const width = gl.drawingBufferWidth
    const height = gl.drawingBufferHeight
    if (config.shading) gl.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height)
    gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0))
    blit(null)
  }

  /** Canvas entièrement transparent — arrêt propre, sans rémanence. */
  function clearDisplay() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.disable(gl.BLEND)
    gl.clearColor(0.0, 0.0, 0.0, 0.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  // ————— splats —————

  const scratch = { r: 0, g: 0, b: 0 }

  function correctRadius(radius) {
    const size = getCanvasSize()
    const aspectRatio = size.w / size.h
    if (aspectRatio > 1) radius *= aspectRatio
    return radius
  }

  function splat(x, y, dx, dy, color) {
    splatProgram.bind()
    const size = getCanvasSize()
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0))
    gl.uniform1f(splatProgram.uniforms.aspectRatio, size.w / size.h)
    gl.uniform2f(splatProgram.uniforms.point, x, y)
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0)
    gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.splatRadius / 100.0))
    blit(velocity.write)
    velocity.swap()

    gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0))
    gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b)
    blit(dye.write)
    dye.swap()
  }

  /** Éclaboussure au clic : plus chaude et impulsion aléatoire. */
  function clickBurst(x, y, color) {
    scratch.r = color.r * 10.0
    scratch.g = color.g * 10.0
    scratch.b = color.b * 10.0
    const dx = 10 * (Math.random() - 0.5)
    const dy = 30 * (Math.random() - 0.5)
    splat(x, y, dx, dy, scratch)
  }

  // ————— config & nettoyage —————

  /** Changement de palier qualité : resize les FBOs (le dye est conservé). */
  function applyConfig(next) {
    config = { ...config, ...next }
    updateKeywords()
    initFramebuffers()
  }

  function dispose() {
    if (dye) dye.destroy()
    if (velocity) velocity.destroy()
    if (divergence) divergence.destroy()
    if (curl) curl.destroy()
    if (pressure) pressure.destroy()
    dye = velocity = divergence = curl = pressure = null
    for (const p of programs) gl.deleteProgram(p)
    for (const s of shaders) gl.deleteShader(s)
    for (const b of buffers) gl.deleteBuffer(b)
    programs.length = 0
    shaders.length = 0
    buffers = []
  }

  return {
    step,
    render,
    clearDisplay,
    splat,
    clickBurst,
    syncSize,
    applyConfig,
    dispose,
    getStats() {
      return { dyeW: dye.width, dyeH: dye.height, simW: velocity.width, simH: velocity.height }
    },
  }
}
