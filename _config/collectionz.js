export default function collectionz(eleventyConfig) {

  // eleventyConfig.addCollection('catalog', (collection, arg) => {
  //   return collection.getAll()[0].data.catalog;
  // });

  // eleventyConfig.addCollection('static', (collection, arg) => {
  //   console.log(collection.getAll()[0]);
  //   // return collection.getAll()[0].data.catalog;
  // });

  eleventyConfig.addCollection('courses', function (collectionApi) {
    return collectionApi.getFilteredByTags('course', 'full', 'short');
  });

  // create a catalog collection combining courses, tutorials, webinars
  eleventyConfig.addCollection("catalog", (collection) => {
    const allCollections = collection.getAll()[0];
    if (typeof allCollections !== "undefined" && allCollections !== null) {
      const courses = collection.getAll()[0]?.data?.courses;
      const tutorials = collection.getAll()[0]?.data?.tutorials;
      const livestreams = collection.getAll()[0]?.data?.livestreams;
      const webinars = collection.getAll()[0]?.data?.webinars;
      const catalog = { ...courses, ...tutorials, ...livestreams, ...webinars };
      return catalog;
    } else {
      return false;
    }
  });

  // Get all static pages and perform intentional exclusions by directory
  eleventyConfig.addCollection("static", function (collectionApi) {
    let col = collectionApi.getFilteredByGlob("**/pages/**/**.{njk,html,md}");

    return col.filter((item) => {
      if (
        !item.page.filePathStem.startsWith("/pages/courses/") &&
        !item.page.filePathStem.startsWith("/pages/tutorials/") &&
        !item.page.filePathStem.startsWith("/pages/webinars/") &&
        !item.page.filePathStem.startsWith("/pages/privacy-policy/")
      ) {
        return item;
      }
    });
  });

  eleventyConfig.addCollection("privacy", function (collectionApi) {
    let col = collectionApi.getFilteredByGlob("**/pages/**/**.{njk,html,md}");

    return col.filter((item) => {
      if (item.page.filePathStem.startsWith("/pages/privacy-policy/")) {
        return item;
      }
    });
  });

  // bios collections
  eleventyConfig.addCollection("bios", function (collection) {
    const allCollections = collection.getAll()[0];
    if (typeof allCollections !== "undefined" && allCollections !== null) {
      const col = Object.values(collection.getAll()[0].data.bios).filter(
        (item) => {
          return item.exclude ? false : item;
        }
      );
      return col;
    } else {
      return false;
    }
  });

  // this is our `hub pages` collection
  eleventyConfig.addCollection("collection", function (collection) {
    const allCollections = collection.getAll()[0];
    if (typeof allCollections !== "undefined" && allCollections !== null) {
      const col = Object.values(collection.getAll()[0].data.collection).filter(
        (item) => {
          return item.exclude ? false : item;
        }
      );
      return col;
    } else {
      return false;
    }
  });

  // return only live full courses
  eleventyConfig.addCollection("live_courses_full", function (collection) {
    const allCollections = collection.getAll()[0];
    if (typeof allCollections !== "undefined" && allCollections !== null) {
      const col = Object.values(collection.getAll()[0].data.courses).filter(
        (item) => {
          const bool = item.type === "full" && item.live;
          return bool ? item : false;
        }
      );
      return col;
    } else {
      return false;
    }
  });

  // return only live short courses
  eleventyConfig.addCollection("live_courses_short", function (collection) {
    const allCollections = collection.getAll()[0];
    if (typeof allCollections !== "undefined" && allCollections !== null) {
      const col = Object.values(collection.getAll()[0].data.courses).filter(
        (item) => {
          const bool = item.type === "short" && item.live;
          return bool ? item : false;
        }
      );
      return col;
    } else {
      return false;
    }
  });

  // return only live tutorials
  eleventyConfig.addCollection("live_tutorials", function (collection) {
    const allCollections = collection.getAll()[0];
    if (typeof allCollections !== "undefined" && allCollections !== null) {
      const col = Object.values(collection.getAll()[0].data.tutorials).filter(
        (item) => {
          const bool = item.type === "tutorial" && item.live;
          return bool ? item : false;
        }
      );
      return col;
    } else {
      return false;
    }
  });

}
