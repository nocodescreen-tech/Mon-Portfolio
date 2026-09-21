// Initialisation WebGL — contexte, capacités, formats rendables.
// Ne JAMAIS lancer : toute défaillance retourne null et le site
// continue sans effet (fallback silencieux).

export function createGLContext(canvas) {
  try {
    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
      // Effet décoratif : on ne réveille pas le GPU dédié sur les
      // laptops bi-GPU (économie de batterie, l'adaptatif gère la suite).
      powerPreference: 'low-power',
    }
    let gl = canvas.getContext('webgl2', params)
    const isWebGL2 = !!gl
    if (!isWebGL2) {
      gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params)
    }
    if (!gl) return null

    let halfFloat = null
    let supportLinearFiltering = null
    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float')
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear')
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float')
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear')
    }
    const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat ? halfFloat.HALF_FLOAT_OES : null
    if (halfFloatTexType == null) return null

    let formatRGBA, formatRG, formatR
    if (isWebGL2) {
      formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType)
      formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType)
      formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType)
    } else {
      formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType)
      formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType)
      formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType)
    }
    // Half-float non rendable (vieux mobiles) → pas de simulation viable.
    if (!formatRGBA || !formatRG || !formatR) return null

    return {
      gl,
      ext: {
        formatRGBA,
        formatRG,
        formatR,
        halfFloatTexType,
        supportLinearFiltering: !!supportLinearFiltering,
      },
    }
  } catch {
    return null
  }
}

function getSupportedFormat(gl, internalFormat, format, type) {
  if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
    switch (internalFormat) {
      case gl.R16F:
        return getSupportedFormat(gl, gl.RG16F, gl.RG, type)
      case gl.RG16F:
        return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type)
      default:
        return null
    }
  }
  return { internalFormat, format }
}

function supportRenderTextureFormat(gl, internalFormat, format, type) {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null)
  const fbo = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
  // nettoie la sonde
  gl.deleteFramebuffer(fbo)
  gl.deleteTexture(texture)
  return status === gl.FRAMEBUFFER_COMPLETE
}

// Rendu logiciel (SwiftShader / llvmpipe) : la simulation y ruinerait le
// CPU → le preset initial sera plafonné à LOW, l'adaptatif peut ensuite
// couper l'effet si ça reste trop lent.
export function isSoftwareRenderer(gl) {
  try {
    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER))
    return /swiftshader|llvmpipe|software|basic/i.test(renderer)
  } catch {
    return false
  }
}
