export default function shortcodes(eleventyConfig) {

  eleventyConfig.addShortcode('year', () => `${new Date().toLocaleString('en-US', { year: 'numeric' })}`);

  // TODO: add support for playlist links
  // Modified version, original via @https://www.seanmcp.com/articles/add-a-youtube-embedder-shortcode-to-your-eleventy-site/
  eleventyConfig.addShortcode('youtube', (embedId, title) => {
    let id;
    if (embedId.includes('//') || embedId.includes('http://') || embedId.includes('https://')) {
      const url = new URL(id);
      id = url.searchParams.get('v');
    } else {
      id = embedId;
    }

    return `
      <div class="embed-responsive embed-responsive-16by9">
        <iframe class="yt-shortcode" src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube video player${
      title ? ` for ${title}` : ""
    }" frameborder="0" allowfullscreen></iframe>
      </div>
    `;
  });

  // via @ https://dev.to/psypher1/lets-learn-11ty-part-3-collections-shortcodes-macros-p0a
  eleventyConfig.addShortcode('headers', (title, subtitle) =>
    `<h1>${title}</h1>
    <p>${subtitle}</p>`);

  // back to top, accepts 3 arguments to customize wrapper markup, target id, and message
  eleventyConfig.addShortcode('back_to', (element_type, target_id, msg) => {
    let elem = 'div';
    let target = 'main';
    let text = 'Back to top';
    if (element_type) {
      elem = element_type;
    }
    if (target_id) {
      // just in case a hash gets accidentally passed in, strip it
      target = target_id.replace('#','');
      target = target_id;
    }
    if (msg) {
      text = msg;
    }
    return `<${elem} class="back-to"><p><a href="#${target}">${text}</a></p></${elem}>`;
  });

  eleventyConfig.addShortcode('external_link', (href, title, className) => {
    const cls = className ? ` class="${className}"` : '';
    return `<a href="${href}" rel="noopener" target="_blank"${cls}>${title}</a>`
  });

  eleventyConfig.addShortcode('mail_link', (href, title) => {
    return `<a href="mailto:${href}">${title}</a>`
  });

}
