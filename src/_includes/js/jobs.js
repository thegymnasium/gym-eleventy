// Polyfill for Array.prototype.filter() via @https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
if (!Array.prototype.filter) {
  Array.prototype.filter = function (func, thisArg) {
    "use strict";
    if (!((typeof func === "Function" || typeof func === "function") && this)) {
      throw new TypeError();
    }

    var len = this.length >>> 0;
    var res = new Array(len); // preallocate array
    var t = this;
    var c = 0;
    var i = -1;

    var kValue;
    if (thisArg === undefined) {
      while (++i !== len) {
        // checks to see if the key was set
        if (i in this) {
          kValue = t[i]; // in case t is changed in callback
          if (func(t[i], i, t)) {
            res[c++] = kValue;
          }
        }
      }
    } else {
      while (++i !== len) {
        // checks to see if the key was set
        if (i in this) {
          kValue = t[i];
          if (func.call(thisArg, t[i], i, t)) {
            res[c++] = kValue;
          }
        }
      }
    }

    res.length = c; // shrink down array to proper size
    return res;
  };
}

// Polyfill for trim @https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
  };
}

// Shuffle items
Array.prototype.shuffle = function () {
  let input = this;

  for (let i = input.length - 1; i >= 0; i--) {
    let randomIndex = Math.floor(Math.random() * (i + 1));
    let itemAtIndex = input[randomIndex];

    input[randomIndex] = input[i];
    input[i] = itemAtIndex;
  }
  return input;
};

// Create IE + others compatible event handler via @https://davidwalsh.name/window-iframe
var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

const jobsContainer = document.getElementById("jobs-container");

// Get URL Parameter
function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
  var results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// function to help parse data options
function parseValue(str) {
  if ("true" === str) {
    return true;
  } else if ("false" === str) {
    return false;
  } else if (!isNaN(str * 1)) {
    return parseFloat(str);
  }

  return str;
}

// Create an array of options
function parseOptions(input, output) {
  input.split(";").forEach(function (option, _index) {
    var opt = option.split(":").map(function (el) {
      return el.trim();
    });
    if (opt[0]) {
      output[opt[0]] = parseValue(opt[1]);
    }
  });
}

function gymJobs() {
  // add stuff here
  if (typeof jobsContainer !== "undefined" && jobsContainer !== null) {
    console.log("jobs.js active");
    let endpoint = jobsContainer.getAttribute("data-feed");
    var utms = jobsContainer.hasAttribute("data-utm")
      ? `?${jobsContainer.getAttribute("data-utm")}`
      : "";
    const msgContainer = document.getElementById("messages");
    var data;
    var opts = {};
    var selectedLoc;
    var url = new URL(window.location.href);
    let params = new URLSearchParams(url.search);
    const form = document.getElementById("location");
    var debug = getUrlParameter("debug") ? true : false;

    // Off-site preference key
    const remoteLegend = {
      0: "Unknown",
      1: "On-Site",
      2: "Off-Site",
      3: "Either",
      4: "Partial on-site",
    };

    // Roles
    // content-copywriting : Content/Copywriting
    // creative-art-direction : Creative/Art Direction
    // digital-marketing : Digital Marketing
    // graphic-design : Graphic Design
    // other : Other
    // project-product-management : Project/Product Management
    // ui-web-design : UI/Web Design
    // user-experience : User Experience
    // web-development : Web Development

    if (jobsContainer.hasAttribute("data-options")) {
      parseOptions(jobsContainer.getAttribute("data-options"), opts);
    }

    // Add exception for `remote` option in the markets dropdown
    var location =
      getUrlParameter("location") === "remote" ? '' : getUrlParameter("location");

    // If we have a market populated on page load, update the dropdown
    if (typeof location !== "undefined" && location !== null && location.length) {
      updateDropdown(location);
    }

    // Clear results completely
    function clearResults() {
      jobsContainer.innerHTML = "";
    }

    function fetchData(endpoint) {
      fetch(endpoint)
      .then((response) => response.json())
      .then((responseObj) => {
        let jobData = JSON.stringify(responseObj)
        // store('jobs', jobData);
        outputDebug(`[job module] fetching data from endpoint: ${endpoint}`);
        processData(jobData);
      })
      .catch((error) => console.error("Error loading JSON file", error));
    }

    function hideMsg() {
      // firstly, hide any visible messaging
      msgContainer.querySelectorAll("div").forEach((el) => {
        el.classList.add("hide");
      });
    }

    function initializeJobs(append) {

      try {
        if (append) {
          let updated_endpoint = `${endpoint}&locations[]=${append}`;
          outputDebug(`[job module] updating endpoint: ${updated_endpoint}`);
          fetchData(updated_endpoint);
        } else {
          fetchData(endpoint);
        }

        outputDebug(`[job module] fetching JSONData.`);
      } catch (err) {
        console.warn(
          "[job module] error processing JSONData!",
          err
        );
      }
    }

    function outputDebug(message) {
      if (debug) {
        console.log(message);
      }
    }

    // Process our JSON data
    function processData(d) {
      data = JSON.parse(d);
      if (typeof data.items !== "undefined" && data.items !== null) {
        var items = data.items;

        outputDebug(`[job module] ${items.length} total jobs available.`);

        // Do we have a specific category?
        // TODO: this is currently broken in the new endpoint
        var category = opts.category ?? false;

        // Set iteration limits
        var limit = opts.limit ? parseInt(opts.limit) : 10;

        // TODO: this is currently broken in the new endpoint
        if (category) {
          items = items.filter((item) => item.category === category);

          outputDebug(
            `[job module] showing ${items.length} jobs for category: ${category}.`
          );
        }

        // Filter the jobs by market if we have a market param
        if (
          typeof location !== "undefined" &&
          location !== null &&
          location.length
        ) {
          items = items.filter((item) => item.location_id === location);

          selectedLoc = document.querySelector(
            `#location [value="${location}"]`
          ).innerText;

          outputDebug(
            `[job module] showing ${items.length} jobs for location: ${location}, aka ${selectedLoc}`
          );
        } else {
          // Off-site preference key
          // 0 = Unknown
          // 1 = On-Site
          // 2 = Off-Site
          // 3 = Either
          // 4 = Partial on-site
          items = items.filter((item) => parseInt(item.offsite_preference) >= 2);
          updateDropdown("remote");

          outputDebug("[job module] showing only remote & hybrid options…");
        }

        // How many results do we have?
        var numResults = items.length;

        outputDebug(
          `[job module] total results: ${numResults} | limit: ${limit}`
        );

        if (numResults > 0) {
          // Sort array by mod/post date properly, whichever is more recent
          items = items.sort((a, b) => {
            const aModDate = new Date(a.cloudwall_mod_date).getTime();
            const aPostDate = new Date(a.posted_date).getTime();
            const bModDate = new Date(b.cloudwall_mod_date).getTime();
            const bPostDate = new Date(b.posted_date).getTime();

            const compA = aModDate > aPostDate ? aModDate : aPostDate;
            const compB = bModDate > bPostDate ? bModDate : bPostDate;

            return compB - compA;
          });

          // Start with an empty list
          var list = "";

          // hide our loading message
          document.getElementById("loading").classList.add("hide");

          if (numResults < limit) {
            limit = numResults;
          }

          // Generate job item
          for (var i = 0; i < limit; i++) {
            var el = items[i];
            var postDate = el.posted_date;
            var modDate = el.cloudwall_mod_date;
            const jobUrls = JSON.parse(jobsContainer.dataset.urls);
            const jobUrl = `${jobUrls[el.country]}${el.job_id}`;

            outputDebug(
              `[job module] job id: ${el.job_id}\n   remote type: ${
                remoteLegend[el.offsite_preference]
              }\n   posted: ${postDate}\n   mod date: ${modDate}`
            );

            list += "<li>";
            list += `<a href="${decodeURI(jobUrl)}${utms}" title="${
              el.job_title
            }"><span class="job-title">${
              el.job_title
            } </span><span class="job-location"> ${el.city}</span></a>`;
            list += "</li>";
          }

          // close our list
          jobsContainer.innerHTML += `<ul class="jobs-list">${list}</ul>`;
        } else {
          // No jobs in market! Show the appropriate message.
          showMsg("error-results");
          params.set("location", "remote");
          window.history.pushState({}, "", `?${params}#location`);
        }
      } else {
        // No data found for some reason...
        showMsg("error-general");
      }
    }

    // What to do when the select updates
    function selectChange() {
      let value = this.value;
      let slug = this.options[this.selectedIndex].dataset.slug;
      if (value === "remote") {
        location = '';
        slug = '';
      } else {
        location = value;
      }

      // add "topic" parameter
      params.set("location", value);

      if (debug) {
        params.set("debug", true);
      }

      params.toString();

      window.history.pushState({}, "", `?${params}#location`);

      outputDebug(`[job module] location selected: ${location}, slug: ${slug}`);

      hideMsg();
      clearResults();

      initializeJobs(slug);
    }


    // Show our messaging accordingly
    // TODO: add support for dynamic content
    function showMsg(id) {
      // firstly, hide any visible messaging
      hideMsg();

      // show the element we want!
      document.getElementById(id).classList.remove("hide");
    }

    // Store our data in session storage
    function store(name, data) {
      if (window.sessionStorage) {
        sessionStorage.setItem(name, data);
      } else {
        console.warn("[job module] No browser support for sessionStorage!");
      }
    }

    // Update dropdown to the selected option
    function updateDropdown(location) {
      document.querySelector(`#location [value="${location}"]`).selected = true;
    }

    // initialize data
    initializeJobs();

    // Listen for change events from form select
    form.addEventListener("change", selectChange, false);

  }
}

window.addEventListener("load", () => {
  gymJobs();
});
