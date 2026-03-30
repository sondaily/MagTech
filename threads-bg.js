/**
 * Threads Background — Vanilla WebGL
 * 直接移植自 React/OGL 版本，无任何框架依赖
 * 用法：在 HTML 中直接 <script src="threads-bg.js"></script>
 */
(function () {
    const vertexShader = `
attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

    const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 40;
const float u_line_width = 7.0;
const float u_line_blur = 10.0;

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );

    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0,
        1.0
    );
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv,
            u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
            p,
            (PI * 1.0) * p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));
    }
    float colorVal = 1.0 - line_strength;
    gl_FragColor = vec4(uColor * colorVal, colorVal * 0.85);
}
`;

    function initThreadsBG(opts) {
        opts = Object.assign({
            color: [0.4, 0.6, 1.0],   // 蓝紫色调，与网站主色系匹配
            amplitude: 1.2,
            distance: 0,
            enableMouseInteraction: true
        }, opts || {});

        // 创建 canvas 并固定在最底层
        const canvas = document.createElement('canvas');
        Object.assign(canvas.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '0',          // 提升至 3D canvas (z-index:1) 之下
            pointerEvents: 'none',
            opacity: '0.85'       // 提升不透明度
        });
        document.body.insertBefore(canvas, document.body.firstChild);

        const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
        if (!gl) { console.warn('[Threads] WebGL not supported'); return; }

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // 编译 shader
        function compile(type, src) {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
                console.error('[Threads] Shader error:', gl.getShaderInfoLog(s));
            return s;
        }
        const prog = gl.createProgram();
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertexShader));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragmentShader));
        gl.linkProgram(prog);
        gl.useProgram(prog);

        // 全屏三角形 (覆盖 NDC 空间)
        const vbuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const posLoc = gl.getAttribLocation(prog, 'position');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        // Uniform 位置
        const uTime = gl.getUniformLocation(prog, 'iTime');
        const uRes = gl.getUniformLocation(prog, 'iResolution');
        const uColor = gl.getUniformLocation(prog, 'uColor');
        const uAmplitude = gl.getUniformLocation(prog, 'uAmplitude');
        const uDistance = gl.getUniformLocation(prog, 'uDistance');
        const uMouse = gl.getUniformLocation(prog, 'uMouse');

        gl.uniform3fv(uColor, opts.color);
        gl.uniform1f(uAmplitude, opts.amplitude);
        gl.uniform1f(uDistance, opts.distance);
        gl.uniform2fv(uMouse, [0.5, 0.5]);

        // resize
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform3fv(uRes, [canvas.width, canvas.height, canvas.width / canvas.height]);
        }
        window.addEventListener('resize', resize);
        resize();

        // 鼠标
        let currentMouse = [0.5, 0.5];
        let targetMouse = [0.5, 0.5];

        if (opts.enableMouseInteraction) {
            document.addEventListener('mousemove', e => {
                targetMouse = [
                    e.clientX / window.innerWidth,
                    1.0 - e.clientY / window.innerHeight
                ];
            });
            document.addEventListener('mouseleave', () => {
                targetMouse = [0.5, 0.5];
            });
        }

        // 渲染循环
        function loop(t) {
            const sm = 0.05;
            currentMouse[0] += sm * (targetMouse[0] - currentMouse[0]);
            currentMouse[1] += sm * (targetMouse[1] - currentMouse[1]);
            gl.uniform2fv(uMouse, currentMouse);
            gl.uniform1f(uTime, t * 0.001);

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    // DOM ready 后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initThreadsBG());
    } else {
        initThreadsBG();
    }
})();
