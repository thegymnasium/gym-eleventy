import EleventyFetch from '@11ty/eleventy-fetch';
import Parser from 'rss-parser';
import DOMPurify from 'isomorphic-dompurify';
import fs from 'node:fs';

let parser = new Parser();

const ENV = process.env.NODE_ENV;

// Individual job API: https://cloudwall.aquent.com/api/v1/jobpostings/189094

const MARKETS_API = 'https://aquentllc.wpengine.com/feeds/gymnasium-markets.json';

// const JOB_FEED = 'https://aquentllc.wpengine.com/wp-json/aq-central/v1/jobs/listing?pageSize=500';

const JOB_API = 'https://aquentllc.wpengine.com/wp-json/aq-central/v1/gymnasium/listing';

const JOB_OPTIONS_API = 'https://aquentllc.wpengine.com/wp-json/aq-central/v1/jobs/options';

const JOB_FEED_URLS = {
  "AU": "https://aquent.com.au/find-work/",
  "CA": "https://aquent.com/find-work/",
  "DE": "https://aquent.com/find-work/",
  "FR": "https://aquent.fr/nos-offres/",
  "GB": "https://aquent.co.uk/find-work/",
  "JP": "https://aquent.co.jp/find-work/",
  "NL": "https://aquent.com/find-work/",
  "US": "https://aquent.com/find-work/"
};

const BASE_AQ_PAGES_API = `https://aquent.com/wp-json/wp/v2/pages`;
const AQ_PAGES_API = `${BASE_AQ_PAGES_API}?slug=privacy-policy,european-rights,dpf-notice,california-privacy-rights,data-category`;

const cleanWpOutput = (input) => {
  const dirty = input
    .replaceAll(`\n`,``)
    .replaceAll(`https://aquent.com`,``);

    const clean = DOMPurify.sanitize(dirty, {
      // USE_PROFILES: {html: true},
      FORBID_ATTR: [
        'class',
        'id',
        'style',
      ],
      FORBID_TAGS: [
        'body',
        'html',
        'style',
      ]
    });

    // console.log(clean);
    
  return clean;
};


export default async function() {

  try {

    let MARKETS = await EleventyFetch(MARKETS_API, {
      duration: ENV.includes('dev' || 'tutor') ? 0 : '24h',
      type: "json"
    });

    let JOB_OPTIONS = await EleventyFetch(JOB_OPTIONS_API, {
      duration: ENV.includes('dev' || 'tutor') ? 0 : '24h',
      type: "json"
    });

    let AQ_PAGES = await EleventyFetch(AQ_PAGES_API, {
      duration: ENV.includes('dev' || 'tutor') ? 0 : '96h',
      type: "json"
    });

    let PAGES = [];

    AQ_PAGES.forEach(page => {
      var newpage = {
        "slug": page.slug,
        "title": page.title.rendered,
        "content": cleanWpOutput(page.content.rendered),
      };
      PAGES.push(newpage);
    });

    return {
      JOB_API: JOB_API,
      JOBDATA: {
        "locations": JOB_OPTIONS.locations,
        "placement_options": JOB_OPTIONS.placement_options,
        "preferences": JOB_OPTIONS.preferences,
        "roles": JOB_OPTIONS.roles,
        "urls": JOB_FEED_URLS,
      },
      markets: MARKETS,
      pages: PAGES,
    };
  } catch(e) {
    console.warn( "Failed fetching data feeds.", e );
    return {
      items: false
    };
  }
};
