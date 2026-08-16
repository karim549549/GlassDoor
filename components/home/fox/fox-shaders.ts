/**
 * GLSL for the section 3 fox.
 *
 * Lifted out of FoxBackground.tsx, where these two strings were 195 of 497
 * lines - the file read as a shader with a React component appended. They are
 * static (no template interpolation), so nothing is lost by moving them and
 * the component is left with the part that actually touches the DOM.
 */

export const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uArt;
  uniform vec2  uScale;
  uniform float uProgress;
  uniform float uTime;
  uniform float uAdditive;
  uniform vec2  uTextCenter;
  uniform vec2  uTextRadius;
  uniform float uTextDim;
  uniform vec2  uPointer;
  uniform float uPointerAmt;
  uniform float uAspect;
  uniform vec3  uHot;

  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      v += amp * noise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    // Map screen space onto the artwork, preserving its aspect.
    vec2 art = (vUv - 0.5) * uScale + 0.5;
    if (art.x < 0.0 || art.x > 1.0 || art.y < 0.0 || art.y > 1.0) {
      gl_FragColor = vec4(0.0);
      return;
    }

    // Legibility pocket.
    //
    // The statement sits directly on top of the brightest part of the fire, and
    // bright high-contrast lines behind serif italics are unreadable. Rather
    // than dimming the whole fox - which costs the effect everywhere to fix one
    // region - the artwork is pushed OUT OF FOCUS behind the text and darkened
    // only slightly. Defocused light stays bright and colourful but stops
    // competing for the eye, and because the falloff is wide and elliptical
    // there is no visible panel edge: it reads as depth of field, not a scrim.
    //
    // Measured in screen space, not artwork space, because the text is
    // positioned against the viewport.
    // The falloff window matters as much as the radius: ending it at 1.5 means
    // full brightness returns near the frame edges. An earlier 0.72-1.35 window
    // on a wider ellipse only recovered past the edge of the screen, which
    // dimmed the fox everywhere and defeated the point.
    vec2  td = (vUv - uTextCenter) / uTextRadius;
    float clear = smoothstep(0.9, 1.5, length(td));   // 0 behind text, 1 outside

    vec4 sharp = texture2D(uArt, art);
    vec4 soft  = texture2D(uArt, art, 3.4);
    vec4 tex   = mix(soft, sharp, clear);

    // Lossy WebP leaves invented colour in fully transparent pixels - measured
    // up to rgb(117,46,6) here - because alpha 0 makes RGB a don't-care to the
    // encoder. Additive blending adds RGB regardless of alpha, so that garbage
    // became an orange haze over the entire section. Zeroing RGB at encode time
    // does not survive the re-encode, so the gate has to live here. The
    // threshold is low enough to keep the faintest real glow.
    vec3 plate = tex.rgb * smoothstep(0.0, 0.03, tex.a);
    float lum = dot(plate, vec3(0.299, 0.587, 0.114));

    // Cheap two-radius bloom, gated the same way for the same reason.
    vec4 b1 = texture2D(uArt, art, 2.6);
    vec4 b2 = texture2D(uArt, art, 5.2);
    vec3 bloom = b1.rgb * smoothstep(0.0, 0.03, b1.a) * 0.30
               + b2.rgb * smoothstep(0.0, 0.03, b2.a) * 0.42;

    // Ignition spreads outward from the head, so the body lights first and the
    // tails unfurl last. Noise breaks up the ring so it never reads as a wipe.
    vec2  origin = vec2(0.30, 0.80);
    float order  = clamp(distance(art, origin) / 1.15, 0.0, 1.0);
    order += (fbm(art * 4.0) - 0.5) * 0.20;

    float reveal = smoothstep(order - 0.06, order + 0.06, uProgress);
    float front  = smoothstep(0.09, 0.0, abs(uProgress - order));

    // Cursor heat.
    //
    // A modifier, never a gate: it only intensifies fire that is already there,
    // so it cannot light the empty field. That matters twice over - the section
    // background has to stay visible through this layer, and a pointer halo
    // that glowed on its own would put back the background wash we just spent
    // effort removing.
    //
    // Aspect-corrected so the halo is round rather than stretched with the
    // viewport, and it reads 0 on touch devices where no pointer is reported.
    vec2  pd = (vUv - uPointer) * vec2(uAspect, 1.0);
    float heat = uPointerAmt * exp(-dot(pd, pd) * 14.0);

    // Gentle, because the plate already carries its own variation. This only
    // keeps it from sitting perfectly still.
    float burn = 0.82 + 0.30 * fbm(art * 5.0 + vec2(uTime * 0.03, -uTime * 0.022));
    burn += heat * 0.55;

    vec3 col = plate * burn + bloom;

    // A light sparkle pass on top of the sparks already in the artwork.
    //
    // Rewritten from a version that translated the whole grid by
    // floor(uTime * 6) each frame: that moved every spark in lockstep, which
    // read as the field sliding rather than embers glinting, and it snapped
    // between integer positions instead of transitioning. Sparks now stay put
    // and twinkle, each on its own phase and speed.
    //
    // Grid coordinates are in artwork space, so the sparks are anchored to the
    // fox and travel with it rather than floating over the screen.
    vec2  gv  = art * vec2(300.0, 225.0);
    vec2  id  = floor(gv);
    vec2  f   = fract(gv) - 0.5;
    float rnd = hash21(id);

    // Only a minority of cells ever hold a spark - more of them near the
    // cursor, so the fire visibly answers the hand.
    float has = step(0.93 - heat * 0.11, rnd);

    // Per-cell phase offset and speed. Without both, every spark peaks on the
    // same frame and the whole field pulses as one.
    float ph = fract(rnd * 41.7 + uTime * (0.18 + rnd * 0.42));
    float tw = smoothstep(0.0, 0.35, ph) * smoothstep(1.0, 0.55, ph);

    // Round core plus a cross flare - a star, not the square that a cell-wide
    // step() produces. The flare is deliberately thin on its short axis.
    float d     = length(f);
    float core  = smoothstep(0.32, 0.0, d);
    float flare = smoothstep(0.34, 0.0, abs(f.x)) * smoothstep(0.07, 0.0, abs(f.y))
                + smoothstep(0.34, 0.0, abs(f.y)) * smoothstep(0.07, 0.0, abs(f.x));

    // Faded in against local brightness rather than hard-gated, so sparks do
    // not pop into existence at the edge of a stroke.
    float spark = has * tw * (core + flare * 0.55) * smoothstep(0.05, 0.20, lum);
    col += uHot * spark * (1.8 + heat * 1.5);

    // The ignition edge burns brighter than the settled fire behind it.
    col += uHot * front * lum * 1.8;

    // Applied last so it also tames the bloom, the sparkles and the ignition
    // front - those are the brightest things on screen and the worst offenders
    // for legibility.
    col *= mix(uTextDim, 1.0, clear);

    // Output alpha is canvas COVERAGE, never the blend weight.
    //
    // This distinction caused a bug worth recording. Additive blending wants
    // RGB added at full strength, so an earlier version wrote alpha = 1 to stop
    // the glow being attenuated twice. But the canvas alpha channel is also
    // what composites this layer over the page - writing 1 everywhere made the
    // whole quad opaque, so every pixel without fire in it painted solid black
    // over the section background. The blend strength and the canvas coverage
    // are different quantities and cannot share one value.
    //
    // Resolved in the material instead: RGB is added with OneFactor (full
    // strength, independent of alpha), while alpha accumulates as real
    // coverage. So this can now report honestly how much light is here.
    // Additive: coverage is how much light this pixel emits, so bloom and
    // sparkles carry their own alpha and the empty field stays transparent.
    // Normal: the plate's own alpha is already the right answer.
    float emitted = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
    float coverage = mix(tex.a, emitted, uAdditive);

    gl_FragColor = vec4(col * reveal, coverage * reveal);
  }
`;
