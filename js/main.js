(function () {
  "use strict";

  var nav = document.querySelector(".site-nav");
  if (nav) {
    var directionStartY = window.scrollY;
    var scrollDirectionThreshold = 8;
    var onNavScroll = function () {
      var currentScrollY = window.scrollY;
      nav.classList.toggle("is-scrolled", currentScrollY > 8);

      if (currentScrollY <= 8) {
        nav.classList.remove("is-logo-hidden");
        directionStartY = currentScrollY;
      } else if (currentScrollY - directionStartY >= scrollDirectionThreshold) {
        nav.classList.add("is-logo-hidden");
        directionStartY = currentScrollY;
      } else if (directionStartY - currentScrollY >= scrollDirectionThreshold) {
        nav.classList.remove("is-logo-hidden");
        directionStartY = currentScrollY;
      }
    };
    window.addEventListener("scroll", onNavScroll, { passive: true });
    onNavScroll();
  }

  var video = document.querySelector("[data-video]");
  var playBtn = document.querySelector("[data-video-play]");
  var muteBtn = document.querySelector("[data-video-mute]");
  var progressSlider = document.querySelector("[data-video-progress]");
  var timeDisplay = document.querySelector("[data-video-time]");

  if (video) {
    video.volume = 1;
    video.muted = true;
    if ("IntersectionObserver" in window) {
      var videoLoader = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              // Changing preload can start the request; load() would restart it.
              video.preload = "metadata";
              videoLoader.disconnect();
            }
          });
        },
        { rootMargin: "400px 0px" }
      );
      videoLoader.observe(video);
    } else {
      video.preload = "metadata";
    }

    // Nothing keeps playing once it has scrolled away.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting && !video.paused) video.pause();
          });
        },
        { threshold: 0 }
      ).observe(video);
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

  function updateProgress() {
    if (!video || !progressSlider) return;
    if (!isFinite(video.duration) || video.duration === 0) {
      progressSlider.value = "0";
      return;
    }
    progressSlider.value = String((video.currentTime / video.duration) * 100);
  }

  /* Play/pause */
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
    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", updateTime);
    video.addEventListener("loadedmetadata", updateProgress);
  }

  /* Seek */
  if (video && progressSlider) {
    progressSlider.addEventListener("input", function () {
      if (!isFinite(video.duration) || video.duration === 0) return;
      video.currentTime = (parseFloat(progressSlider.value) / 100) * video.duration;
      updateTime();
    });
  }

  /* Mute/unmute */
  if (video && muteBtn) {
    function syncMute() {
      muteBtn.setAttribute("aria-label", video.muted ? "Unmute video" : "Mute video");
      muteBtn.innerHTML = video.muted ? SVG_MUTED : SVG_UNMUTED;
    }
    muteBtn.addEventListener("click", function () {
      video.muted = !video.muted;
      if (!video.muted) {
        video.play();
      }
      syncMute();
    });
    video.addEventListener("volumechange", syncMute);
    syncMute();
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var navHeight = 88;
  var anchorLinks = document.querySelectorAll('a[href^="#"]');
  Array.prototype.forEach.call(anchorLinks, function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (!href || href === "#") return;
      var behavior = reduceMotion.matches ? "auto" : "smooth";
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

  /* --- Past activities: the horizontal rail --- */
  var track = document.querySelector(".gallery__track");
  var prevBtn = document.querySelector('[data-gallery="prev"]');
  var nextBtn = document.querySelector('[data-gallery="next"]');

  if (track && prevBtn && nextBtn) {
    var railStep = function () {
      if (track.children.length < 2) return track.clientWidth;
      var first = track.children[0];
      var second = track.children[1];
      var stepPx = second.getBoundingClientRect().left - first.getBoundingClientRect().left;
      return stepPx > 0 ? stepPx : track.clientWidth;
    };

    var setGalleryButtons = function (scrollLeft) {
      // Disabling a focused button moves focus to the document immediately.
      var focused = document.activeElement;

      prevBtn.disabled = scrollLeft <= 1;
      nextBtn.disabled = scrollLeft >= track.scrollWidth - track.clientWidth - 1;

      if (focused === nextBtn && nextBtn.disabled && !prevBtn.disabled) {
        prevBtn.focus();
      } else if (focused === prevBtn && prevBtn.disabled && !nextBtn.disabled) {
        nextBtn.focus();
      }
    };

    var updateGalleryButtons = function () {
      setGalleryButtons(track.scrollLeft);
    };

    var scrollByOne = function (direction) {
      var target = track.scrollLeft + direction * railStep();
      target = Math.max(0, Math.min(target, track.scrollWidth - track.clientWidth));
      var next = Math.round(target);
      var prev = Math.round(track.scrollLeft);
      if (next === prev) {
        setGalleryButtons(prev);
        return;
      }
      // Reflect the boundary state immediately so the control no longer appears
      // clickable after the interaction has already been committed.
      setGalleryButtons(next);
      track.scrollTo({ left: next, behavior: reduceMotion.matches ? "auto" : "smooth" });
    };

    prevBtn.addEventListener("click", function () {
      scrollByOne(-1);
    });

    nextBtn.addEventListener("click", function () {
      scrollByOne(1);
    });

    track.addEventListener("scroll", updateGalleryButtons, { passive: true });
    window.addEventListener("resize", updateGalleryButtons);
    updateGalleryButtons();
  }

  var helix = document.querySelector("[data-helix]");
  var helixScene = helix ? helix.querySelector("[data-helix-scene]") : null;
  var helixCards = helix
    ? Array.prototype.slice.call(helix.querySelectorAll(".helix__card"))
    : [];

  if (helix && helixScene && helixCards.length > 1) {
    var helixCount = helixCards.length;
    // Start on the middle card, whatever the count.
    var helixActive = Math.floor((helixCount - 1) / 2);

    var helixPerTurn = 13;
    var helixCardH = 0;
    var helixRadius = 0;
    var helixPitch = 40; // px of travel per card
    var helixShift = 0; // vertical offset that centres the spiral
    var helixOffset = 0; // cards rotated away from rest
    var helixVelocity = 0; // items per ms, for the fling
    var helixDragging = false;
    var helixDragVelocity = 0; // items per ms, measured from the pointer
    var helixReturn = null; // card (or bound) the coil is travelling to
    var helixSnap = false; // true when that target is a card, not an end
    var helixDragAxis = "y"; // mouse drags vertically, touch drags sideways
    var helixDragPitch = 40; // px per card for the active gesture
    var helixLastMoveX = 0;
    var helixLastMoveY = 0;
    var helixLastMoveT = 0;
    var helixStartX = 0;
    var helixStartY = 0;
    var helixStartOffset = 0;
    var helixPointerX = 0;
    var helixPointerY = 0;
    var helixFrame = 0;
    var helixLast = 0;
    var helixMin = -helixActive;
    var helixMax = helixCount - 1 - helixActive;
    var helixGive = 0.3; // how far past an end the drag is allowed to pull
    var helixMaxGive = 1; // items of rubber band at most
    var helixDofBlur = 10; // px of blur on the farthest card
    var helixDofFocus = 0.5; // depth that still reads as sharp
    var helixBlurred = []; // last blur written per card, to skip repeat writes

    var helixResist = function (value) {
      if (value < helixMin) value = helixMin - (helixMin - value) * helixGive;
      else if (value > helixMax) value = helixMax + (value - helixMax) * helixGive;
      return Math.max(helixMin - helixMaxGive, Math.min(helixMax + helixMaxGive, value));
    };

    var helixPoses = function (offset) {
      var poses = [];
      for (var i = 0; i < helixCount; i++) {
        // No wrap: the cards stop at the ends instead of cycling forever.
        var t = i - helixActive - offset;
        var angle = (t * 360) / helixPerTurn;
        var radians = angle * (Math.PI / 180);
        poses.push({
          t: t,
          angle: angle,
          x: Math.sin(radians) * helixRadius,
          z: Math.cos(radians) * helixRadius - helixRadius,
          // 0 on the face of the coil, 1 at the far side of the turn.
          depth: (1 - Math.cos(radians)) / 2
        });
      }
      return poses;
    };

    /* Blur for a card at that depth: nothing before the focal depth, then a
       smooth rise to the full blur at the back. */
    var helixBlurFor = function (depth) {
      var span = 1 - helixDofFocus;
      if (span <= 0) return depth >= 1 ? helixDofBlur : 0;
      var t = (depth - helixDofFocus) / span;
      if (t <= 0) return 0;
      if (t >= 1) return helixDofBlur;
      return t * t * (3 - 2 * t) * helixDofBlur;
    };

    var helixDraw = function () {
      var poses = helixPoses(helixOffset);
      for (var i = 0; i < helixCount; i++) {
        var pose = poses[i];
        helixCards[i].style.transform =
          "translate(-50%, -50%) translate3d(" +
          pose.x.toFixed(2) + "px, " +
          (pose.t * helixPitch + helixShift).toFixed(2) + "px, " +
          pose.z.toFixed(2) + "px) rotateY(" +
          pose.angle.toFixed(2) + "deg)";

        // Quarter-pixel steps: a card only re-blurs when it crosses one.
        var blur = Math.round(helixBlurFor(pose.depth) * 4) / 4;
        if (blur !== helixBlurred[i]) {
          helixBlurred[i] = blur;
          helixCards[i].style.filter = blur > 0 ? "blur(" + blur.toFixed(2) + "px)" : "";
        }
      }
    };

    /* Authored in CSS so blur and focal depth can be read, and tuned, there.
       Returns true when either value moved, so the caller knows to redraw. */
    var helixReadDof = function () {
      var styles = getComputedStyle(helix);
      var blur = parseFloat(styles.getPropertyValue("--helix-dof-blur"));
      var focus = parseFloat(styles.getPropertyValue("--helix-dof-focus"));
      var nextBlur = isNaN(blur) ? 0 : Math.max(0, blur);
      var nextFocus = isNaN(focus) ? 0.25 : Math.min(1, Math.max(0, focus));
      if (nextBlur === helixDofBlur && nextFocus === helixDofFocus) return false;
      helixDofBlur = nextBlur;
      helixDofFocus = nextFocus;
      return true;
    };

    var helixLayout = function () {
      helixReadDof();

      helixPerTurn = 8;
      var gap = 30;
      helixCardH = helixCards[0].offsetHeight;
      helixPitch = Math.round(helixCardH * 0.3);
      helixRadius = (helixPerTurn * (helixCardH + gap)) / (2 * Math.PI);
      // The card at 0 deg is the face of the section, so it sits on the
      // scene's centre line.
      helixShift = 0;
      helixDraw();
    };

    /* A stylesheet cannot tell anyone it changed, so the only way an edit made
       while the page is open reaches an idle coil is to look again. Two CSS
       reads twice a second, and only while the section is on screen: no
       frame loop, and nothing runs once it scrolls away. */
    var helixDofPollMs = 400;
    var helixDofTimer = 0;
    var helixDofVisible = false;

    var helixPollDof = function () {
      helixDofTimer = 0;
      if (helixReadDof() && !helixFrame) helixDraw();
      if (helixDofVisible) helixDofTimer = setTimeout(helixPollDof, helixDofPollMs);
    };

    var helixWatchDof = function (visible) {
      helixDofVisible = visible;
      if (!visible) {
        clearTimeout(helixDofTimer);
        helixDofTimer = 0;
      } else if (!helixDofTimer) {
        helixDofTimer = setTimeout(helixPollDof, helixDofPollMs);
      }
    };
    var helixTick = function (now) {
      var dt = helixLast ? Math.min(64, now - helixLast) : 16;
      helixLast = now;

      if (helixDragging) {
        // 1:1 with the pointer until it pulls past an end, then resisted.
        var travel =
          helixDragAxis === "y"
            ? helixPointerY - helixStartY
            : helixPointerX - helixStartX;
        helixOffset = helixResist(helixStartOffset - travel / helixDragPitch);
        helixReturn = null;
        helixSnap = false;
      } else if (helixReturn !== null) {
        if (reduceMotion.matches) {
          helixOffset = helixReturn;
          helixVelocity = 0;
          helixReturn = null;
          helixSnap = false;
        } else {
          var stiffness = helixSnap ? 0.00055 : 0.00045;
          var damping = helixSnap ? 0.047 : 0.0212;
          // Smaller integration steps keep the spring stable when frames arrive late.
          var steps = 4;
          var sub = dt / steps;
          for (var step = 0; step < steps; step++) {
            helixVelocity += (helixReturn - helixOffset) * stiffness * sub;
            helixVelocity *= Math.exp(-damping * sub);
            helixOffset += helixVelocity * sub;
          }
          if (
            Math.abs(helixReturn - helixOffset) < 0.003 &&
            Math.abs(helixVelocity) < 0.0006
          ) {
            helixOffset = helixReturn;
            helixVelocity = 0;
            helixReturn = null;
            helixSnap = false;
          }
        }
      } else {
        helixOffset += helixVelocity * dt;
        helixVelocity *= Math.exp(-0.006 * dt);
        if (Math.abs(helixVelocity) < 0.0002) {
          helixVelocity = 0;
          if (helixOffset < helixMin) {
            helixReturn = helixMin;
            helixSnap = false;
            helixVelocity = 0;
          } else if (helixOffset > helixMax) {
            helixReturn = helixMax;
            helixSnap = false;
            helixVelocity = 0;
          } else {
            var nearest = Math.round(helixOffset);
            if (Math.abs(nearest - helixOffset) > 0.001) {
              helixReturn = nearest;
              helixSnap = true;
            }
          }
        } else if (helixOffset < helixMin || helixOffset > helixMax) {
          helixReturn = helixOffset < helixMin ? helixMin : helixMax;
          helixSnap = false;
          helixVelocity = Math.max(-0.003, Math.min(0.003, helixVelocity));
        }
      }

      helixDraw();

      if (helixDragging || helixReturn !== null || helixVelocity !== 0) {
        helixFrame = requestAnimationFrame(helixTick);
      } else {
        helixFrame = 0;
        helixLast = 0;
      }
    };

    var helixStart = function () {
      if (helixFrame) return;
      // Picks up a depth-of-field change made while the section was at rest.
      helixReadDof();
      helixLast = 0;
      helixFrame = requestAnimationFrame(helixTick);
    };

    var helixEndDrag = function () {
      if (!helixDragging) return;
      helixDragging = false;
      helix.classList.remove("helix--dragging");
      var still = performance.now() - helixLastMoveT < 100;
      helixVelocity = still && !reduceMotion.matches ? helixDragVelocity : 0;
      if (helixOffset < helixMin || helixOffset > helixMax) helixVelocity = 0;
      if (Math.abs(helixVelocity) < 0.0006) helixVelocity = 0;
      helixStart();
    };

    helixScene.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) return;
      // A mouse drags the coil up and down. On a touch screen a vertical drag
      // belongs to the page scroll, so there the coil is spun sideways.
      helixDragAxis = event.pointerType === "mouse" ? "y" : "x";
      helixDragPitch = helixDragAxis === "y" ? helixPitch : helixPitch * 1.8;
      helixDragging = true;
      helixStartX = event.clientX;
      helixStartY = event.clientY;
      helixPointerX = event.clientX;
      helixPointerY = event.clientY;
      helixStartOffset = helixOffset;
      helixVelocity = 0;
      helixDragVelocity = 0;
      helixLastMoveX = event.clientX;
      helixLastMoveY = event.clientY;
      helixLastMoveT = event.timeStamp;
      helix.classList.add("helix--dragging");
      if (helixScene.setPointerCapture) helixScene.setPointerCapture(event.pointerId);
      event.preventDefault();
      helixStart();
    });

    helixScene.addEventListener("pointermove", function (event) {
      if (!helixDragging) return;
      helixPointerX = event.clientX;
      helixPointerY = event.clientY;

      var elapsed = event.timeStamp - helixLastMoveT;
      if (elapsed > 0) {
        var moved =
          helixDragAxis === "y"
            ? event.clientY - helixLastMoveY
            : event.clientX - helixLastMoveX;
        var instant = -moved / helixDragPitch / elapsed;
        // Smoothed so one jittery sample does not define the throw.
        helixDragVelocity = helixDragVelocity * 0.7 + instant * 0.3;
        helixLastMoveX = event.clientX;
        helixLastMoveY = event.clientY;
        helixLastMoveT = event.timeStamp;
      }
    });

    helixScene.addEventListener("pointerup", function (event) {
      if (helixScene.releasePointerCapture && helixScene.hasPointerCapture(event.pointerId)) {
        helixScene.releasePointerCapture(event.pointerId);
      }
      helixEndDrag();
    });

    helixScene.addEventListener("pointercancel", helixEndDrag);
    window.addEventListener("blur", helixEndDrag);

    helix.classList.add("helix--3d");
    helixLayout();
    window.addEventListener("resize", helixLayout);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        helixWatchDof(
          entries.some(function (entry) {
            return entry.isIntersecting;
          }),
        );
      }).observe(helix);
    } else {
      helixWatchDof(true);
    }
  }
  /* --- Hero parallax --- */
  var heroBg = document.querySelector(".hero-bg");
  var hero = document.querySelector(".hero");
  var parallaxTicking = false;
  function updateParallax() {
    parallaxTicking = false;
    if (!heroBg || !hero || reduceMotion.matches) return;
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

  /* --- Floating CTA --- */
  var floatCta = document.querySelector("[data-float-cta]");
  var heroCta = document.querySelector("[data-hero-cta]");
  var floatParkAt = document.querySelector(".cta__wordmark");
  var floatPill = document.querySelector(".float-cta__pill");

  if (floatCta) {
    if (!heroCta) {
      floatCta.classList.add("is-visible");
    } else {
      var floatTicking = false;
      var floatGap = 24;
      var parkOffset = 0;
      var pillHeight = 0;

      var measureFloatCta = function () {
        var styles = getComputedStyle(floatCta);
        floatGap = parseFloat(styles.getPropertyValue("--float-gap")) || 24;
        parkOffset = parseFloat(styles.getPropertyValue("--float-park-offset")) || 0;
        pillHeight = floatPill ? floatPill.offsetHeight : 0;
      };

      /* Scrolling only ever flips two boolean states. The pill is never given a
         new position on a scroll frame: while it floats, CSS pins it to the
         viewport; once the wordmark rises to meet it, the pill is switched into
         the page at the same on-screen spot, so it then scrolls with the footer
         and the hand-over is invisible. */
      var updateFloatCta = function () {
        floatTicking = false;

        var pastHero = heroCta.getBoundingClientRect().bottom <= 0;
        floatCta.classList.toggle("is-visible", pastHero);

        if (!pastHero || !floatParkAt || !pillHeight) {
          floatCta.classList.remove("is-parked");
          return;
        }

        var regionTop = floatParkAt.getBoundingClientRect().top;
        var floatTop = window.innerHeight - floatGap - pillHeight;

        if (regionTop + parkOffset <= floatTop) {
          floatCta.style.setProperty(
            "--float-park-top",
            regionTop + window.scrollY + parkOffset + "px",
          );
          floatCta.classList.add("is-parked");
        } else {
          floatCta.classList.remove("is-parked");
        }
      };

      var onFloatScroll = function () {
        if (!floatTicking) {
          floatTicking = true;
          requestAnimationFrame(updateFloatCta);
        }
      };

      var onFloatResize = function () {
        measureFloatCta();
        onFloatScroll();
      };

      measureFloatCta();
      window.addEventListener("scroll", onFloatScroll, { passive: true });
      window.addEventListener("resize", onFloatResize, { passive: true });
      updateFloatCta();
    }
  }
})();
