import {
  wavesFragmentShader,
  wavesVertexShader,
} from "../components/ChromaticWaves";

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Renders one static frame of the ChromaticWaves dot grid into an offscreen
 * canvas. The live background canvas cannot be read back (no
 * preserveDrawingBuffer), so the share export re-renders the same shader at
 * the export size instead. Returns null when WebGL2 is unavailable — the
 * export backdrop then falls back to its plain gradients alone.
 */
export function renderWavesBackgroundCanvas(
  width: number,
  height: number,
  time = 4.2,
): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
  });
  if (!gl) return null;

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, wavesVertexShader);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, wavesFragmentShader);
  const program = gl.createProgram();
  if (!vertexShader || !fragmentShader || !program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

  // The vertex shader reads `position` and `uv`; the ogl Plane geometry feeds
  // both, so the offscreen quad does the same.
  const quad = new Float32Array([
    // position.xy, uv.xy
    -1, -1, 0, 0,
    1, -1, 1, 0,
    -1, 1, 0, 1,
    1, 1, 1, 1,
  ]);
  const buffer = gl.createBuffer();
  if (!buffer) return null;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

  const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
  const positionLocation = gl.getAttribLocation(program, "position");
  const uvLocation = gl.getAttribLocation(program, "uv");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(uvLocation);
  gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);

  gl.useProgram(program);
  gl.viewport(0, 0, width, height);
  gl.uniform1f(gl.getUniformLocation(program, "uTime"), time);
  gl.uniform2f(gl.getUniformLocation(program, "uResolution"), width, height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Copy the frame onto a plain 2D canvas and let the WebGL one go. Returning
  // the live WebGL canvas would pin its context for the page's lifetime, and a
  // context loss would silently blank the export backdrop; a 2D snapshot holds
  // the pixels outright.
  const snapshot = document.createElement("canvas");
  snapshot.width = width;
  snapshot.height = height;
  const context = snapshot.getContext("2d");
  if (context) context.drawImage(canvas, 0, 0);

  gl.deleteBuffer(buffer);
  gl.deleteProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return context ? snapshot : null;
}
