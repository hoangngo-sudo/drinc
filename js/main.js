(function () {
  "use strict";

  var nav = document.querySelector(".site-nav");
  if (nav) {
    var onNavScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onNavScroll, { passive: true });
    onNavScroll();
  }

  var video = document.querySelector("[data-video]");
  var playBtn = document.querySelector("[data-video-play]");
  var muteBtn = document.querySelector("[data-video-mute]");
  var volumeSlider = document.querySelector("[data-video-volume]");
  var timeDisplay = document.querySelector("[data-video-time]");

  if (video) {
    video.volume = 1;
    video.muted = true;
    if (volumeSlider) {
      volumeSlider.dataset.prevVol = "1";
      volumeSlider.value = "0";
    }
  }

  /* SVG templates */
  var SVG_PAUSE = '<svg class="video-bar__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 3.75C2 2.78334 2.78393 2 3.75 2H5.25C6.21607 2 7 2.78334 7 3.75V14.25C7 15.2167 6.21607 16 5.25 16H3.75C2.78393 16 2 15.2167 2 14.25V3.75Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11 3.75C11 2.78334 11.7839 2 12.75 2H14.25C15.2161 2 16 2.78334 16 3.75V14.25C16 15.2167 15.2161 16 14.25 16H12.75C11.7839 16 11 15.2167 11 14.25V3.75Z" fill="currentColor"/></svg>';
  var SVG_PLAY = '<svg class="video-bar__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M15.1 7.478L5.608 2.222C5.055 1.916 4.402 1.925 3.859 2.245C3.321 2.562 3 3.122 3 3.744V14.256C3 14.878 3.321 15.438 3.859 15.755C4.138 15.919 4.445 16.002 4.754 16.002C5.047 16.002 5.34 15.927 5.608 15.779L15.099 10.523C15.655 10.216 16 9.632 16 9.001C16 8.37 15.655 7.785 15.1 7.478Z" fill="currentColor"/></svg>';
  var SVG_MUTED = '<svg class="video-bar__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M14.5 4.41963V2.664C14.5 1.67539 13.4072 1.07941 12.5759 1.61119L7.28056 5H3.75C2.50779 5 1.5 6.00778 1.5 7.25V10.75C1.5 11.9922 2.50779 13 3.75 13H5.60184L14.5 4.41963Z" fill="currentColor" fill-opacity="0.4"/><path d="M14.5 7.54529L8.21976 13.6012L12.5759 16.3898C13.4072 16.9216 14.5 16.3256 14.5 15.337V7.54529Z" fill="currentColor" fill-opacity="0.4"/><path fill-rule="evenodd" clip-rule="evenodd" d="M17.2899 1.7294C17.5774 2.02757 17.5688 2.50236 17.2706 2.78988L3.2706 16.2899C2.97243 16.5774 2.49764 16.5688 2.21012 16.2706C1.9226 15.9724 1.93123 15.4976 2.2294 15.2101L16.2294 1.71012C16.5276 1.4226 17.0024 1.43123 17.2899 1.7294Z" fill="currentColor"/></svg>';
  var SVG_UNMUTED = '<svg class="video-bar__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.0759 1.61119C10.9072 1.07941 12 1.67539 12 2.664V15.337C12 16.3256 10.9072 16.9216 10.0759 16.3898L4.78051 13H2.25C1.00779 13 0 11.9922 0 10.75V7.25C0 6.00778 1.00779 5 2.25 5H4.78056L10.0759 1.61119Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M15.3287 5.11066C15.6216 4.81777 16.0964 4.81777 16.3893 5.11066C18.5372 7.25855 18.5372 10.7414 16.3893 12.8893C16.0964 13.1822 15.6216 13.1822 15.3287 12.8893C15.0358 12.5964 15.0358 12.1215 15.3287 11.8287C16.8908 10.2665 16.8908 7.73343 15.3287 6.17132C15.0358 5.87843 15.0358 5.40355 15.3287 5.11066Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M13.9454 7.17258C14.2615 7.07665 14.6031 7.19882 14.7867 7.47344C15.403 8.39538 15.403 9.60456 14.7867 10.5265C14.6031 10.8011 14.2615 10.9233 13.9454 10.8274C13.6293 10.7314 13.4132 10.44 13.4132 10.1097V7.89026C13.4132 7.55993 13.6293 7.2685 13.9454 7.17258Z" fill="currentColor"/></svg>';

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function updateTime() {
    if (!video || !timeDisplay) return;
    var cur = formatTime(video.currentTime);
    var dur = formatTime(video.duration);
    timeDisplay.textContent = cur + " / " + dur;
  }

  /* --- Play/pause --- */
  if (video && playBtn) {
    function togglePlay() {
      if (video.paused) {
        video.play();
        playBtn.setAttribute("aria-label", "Pause video");
        playBtn.innerHTML = SVG_PAUSE;
      } else {
        video.pause();
        playBtn.setAttribute("aria-label", "Play video");
        playBtn.innerHTML = SVG_PLAY;
      }
    }
    playBtn.addEventListener("click", togglePlay);
    video.addEventListener("play", function () {
      playBtn.setAttribute("aria-label", "Pause video");
      playBtn.innerHTML = SVG_PAUSE;
    });
    video.addEventListener("pause", function () {
      playBtn.setAttribute("aria-label", "Play video");
      playBtn.innerHTML = SVG_PLAY;
    });
    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateTime);
  }

  /* --- Mute/unmute --- */
  if (video && muteBtn) {
    function syncMute() {
      muteBtn.setAttribute("aria-label", video.muted ? "Unmute video" : "Mute video");
      muteBtn.innerHTML = video.muted ? SVG_MUTED : SVG_UNMUTED;
    }
    muteBtn.addEventListener("click", function () {
      if (video.muted) {
        /* Unmute: restore the last set volume and re-play with audio */
        video.muted = false;
        if (volumeSlider) {
          volumeSlider.value = volumeSlider.dataset.prevVol || "1";
          video.volume = parseFloat(volumeSlider.value);
        }
        video.play()["catch"](function () {});
      } else {
        /* Mute */
        video.muted = true;
        if (volumeSlider) {
          volumeSlider.dataset.prevVol = volumeSlider.value;
          volumeSlider.value = "0";
        }
      }
      syncMute();
    });
    video.addEventListener("volumechange", function () {
      syncMute();
      if (volumeSlider) {
        volumeSlider.value = video.muted ? "0" : String(video.volume);
      }
    });
    syncMute();
  }

  /* --- Volume slider --- */
  if (video && volumeSlider) {
    volumeSlider.addEventListener("input", function () {
      video.volume = parseFloat(volumeSlider.value);
      if (video.volume === 0) {
        video.muted = true;
      } else {
        video.muted = false;
      }
    });
  }

  var reduceMotionAnchors = window.matchMedia("(prefers-reduced-motion: reduce)");
  var navHeight = 88;
  var anchorLinks = document.querySelectorAll('a[href^="#"]');
  Array.prototype.forEach.call(anchorLinks, function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (!href || href === "#") return;
      var behavior = reduceMotionAnchors.matches ? "auto" : "smooth";
      if (href === "#top") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: behavior });
        return;
      }
      if (href === "#connect") {
        e.preventDefault();
        window.scrollTo({
          top: document.documentElement.scrollHeight - window.innerHeight,
          behavior: behavior
        });
        return;
      }
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      top = Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
      window.scrollTo({ top: top, behavior: behavior });
    });
  });

  var track = document.querySelector(".gallery__track");
  var prevBtn = document.querySelector('[data-gallery="prev"]');
  var nextBtn = document.querySelector('[data-gallery="next"]');

  if (!track || !prevBtn || !nextBtn) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function step() {
    if (track.children.length < 2) return track.clientWidth;
    var first = track.children[0];
    var second = track.children[1];
    var stepPx = second.getBoundingClientRect().left - first.getBoundingClientRect().left;
    return stepPx > 0 ? stepPx : track.clientWidth;
  }

  function scrollByOne(direction) {
    var target = track.scrollLeft + direction * step();
    target = Math.max(0, Math.min(target, track.scrollWidth - track.clientWidth));
    track.scrollTo({ left: target, behavior: reduceMotion.matches ? "auto" : "smooth" });
  }

  prevBtn.addEventListener("click", function () {
    scrollByOne(-1);
  });

  nextBtn.addEventListener("click", function () {
    scrollByOne(1);
  });

  /* --- Hero parallax --- */
  var heroBg = document.querySelector(".hero-bg");
  var hero = document.querySelector(".hero");
  var reduceMotionParallax = window.matchMedia("(prefers-reduced-motion: reduce)");
  var parallaxTicking = false;

  function updateParallax() {
    parallaxTicking = false;
    if (!heroBg || !hero || reduceMotionParallax.matches) return;
    var scrollY = window.scrollY;
    var progress = Math.min(scrollY / hero.offsetHeight, 1);
    var offset = Math.round(progress * hero.offsetHeight * 0.2);
    heroBg.style.transform = "translateY(" + offset + "px)";
  }

  function onParallaxScroll() {
    if (!parallaxTicking) {
      requestAnimationFrame(updateParallax);
      parallaxTicking = true;
    }
  }

  if (heroBg) {
    window.addEventListener("scroll", onParallaxScroll, { passive: true });
    updateParallax();
  }
})();
