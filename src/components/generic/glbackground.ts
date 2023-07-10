export class WebGLBackground {
  draw: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    baseColor: [number, number, number],
    accentColor: [number, number, number],
    spacing: number,
    radius: number
  ) {
    const gl = canvas.getContext("webgl2")!;
    if (!gl) {
      throw new Error("Could not get webgl2 context");
    }
    const vao = gl.createVertexArray()!;
    const positionBuffer = gl.createBuffer()!;

    // shaders
    const program = createProgramFromSources(gl, this.vss, this.fss);

    // uniforms
    const uBaseColorLoc = gl.getUniformLocation(program, "u_basecolor");
    const uAccentColorLoc = gl.getUniformLocation(program, "u_accentcolor");
    const uSpacing = gl.getUniformLocation(program, "u_spacing");
    const uRadius = gl.getUniformLocation(program, "u_radius");

    // attributes
    const aPositionLoc = gl.getAttribLocation(program, "a_position");
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.quad, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    gl.uniform3fv(uBaseColorLoc, baseColor);
    gl.uniform3fv(uAccentColorLoc, accentColor);
    gl.uniform1f(uSpacing, spacing);
    gl.uniform1f(uRadius, radius);

    addEventListener("resize", () => this.draw());

    this.draw = () => {
      gl.canvas.width = canvas.clientWidth;
      gl.canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    this.draw();
  }

  readonly vss = `#version 300 es
  in vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
  `;

  readonly fss = `#version 300 es
  precision highp float;

  uniform float u_spacing;
  uniform float u_radius;
  uniform vec3 u_basecolor;
  uniform vec3 u_accentcolor;

  out vec4 color;

  void main() {
    vec2 uv = fract(gl_FragCoord.xy / u_spacing) - 0.5;
    color = vec4(length(uv) > u_radius ? u_basecolor : u_accentcolor, 1.0);
  }
  `;

  // prettier-ignore
  quad = new Float32Array([
    -1, -1, // first triangle
     1, -1,
    -1,  1,

    -1,  1, // second triangle
     1, -1,
     1,  1,
  ]);
}

// utils

function createProgramFromSources(
  gl: WebGL2RenderingContext,
  vss: string,
  fss: string
) {
  const program = gl.createProgram()!;

  const compileShader = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      console.log(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    }
    return shader;
  };

  const linkShaders = (shaders: WebGLShader[]) => {
    shaders.forEach((shader) => gl.attachShader(program, shader));
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      console.log(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
    }
  };

  const vertexShader = compileShader(gl.VERTEX_SHADER, vss);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fss);
  linkShaders([vertexShader, fragmentShader]);
  return program;
}
