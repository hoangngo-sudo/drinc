/**
 * Liquid metal footer wordmark.
 */
import { ShaderMount } from "../vendor/paper-shaders/shader-mount.js";
import { ShaderFitOptions } from "../vendor/paper-shaders/shader-sizing.js";
import { getShaderColorFromString } from "../vendor/paper-shaders/get-shader-color-from-string.js";
import {
  LiquidMetalShapes,
  liquidMetalFragmentShader,
  toProcessedLiquidMetal,
} from "../vendor/paper-shaders/shaders/liquid-metal.js";

const TEXTURE_URL = new URL("../assets/img/wordmark-metal.webp", import.meta.url).href;

const figure = document.querySelector(".cta__wordmark");
const container = figure ? figure.querySelector("[data-wordmark-shader]") : null;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let mount = null;

/* The shader only animates over the part of the wordmark that survives the
   mask fade, so there is no reason to pay for it before the footer is close. */
function whenApproachingViewport(callback) {
  if (!("IntersectionObserver" in window)) {
    callback();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      callback();
    },
    { rootMargin: "400px 0px" },
  );

  observer.observe(figure);
}

function supportsWebGL2() {
  const probe = document.createElement("canvas");
  const gl = probe.getContext("webgl2");
  if (!gl) return false;
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return true;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });
}

/* Uniforms and sizing mirror the LiquidMetal layer from design file. */
function createUniforms(image) {
  return {
    u_colorBack: getShaderColorFromString("#00000000"),
    u_colorTint: getShaderColorFromString("#FFFFFF"),

    u_image: image,
    u_isImage: true,

    u_repetition: 1.5,
    u_softness: 0.05,
    u_shiftRed: 0,
    u_shiftBlue: 0,
    u_distortion: 0.2,
    u_contour: 0.4,
    u_angle: -260,
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
  let textureUrl;

  try {
    const { pngBlob } = await toProcessedLiquidMetal(TEXTURE_URL);
    textureUrl = URL.createObjectURL(pngBlob);
    const image = await loadImage(textureUrl);

    figure.classList.add("is-shader");
    mount = new ShaderMount(
      container,
      liquidMetalFragmentShader,
      createUniforms(image),
      undefined,
      reducedMotion.matches ? 0 : 1,
      0,
      2,
      undefined,
      ["u_image"],
    );
  } catch (error) {
    figure.classList.remove("is-shader");
    console.warn("Footer shader unavailable, showing the static wordmark.", error);
  } finally {
    if (textureUrl) URL.revokeObjectURL(textureUrl);
  }
}

if (figure && container && supportsWebGL2()) {
  whenApproachingViewport(() => {
    renderWordmark();
    reducedMotion.addEventListener("change", (event) => {
      mount?.setSpeed(event.matches ? 0 : 1);
    });
  });
}
