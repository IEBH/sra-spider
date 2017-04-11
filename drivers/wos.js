/**
* sra-spider driver for web of science
*/

var _ = require('lodash');
var async = require('async-chainable');
var superagent = require('superagent');
var webOfScience = require('/media/LinuxSSD/Projects/Node/web-of-science/index.js');

module.exports = function(spider) {
	var driver = {};

	driver.id = 'wos',
	driver.description = 'sra-spider driver for Web of Science',
	driver.url = 'http://apps.webofknowledge.com',
	driver.wos;

	/**
	* Find all citations for a given DOI document
	* @param {string} doi The DOI to find citations for
	* @param {Object} options Options to use when scanning
	* @param {Object} options.wos Web of science specific options
	* @param {string} options.wos.user The username to login to WoS with
	* @param {string} options.wos.pass The username to login to WoS with
	* @param {function} cb The callback to call on completion, this will be given an error return and a Set of dois
	*/
	driver.fetchCites = function(doi, options, cb) {
		async()
			// Init web of science instance {{{
			.then(function(next) {
				if (!driver.wos) {
					driver.wos = new webOfScience(options.wos);
				}
				next();
			})
			// }}}
			// Sanity checks {{{
			.then(function(next) {
				if (!_.get(options, 'wos.user') || !_.get(options, 'wos.pass')) return next('No WoS login credentials supplied');
				next();
			})
			// }}}
			.set('doc', this.doc)
			// Look up the  from the DOI {{{
			.then('wosID', function(next) {
				driver.wos.doiToWosID(doi, next);
			})
			// }}}
			// Fetch the citations {{{
			.then('cites', function(next) {
				driver.wos.cited(this.wosID, next);
			})
			.then('cites', function(next) {
				console.log(require('util').inspect(this.cites.results, {depth: null, colors: true}))
				next(null, this.cites.results);
			})
			// }}}
			// Translate wosIDID results back into DOIs {{{
			.map('cites', 'cites', function(next, cite) {
				console.log('CONVERT', cite.wosID);
				driver.wos.wosIDToDoi(cite.wosID, function(err, doi) {
					if (err) {
						next('Error converting wosID "' + cite.wosID + '" (Title: "' + cite.title + '") - ' + err.toString());
					} else {
						next(null, doi);
					}
				});
			})
			// }}}
			// End {{{
			.end(function(err) {
				if (err) return cb(err);
				cb(null, this.output);
			});
			// }}}
	};

	return driver;
};
