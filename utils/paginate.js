/**
 * @typedef {Object} Page
 * @property {number} total - Number of data items to fetch.
 * @property {Object[]} data - Any array of data items.
 */

/**
 * Higher order function for recursively querying an endpoint with pagination
 * until all pages have been fetched.
 * @param {function} fn 
 * @param {Object} options
 * @param {number} page
 * @param {number} pageSize
 * @returns {Page[]} pages
 */
const paginate = async (fn, options) => {
  const page = await fn(options);

  if (page.total < (options.page * options.pageSize)) {
    return [page];
  }

  const remainingPages = await paginate(fn, {
    page: options.page + 1,
    pageSize: options.pageSize,
  })

  return [page, ...remainingPages];
}

module.exports = paginate;