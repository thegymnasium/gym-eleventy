export default function collectionz(eleventyConfig) {

  eleventyConfig.addCollection('catalog', (collection, arg) => {
    return collection.getAll()[0].data.catalog;
  });

  eleventyConfig.addCollection('static', (collection, arg) => {
    console.log(collection.getAll()[0]);
    // return collection.getAll()[0].data.catalog;
  });

  eleventyConfig.addCollection('courses', function (collectionApi) {
    return collectionApi.getFilteredByTags('course', 'full', 'short');
  });

}
