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

  var video = document.querySelector(".testimonial__video");
  var videoToggle = document.querySelector("[data-video-toggle]");
  if (video && videoToggle) {
    var PAUSE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18px" height="18px" viewBox="0 0 18 18" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 3.75C2 2.78334 2.78393 2 3.75 2H5.25C6.21607 2 7 2.78334 7 3.75V14.25C7 15.2167 6.21607 16 5.25 16H3.75C2.78393 16 2 15.2167 2 14.25V3.75Z" fill="rgba(255, 255, 255, 1)" fill-opacity="0.4" data-color="color-2"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M11 3.75C11 2.78334 11.7839 2 12.75 2H14.25C15.2161 2 16 2.78334 16 3.75V14.25C16 15.2167 15.2161 16 14.25 16H12.75C11.7839 16 11 15.2167 11 14.25V3.75Z" fill="rgba(255, 255, 255, 1)"></path></svg>';
    var PLAY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18px" height="18px" viewBox="0 0 18 18" focusable="false"><path d="M15.1 7.478L5.608 2.222C5.055 1.916 4.402 1.925 3.859 2.245C3.321 2.562 3 3.122 3 3.744V14.256C3 14.878 3.321 15.438 3.859 15.755C4.138 15.919 4.445 16.002 4.754 16.002C5.047 16.002 5.34 15.927 5.608 15.779L15.099 10.523C15.655 10.216 16 9.632 16 9.001C16 8.37 15.655 7.785 15.1 7.478Z" fill="rgba(255, 255, 255, 1)" fill-opacity="0.4" data-color="color-2"></path></svg>';
    videoToggle.addEventListener("click", function () {
      var icon = videoToggle.querySelector(".video-toggle__icon");
      if (video.paused) {
        video.play();
        videoToggle.setAttribute("aria-label", "Pause video");
        if (icon) icon.innerHTML = PAUSE_SVG;
      } else {
        video.pause();
        videoToggle.setAttribute("aria-label", "Play video");
        if (icon) icon.innerHTML = PLAY_SVG;
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
})();
