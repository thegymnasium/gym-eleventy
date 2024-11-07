// Polyfill for Array.prototype.filter() via @https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
if (!Array.prototype.filter) {
  Array.prototype.filter = function (func, thisArg) {
    "use strict";
    if (!((typeof func === "Function" || typeof func === "function") && this)) {
      throw new TypeError();
    }

    let len = this.length >>> 0;
    let res = new Array(len); // preallocate array
    let t = this;
    let c = 0;
    let i = -1;

    let kValue;
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
let eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
let eventer = window[eventMethod];
let messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

const jobsContainer = document.getElementById("jobs-container");

// Get URL Parameter
function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  let regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
  let results = regex.exec(location.search);
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
    let opt = option.split(":").map(function (el) {
      return el.trim();
    });
    if (opt[0]) {
      output[opt[0]] = parseValue(opt[1]);
    }
  });
}

function gymJobs() {
  // check if we have the jobs container
  if (typeof jobsContainer !== "undefined" && jobsContainer !== null) {
    console.log("jobs.js active");
    let endpoint = jobsContainer.getAttribute("data-feed");
    const utms = jobsContainer.hasAttribute("data-utm")
      ? `?${jobsContainer.getAttribute("data-utm")}`
      : "";
    const msgContainer = document.getElementById("messages");
    let data;
    let opts = {};
    let selectedSlug = '';
    let url = new URL(window.location.href);
    let params = new URLSearchParams(url.search);
    const locationSelect = document.getElementById("location");
    const debug = getUrlParameter("debug") ? true : false;
    // Add exception for `remote` option in the markets dropdown
    let location =
      getUrlParameter("location") === "remote" ? '' : getUrlParameter("location");

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

    // get human-readable slug from location ID
    function getSlug(locId) {
      outputDebug(`getting slug for `, locId);
      const selectedOption = locationSelect.options[locationSelect.selectedIndex];
      selectedSlug = selectedOption.dataset.slug;
      outputDebug(`selectedSlug `,  selectedSlug);
    }

    // If we have a market populated on page load, update the dropdown
    if (typeof location !== "undefined" && location !== null && location.length) {
      updateDropdown(location)
        .then(getSlug(location))
        .catch((err) => {
          console.warn(err);
        });
    }

    // Clear results completely
    function clearResults() {
      jobsContainer.innerHTML = "";
    }

    // fetch data from endpoint and process accordingly
    function fetchData(endpoint) {
      outputDebug(`fetching data from endpoint: ${endpoint}`);
      fetch(endpoint)
      .then((response) => response.json())
      .then((responseObj) => {
        let jobData = JSON.stringify(responseObj)
        // store('jobs', jobData);
        processData(jobData);
      })
      .catch((error) => console.error("Error loading JSON file", error));
    }

    // hide any visible messaging
    function hideMsg() {
      msgContainer.querySelectorAll("div").forEach((el) => {
        el.classList.add("hide");
      });
    }

    // if we have locations, make sure we are using the proper parameters at the endpoint
    function initializeJobs(append) {
      try {
        if (append) {
          let updated_endpoint = `${endpoint}&locations[]=${append}`;
          outputDebug(`updating endpoint: ${updated_endpoint}`);
          fetchData(updated_endpoint);
        } else {
          fetchData(endpoint);
        }
      } catch (err) {
        console.warn(
          "error processing JSONData!",
          err
        );
      }
    }

    // use `debug=true or debug=1` parameter to activate
    function outputDebug(message, type) {
      if (debug) {
        const msg = `[job module]: ${message}`;
        if (type === 'warn') {
          console.warn(msg);
        } else if (type === 'error') {
          console.error(msg);
        } else {
          console.log(msg);
        }
      }
    }

    // update window history
    function pushHistory(loc) {
      params.set("location", loc);
      if (debug) {
        params.set("debug", true);
      }
      params.toString();
      window.history.pushState({}, "", `?${params}#location`);
    }

    // Process our JSON data
    function processData(d) {
      data = JSON.parse(d);
      if (typeof data.items !== "undefined" && data.items !== null) {
        let items = data.items;

        outputDebug(`${items.length} total jobs available.`);

        // Do we have a specific category?
        // TODO: this is currently broken in the new endpoint
        let category = opts.category ?? false;

        // Set iteration limits
        let limit = opts.limit ? parseInt(opts.limit) : 10;

        // TODO: this is currently broken in the new endpoint
        if (category) {
          items = items.filter((item) => item.category === category);

          outputDebug(
            `showing ${items.length} jobs for category: ${category}.`
          );
        }

        // Filter the jobs by market if we have a market param
        if (
          typeof location !== "undefined" &&
          location !== null &&
          location.length
        ) {
          items = items.filter((item) => item.location_id === location);

          outputDebug(
            `showing ${items.length} jobs for location: ${location}, aka ${selectedSlug}`
          );
        } else {
          // Off-site preference key
          // 0 = Unknown
          // 1 = On-Site
          // 2 = Off-Site
          // 3 = Either
          // 4 = Partial on-site
          items = items.filter((item) => parseInt(item.offsite_preference) >= 2);
          updateDropdown('remote');

          outputDebug("showing only remote & hybrid options…");
        }

        // How many results do we have?
        let numResults = items.length;

        outputDebug(
          `total results: ${numResults} | limit: ${limit}`
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
          let list = "";

          // hide our loading message
          document.getElementById("loading").classList.add("hide");

          if (numResults < limit) {
            limit = numResults;
          }

          // Generate job item
          for (let i = 0; i < limit; i++) {
            let el = items[i];
            let postDate = el.posted_date;
            let modDate = el.cloudwall_mod_date;
            const jobUrls = JSON.parse(jobsContainer.dataset.urls);
            const jobUrl = `${jobUrls[el.country]}${el.job_id}`;

            outputDebug(
              `job id: ${el.job_id}\n   remote type: ${
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

          // let's wait one second before updating the url parameter to `remote`
          setTimeout(() => {
            pushHistory('remote');
          }, '1000');
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

      selectedSlug = slug;

      pushHistory(value);

      outputDebug(`location selected: ${location}, slug: ${selectedSlug}`);

      hideMsg();
      clearResults();

      showMsg("loading");

      initializeJobs(slug);
    }


    // Show our messaging accordingly
    // TODO: add support for dynamic content
    function showMsg(id) {
      // firstly, hide any visible messaging
      hideMsg();

      const shownMsg = document.getElementById(id);

      // show the element we want!
      shownMsg.classList.remove("fadeout");
      shownMsg.classList.remove("hide");
    }

    // Store our data in session storage
    function store(name, data) {
      if (window.sessionStorage) {
        sessionStorage.setItem(name, data);
      } else {
        console.warn("No browser support for sessionStorage!");
      }
    }

    // Update dropdown to the selected option
    async function updateDropdown(location) {

      try {
        locationSelect.value = location;
        outputDebug(`updating dropdown to ${locationSelect.value}`);
      } catch(err) {
        console.warn(err);
      }
    }

    // check to see if we have a market set in URL parameters
    if (selectedSlug.length) {
      outputDebug(`we have a previously set market in the URL parameters`);
      initializeJobs(selectedSlug);
    } else {
      outputDebug(`no market set in URL parameters`);
      initializeJobs();
    }


    // Listen for change events from form select
    locationSelect.addEventListener("change", selectChange, false);
  }
}

window.addEventListener("load", () => {
  gymJobs();
});
