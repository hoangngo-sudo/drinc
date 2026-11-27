/**
 * Liquid metal footer wordmark.
 */
import { ShaderMount } from "../vendor/paper-shaders/shader-mount.js";
import { ShaderFitOptions } from "../vendor/paper-shaders/shader-sizing.js";
import { getShaderColorFromString } from "../vendor/paper-shaders/get-shader-color-from-string.js";
import {
  LiquidMetalShapes,
  liquidMetalFragmentShader,
} from "../vendor/paper-shaders/shaders/liquid-metal.js";

// Regenerate the precomputed texture when wordmark-rounded-trimmed.webp changes.
const TEXTURE_URL = new URL("../assets/img/wordmark-rounded-processed.webp", import.meta.url).href;
// Keep the metallic pattern sharp on short mobile canvases without exceeding the pixel cap.
const MIN_PIXEL_RATIO = 6;
const MAX_PIXEL_COUNT = 1920 * 1080;

const figure = document.querySelector(".cta__wordmark");
const container = figure ? figure.querySelector("[data-wordmark-shader]") : null;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let mount = null;

// The first trigger wins: an approaching footer or a post-load warm-up.
let started = false;
let approachObserver = null;

function startOnce(callback) {
  if (started) return;
  started = true;
  approachObserver?.disconnect();
  callback();
}

function onApproach(callback) {
  if (!("IntersectionObserver" in window)) {
    startOnce(callback);
    return;
  }

  approachObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) startOnce(callback);
    },
    { rootMargin: "400px 0px" },
  );

  approachObserver.observe(figure);
}

function onIdleAfterLoad(callback) {
  const warmUp = () => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => startOnce(callback), { timeout: 2000 });
    } else {
      startOnce(callback);
    }
  };

  if (document.readyState === "complete") warmUp();
  else window.addEventListener("load", warmUp, { once: true });
}

/* Deliberately does not open a probe context: creating one and immediately
   losing it is a known way to upset constrained mobile GPUs, and ShaderMount
   throws when it cannot get a real context, which the caller already handles. */
function supportsWebGL2() {
  return typeof WebGL2RenderingContext !== "undefined";
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });
}

/* Uniforms and sizing for the LiquidMetal layer, using the library defaults:
   Default preset values with shape "none" and scale 1. */
function createUniforms(image) {
  return {
    u_colorBack: getShaderColorFromString("#00000000"),
    u_colorTint: getShaderColorFromString("#FFFFFF"),

    u_image: image,
    u_isImage: true,

    u_repetition: 2,
    u_softness: 0.1,
    u_shiftRed: 0.3,
    u_shiftBlue: 0.3,
    u_distortion: 0.07,
    u_contour: 0.4,
    u_angle: 70,
    u_shape: LiquidMetalShapes.none,

    u_fit: ShaderFitOptions.contain,
    u_scale: 1,
    u_rotation: 0,
    u_offsetX: 0,
    u_offsetY: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_worldWidth: 0,
    u_worldHeight: 0,
  };
}

async function renderWordmark() {
  try {
    const image = await loadImage(TEXTURE_URL);

    figure.classList.add("is-shader");
    mount = new ShaderMount(
      container,
      liquidMetalFragmentShader,
      createUniforms(image),
      undefined, // WebGL context attributes
      reducedMotion.matches ? 0 : 1, // speed; 0 stops the render loop entirely
      0, // frame
      MIN_PIXEL_RATIO,
      MAX_PIXEL_COUNT,
      ["u_image"], // uniforms that need mipmaps
    );
  } catch (error) {
    figure.classList.remove("is-shader");
    console.warn("Footer shader unavailable, showing the static wordmark.", error);
  }
}

if (figure && container && supportsWebGL2()) {
  const start = () => {
    renderWordmark();
    reducedMotion.addEventListener("change", (event) => {
      mount?.setSpeed(event.matches ? 0 : 1);
    });
  };

  onApproach(start);
  onIdleAfterLoad(start);
}
