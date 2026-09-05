(function () {
  "use strict";

  var form = document.querySelector("[data-signup-form]");
  if (!form) return;

  var studyError = form.querySelector("[data-study-error]");
  var contactError = form.querySelector("[data-contact-error]");
  var formStatus = form.querySelector("[data-form-status]");
  var phone = form.querySelector("[data-phone]");
  var email = form.querySelector("[data-email]");
  var laterSections = form.querySelector("[data-signup-later]");
  var stepStatus = form.querySelector("[data-step-status]");

  // Progressive enhancement: with JavaScript disabled the whole form stays visible.
  if (laterSections) {
    laterSections.hidden = true;
  }

  var submitButton = form.querySelector(".submit-button");
  var firstName = form.querySelector('[name="first-name"]');
  var lastName = form.querySelector('[name="last-name"]');

  function isSignupComplete() {
    return Boolean(
      form.querySelector('input[name="bible-study"]:checked') &&
        firstName.value.trim() &&
        lastName.value.trim() &&
        (phone.value.trim() || email.value.trim())
    );
  }

  function updateSubmitState() {
    submitButton.disabled = !isSignupComplete();
  }

  var orientationSteps = form.querySelectorAll(".orientation-step");

  function syncOrientation(announce) {
    var studySelected = Boolean(form.querySelector('input[name="bible-study"]:checked'));
    var contactComplete = Boolean(
      firstName.value.trim() &&
        lastName.value.trim() &&
        (phone.value.trim() || email.value.trim())
    );

    Array.prototype.forEach.call(orientationSteps, function (step) {
      var n = Number(step.dataset.step);
      var isComplete =
        (n === 1 && studySelected) || (n === 2 && contactComplete);
      var isCurrent =
        (!studySelected && n === 1) ||
        (studySelected && !contactComplete && n === 2) ||
        (contactComplete && n === 3);

      step.classList.toggle("is-complete", isComplete);
      step.classList.toggle("is-current", isCurrent);

      if (isCurrent) {
        step.setAttribute("aria-current", "step");
      } else {
        step.removeAttribute("aria-current");
      }
    });

    if (announce && stepStatus) {
      var next = contactComplete
        ? "All set \u2014 your contact information looks good. You can now submit your signup."
        : studySelected
          ? "You can now add your contact information."
          : "Choose at least one Bible study time to get started.";
      stepStatus.textContent = next;
    }
  }

  updateSubmitState();
  syncOrientation(false);

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // The greyed-out state must always block submission.
    if (submitButton.disabled) {
      return;
    }

    var studySelected = form.querySelector('input[name="bible-study"]:checked');
    var hasContact = phone.value.trim() || email.value.trim();

    studyError.textContent = studySelected ? "" : "Choose at least one Bible study option.";
    contactError.textContent = hasContact ? "" : "Enter a phone number or email address.";
    Array.prototype.forEach.call(form.querySelectorAll('input[name="bible-study"]'), function (input) {
      input.setAttribute("aria-invalid", studySelected ? "false" : "true");
    });
    phone.setAttribute("aria-invalid", hasContact ? "false" : "true");
    email.setAttribute("aria-invalid", hasContact ? "false" : "true");
    formStatus.textContent = "";

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!studySelected) {
      form.querySelector('input[name="bible-study"]').focus();
      return;
    }

    if (!hasContact) {
      phone.focus();
      return;
    }

    formStatus.textContent = "Thanks! Your signup is ready to be sent.";
  });

  Array.prototype.forEach.call(form.querySelectorAll('input[name="bible-study"]'), function (input) {
    input.addEventListener("change", function () {
      if (form.querySelector('input[name="bible-study"]:checked')) {
        studyError.textContent = "";
        Array.prototype.forEach.call(form.querySelectorAll('input[name="bible-study"]'), function (studyInput) {
          studyInput.setAttribute("aria-invalid", "false");
        });
        if (laterSections && laterSections.hidden) {
          laterSections.hidden = false;
        }
      }
      updateSubmitState();
      syncOrientation(true);
    });
  });

  [phone, email, firstName, lastName].forEach(function (input) {
    input.addEventListener("input", function () {
      if (input === phone || input === email) {
        if (phone.value.trim() || email.value.trim()) {
          contactError.textContent = "";
          phone.setAttribute("aria-invalid", "false");
          email.setAttribute("aria-invalid", "false");
        }
      }
      updateSubmitState();
      syncOrientation(true);
    });
  });
})();