(function () {
  "use strict";

  var form = document.querySelector("[data-signup-form]");
  if (!form) return;

  var studyError = form.querySelector("[data-study-error]");
  var contactError = form.querySelector("[data-contact-error]");
  var formStatus = form.querySelector("[data-form-status]");
  var phone = form.querySelector("[data-phone]");
  var email = form.querySelector("[data-email]");

  function normalizeOptionRows() {
    Array.prototype.forEach.call(form.querySelectorAll(".option-list"), function (list) {
      var rows = list.querySelectorAll(".option-row");
      var tallestRow = 0;

      Array.prototype.forEach.call(rows, function (row) {
        row.style.minHeight = "";
        row.style.height = "";
        tallestRow = Math.max(tallestRow, row.getBoundingClientRect().height);
      });

      tallestRow = Math.ceil(tallestRow);

      Array.prototype.forEach.call(rows, function (row) {
        row.style.height = tallestRow + "px";
      });
    });
  }

  normalizeOptionRows();
  window.addEventListener("resize", normalizeOptionRows);
  window.addEventListener("load", normalizeOptionRows);

  form.addEventListener("submit", function (event) {
    event.preventDefault();

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
      }
    });
  });

  [phone, email].forEach(function (input) {
    input.addEventListener("input", function () {
      if (phone.value.trim() || email.value.trim()) {
        contactError.textContent = "";
        phone.setAttribute("aria-invalid", "false");
        email.setAttribute("aria-invalid", "false");
      }
    });
  });
})();