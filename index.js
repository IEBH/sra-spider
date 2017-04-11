var _ = require('lodash');
var async = require('async-chainable');
var argy = require('argy');
var crossref = require('crossref');
var events = require('events');
var util = require('util');

function Spider() {
	var spider = this;


	/**
	* Default options to use for any function that requires them
	* @var {Object}
	*/
	spider.defaults = {
		exec: {
			skipPopulate: false,
		},
		populate: {
			errOnFail: false, // Return an error if we fail to populate, else emit 'errorDOI' with the failed string
		},
	};

	/**
	* Set various settings
	* @return {Object} This chainable object
	*/
	spider.set = function(options) {
		_.merge(spider.defaults, options);
		return spider;
	};


	/**
	* Enabled drivers
	* Each of these will be an object
	* See the ./drivers folder for some examples
	* @var {array}
	*/
	spider.drivers = [ // FIXME: These shouldn't be hard coded
		// require('./drivers/europepmc')(spider),
		require('./drivers/wos')(spider),
	];


	/**
	* Fetch a single DOI as a callback
	* This function is really just a stub for `crossref.work(DOI, cb)` but it also standarizes the keys into camelcase
	* To populate a large number of DOIs use the populate() function
	* @param {string} doi The DOI to fetch
	* @param {function} cb The callback to call on completion
	* @return {Spider} This chainable object
	* @see populate()
	*/
	spider.getDOI = function(doi, cb) {
		crossref.work(doi, function(err, doc) {
			if (err) return cb(err);
			cb(null, _.mapKeys(doc, (v, k) => _.camelCase(k)));
		});
		return this;
	};


	/**
	* Take a single or array of records and ensure that each is a valid DOI record
	* Any strings are looked up via online reference
	* @param {string|array|Object} doi Either the DOI of a paper (in which case getDOI is called beforehand) or the document returned from getDOI previously or an array of either
	* @param {Object} [options] Options to use which override the defaults
	* @param {boolean} [options.populate.errOnFail=false] Whether to return an error in the callback if any DOI fails to populate, otherwise errorDOI is emitted
	* @param {function} cb The callback to call on completion
	* @return {Spider} This chainable object
	* @emits populated Emitted when a string gets populated into an object
	* @emits errorDOI Emitted with the failed DOI lookup if options.populate.errOnFail is false
	*/
	spider.populate = function(dois, options, cb) {
		var settings = _.assign({}, spider.defaults, options);
		var output = [];

		async()
			.forEach(_.isArray(dois) ? dois : [dois], function(next, doi) {
				if (_.isObject(doi)) { // Assume its already populated
					output.push(doi);
					next();
				} else if (_.isString(doi)) {
					spider.getDOI(doi, function(err, doc) {
						if (err) {
							if (_.get(settings, 'populate.errOnFail')) {
								next('Failed to populate DOI ' + doi);
							} else {
								spider.emit('errorDOI', doi);
								next();
							}
						} else {
							spider.emit('populated', doc);
							output.push(doc);
							next();
						}
					});
				}
			})
			.end(function(err) {
				if (err) return cb(err);
				cb(null, output);
			});
	};


	/**
	* Execute all spidering stages using either provided or default options
	* @param {string|array} doi Either the DOI of a paper or an array of DOIs
	* @param {Object} [options] Options to use which override the defaults
	* @param {boolean} [options.exec.skipPopulate=false] Whether to skip the populate stage - do this only if you are sure all input elements are already populated
	* @param {function} cb The callback to call on completion as (err, cites Set)
	* @return {Spider} This chainable object
	* @emits citesFound Emitted when citations are found for a given doi record. Called as (driverId, doi, doiCites Set)
	*/
	spider.exec = argy('string|array [object] function', function(doi, options, cb) {
		var settings = _.assign({}, spider.defaults, options);
		var foundCites = new Set(); // Object lookup of cites we found, the key in each case is the DOI, the value being the DOI document

		async()
			// For each DOI, ask each driver for the citations {{{
			.forEach(_.castArray(doi), function(next, doi) {
				async()
					.forEach(spider.drivers, function(nextDriver, driver) {
						driver.fetchCites(doi, settings, function(err, doiCites) {
							if (err) return nextDriver(err);
							if (!doiCites || !doiCites.size) return nextDriver();
							spider.emit('citesFound', driver.id, doi, doiCites);
							doiCites.forEach(doiCite => foundCites.add(doiCite));
							nextDriver();
						});
					})
					.end(next);
			})
			// }}}
			// End {{{
			.end(function(err) {
				if (err) return cb(err);
				cb(null, foundCites);
			});
			// }}}
		return this;
	});

	return spider;
}

util.inherits(Spider, events.EventEmitter);

module.exports = new Spider();
