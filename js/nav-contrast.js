/* Nav contrast guardrail.
   The site nav is fixed and transparent, so the CTA pill floats over whatever
   scrolls under it: white cards, a beige band, photos, the dark hero. A white
   label is invisible on the light ones, so we measure the paint behind the pill
   and flip the pill's tokens:
     light backdrop -> ink label + dark ring
     dark backdrop  -> white label + white ring

   Two surfaces cannot be measured and declare their tone instead with
   data-nav-tone="dark": .hero and .banner both paint a gradient scrim over a
   photo, and a sampled photo pixel would ignore the scrim. */
(function () {
  "use strict";

  var nav = document.querySelector(".site-nav");
  if (!nav) return;

  var cta = nav.querySelector(".site-nav__cta");
  if (!cta) return;

  /* White and --ink give the same contrast where 1.05 / (L + 0.05) equals
     (L + 0.05) / 0.0567, i.e. at luminance 0.194. That crossing is the natural
     middle of the dead band: the label only turns dark above LIGHT_ON_ABOVE and
     only turns light again below LIGHT_OFF_BELOW, so a backdrop sitting near the
     crossing cannot chatter. */
  var LIGHT_ON_ABOVE = 0.24;
  var LIGHT_OFF_BELOW = 0.15;

  /* Two measured frames must agree before the tone changes. That absorbs the noise
     of a photo sweeping past in about one frame, where a time-based dwell used to
     add 120ms of lag to every single change. */
  var TONE_CONFIRM_FRAMES = 2;

  /* Only needed when a single sparse event arrives: a lone resize, or the tail of
     momentum scrolling on a phone. */
  var CONFIRM_RETRY_MS = 40;

  /* Pixels per side when an image is sampled. Small on purpose: the pill is a few
     hundred pixels wide at most, so 16x16 is plenty of resolution. */
  var GRID = 16;

  /* img element -> Float32Array of linear RGB triplets, or null if the canvas came
     back tainted. Built once per image, then scrolling only does arithmetic. */
  var imageGrids = new WeakMap();

  function channelToLinear(value) {
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  }

  function luminanceOf(channels) {
    return 0.2126 * channels.red + 0.7152 * channels.green + 0.0722 * channels.blue;
  }

  function clamp(value, minimum, maximum) {
    if (value < minimum) return minimum;
    if (value > maximum) return maximum;
    return value;
  }

  /* getComputedStyle always hands back rgb() or rgba(), never a hex or a named
     colour, so a number scrape is enough. */
  function parseColor(css) {
    var numbers = css.match(/[\d.]+/g);
    if (!numbers || numbers.length < 3) return null;

    var red = Number(numbers[0]);
    var green = Number(numbers[1]);
    var blue = Number(numbers[2]);
    var alpha = numbers.length > 3 ? Number(numbers[3]) : 1;

    return {
      red: channelToLinear(red / 255),
      green: channelToLinear(green / 255),
      blue: channelToLinear(blue / 255),
      alpha: alpha
    };
  }

  /* A layer painted under another layer: source-over, done from the bottom up. */
  function paintUnder(top, layer) {
    var alphaOut = top.alpha + layer.alpha * (1 - top.alpha);
    if (alphaOut === 0) return { red: 0, green: 0, blue: 0, alpha: 0 };

    return {
      red: (top.red * top.alpha + layer.red * layer.alpha * (1 - top.alpha)) / alphaOut,
      green: (top.green * top.alpha + layer.green * layer.alpha * (1 - top.alpha)) / alphaOut,
      blue: (top.blue * top.alpha + layer.blue * layer.alpha * (1 - top.alpha)) / alphaOut,
      alpha: alphaOut
    };
  }

  function imageGrid(image) {
    if (imageGrids.has(image)) return imageGrids.get(image);
    if (!image.complete || image.naturalWidth === 0) return null; // retry on a later frame

    var grid = null;
    try {
      var canvas = document.createElement("canvas");
      canvas.width = GRID;
      canvas.height = GRID;

      var context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0, GRID, GRID);

      var pixels = context.getImageData(0, 0, GRID, GRID).data;
      grid = new Float32Array(GRID * GRID * 3);
      for (var index = 0; index < GRID * GRID; index++) {
        grid[index * 3] = channelToLinear(pixels[index * 4] / 255);
        grid[index * 3 + 1] = channelToLinear(pixels[index * 4 + 1] / 255);
        grid[index * 3 + 2] = channelToLinear(pixels[index * 4 + 2] / 255);
      }
    } catch (error) {
      grid = null; // cross-origin image, the canvas would be tainted
    }

    imageGrids.set(image, grid);
    return grid;
  }

  /* object-fit scales the image until it fills or fits the box and crops or
     letterboxes the rest, so map the point on screen through the same scale. */
  function imageColorAt(image, pointX, pointY) {
    var grid = imageGrid(image);
    if (!grid) return null;

    var box = image.getBoundingClientRect();
    var naturalWidth = image.naturalWidth;
    var naturalHeight = image.naturalHeight;

    var scale = getComputedStyle(image).objectFit === "contain"
      ? Math.min(box.width / naturalWidth, box.height / naturalHeight)
      : Math.max(box.width / naturalWidth, box.height / naturalHeight);

    var offsetX = (box.width - naturalWidth * scale) / 2;
    var offsetY = (box.height - naturalHeight * scale) / 2;

    var column = clamp(Math.floor(((pointX - box.left - offsetX) / scale / naturalWidth) * GRID), 0, GRID - 1);
    var row = clamp(Math.floor(((pointY - box.top - offsetY) / scale / naturalHeight) * GRID), 0, GRID - 1);

    var offset = (row * GRID + column) * 3;
    return { red: grid[offset], green: grid[offset + 1], blue: grid[offset + 2], alpha: 1 };
  }

  /* Walk the paint under the pill from the top down, compositing translucent
     layers, and stop as soon as the stack is opaque. Returns null when the answer
     is not knowable, which leaves the current tone alone. */
  function backdropLuminance(pointX, pointY) {
    var stack = document.elementsFromPoint(pointX, pointY);
    var top = { red: 0, green: 0, blue: 0, alpha: 0 };

    for (var index = 0; index < stack.length; index++) {
      var element = stack[index];
      if (nav.contains(element)) continue;

      var declared = element.closest("[data-nav-tone]");
      if (declared) return declared.getAttribute("data-nav-tone") === "dark" ? 0 : 1;

      if (element.tagName === "IMG") {
        var sampled = imageColorAt(element, pointX, pointY);
        if (!sampled) return null;
        top = paintUnder(top, sampled);
      } else {
        var style = getComputedStyle(element);

        /* A background-image layer is either a gradient or an image we cannot map
           without redoing background-size and background-position by hand. */
        if (style.backgroundImage !== "none") return null;

        var colour = parseColor(style.backgroundColor);
        if (!colour) return null;
        top = paintUnder(top, colour);
      }

      if (top.alpha > 0.999) return luminanceOf(top);
    }

    /* Nothing in the stack was opaque, so whatever is left sits on the page. */
    top = paintUnder(top, parseColor(getComputedStyle(document.body).backgroundColor) || { red: 1, green: 1, blue: 1, alpha: 1 });
    return luminanceOf(top);
  }

  var appliedTone = null;
  var candidateTone = null;
  var candidateFrames = 0;
  var queued = false;
  var retryScheduled = false;

  function applyTone(tone) {
    appliedTone = tone;
    candidateTone = null;
    candidateFrames = 0;
    nav.classList.toggle("is-over-light", tone === "light");
  }

  function scheduleRetry() {
    if (retryScheduled) return;
    retryScheduled = true;
    window.setTimeout(function () {
      retryScheduled = false;
      requestMeasure();
    }, CONFIRM_RETRY_MS);
  }

  function measure() {
    var box = cta.getBoundingClientRect();
    var value = backdropLuminance(box.left + box.width / 2, box.top + box.height / 2);

    if (value === null) {
      candidateTone = null;
      candidateFrames = 0;
      return;
    }

    var tone;
    if (appliedTone === "light") {
      tone = value < LIGHT_OFF_BELOW ? "dark" : "light";
    } else {
      tone = value > LIGHT_ON_ABOVE ? "light" : "dark";
    }

    /* The first measurement has no earlier tone to flicker against, so apply it
       straight away instead of waiting for a confirmation frame. */
    if (appliedTone === null) {
      applyTone(tone);
      return;
    }

    if (tone === appliedTone) {
      candidateTone = null;
      candidateFrames = 0;
      return;
    }

    if (tone === candidateTone) {
      candidateFrames++;
    } else {
      candidateTone = tone;
      candidateFrames = 1;
    }

    if (candidateFrames < TONE_CONFIRM_FRAMES) {
      scheduleRetry();
      return;
    }

    applyTone(tone);
  }

  function requestMeasure() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      measure();
    });
  }

  window.addEventListener("scroll", requestMeasure, { passive: true });
  window.addEventListener("resize", requestMeasure);
  requestMeasure();
})();
