var _ = require('lodash');
var async = require('async-chainable');
var argy = require('argy');
var crossref = require('crossref');
var events = require('events');
var superagent = require('superagent');
var util = require('util');

function Spider() {
	var spider = this;


	/**
	* Default options to use for any function that requires them
	* @var {Object}
	*/
	spider.defaults = {
		europePMC: {
			translate: true,
		},
	};


	/**
	* Fetch a single DOI as a callback
	* This function is really just a stub for `crossref.work(DOI, cb)` but it also standarizes the keys into camelcase
	* @param {string} doi The DOI to fetch
	* @param {function} cb The callback to call on completion
	* @return {Spider} This chainable object
	*/
	spider.getDOI = function(doi, cb) {
		crossref.work(doi, function(err, doc) {
			if (err) return cb(err);
			cb(null, _.mapKeys(doc, (v, k) => _.camelCase(k)));
		});
		return this;
	};


	/**
	* Fetch all forward references - that is all DOIs cited by the given DOI / document
	* @param {string|Object} doi Either the DOI of a paper (in which case getDOI is called beforehand) or the document returned from getDOI previously
	* @param {Object} [options] Options to use which override the defaults
	* @param {function} cb The callback to call on completion
	* @return {Spider} This chainable object
	*/
	spider.fetchForward = argy('string|object [object] function', function(doi, options, cb) {
		var settings = _.assign({}, spider.defaults, options);

		async()
			// Fetch paper if given a string {{{
			.then('doc', function(next) {
				if (_.isObject(doi)) return next(null, doi);
				spider.getDOI(doi, next);
			})
			// }}}
			// Fetch forward DOIs {{{
			.parallel({
				europePMC: function(next) {
					async()
						.set('doc', this.doc)
						// Look up the epmcID from the DOI {{{
						.then('epmcId', function(next) {
							superagent.get('http://www.ebi.ac.uk/europepmc/webservices/rest/search')
								.query({
									format: 'json',
									query: 'doi:' + this.doc.doi,
								})
								.end(function(err, res) {
									if (err) return next(err);
									if (res.statusCode != 200) return next('Response code ' + res.statusCode);
									var doc = _.get(res.body, 'resultList.result.0');
									next(null, doc.source + '/' + doc.id);
								});
						})
						// }}}
						// Fetch the citations {{{
						.then('cites', function(next) {
							// FIXME: Make this iterate
							var page = 1;
							var pageSize = 1000;

							superagent.get('http://www.ebi.ac.uk/europepmc/webservices/rest/' + this.epmcId + '/citations/' + page + '/' + pageSize + '/json')
								.end(function(err, res) {
									if (err) return next(err);
									if (res.statusCode != 200) return next('Response code ' + res.statusCode);
									next(null, res.body.citationList.citation);
								});
						})
						// }}}
						// Optionally translate europePMC results back into CrossRef results {{{
						.then(function(next) {
							if (!settings.europePMC.translate) return next();

							var output = [];
							async()
								.forEach(this.cites, function(next, cite) {
									superagent.get('https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/')
										.query({
											tool: 'my_tool',
											email: 'my_email@example.com',
											format: 'json',
											ids: cite.id,
										})
										.end(function(err, res) {
											if (err) return next(err);
											if (_.isEmpty(res.body) || !res.body.records || !res.body.records.length) return next('Invalid response while trying to find PMID ' + cite.id);
											var doc = res.body.records[0];
											if (doc.doi) {
												console.log('Translated', cite.id, doc.doi);
												output.push(doc);
											} else {
												spider.emit('pmid-invalid', cite.id);
											}
											next();
										});
								})
								.end(function(err) {
									if (err) return next(err);
									next(null, output);
								});
						})
						// }}}
						.end(function(err) {
							if (err) return next(err);
							next(null, this.cites);
						});
				},
			})
			// }}}
			// End {{{
			.end(function(err) {
				if (err) return cb(err);
				cb(null, this.europePMC);
			});
			// }}}
		return this;
	});


	/**
	* Execute all spidering stages using either provided or default options
	* @param {Object} [options] Options to use which override the defaults
	* @param {function} cb The callback to call on completion
	* @return {Spider} This chainable object
	*/
	spider.exec = argy('[object] function', function(options, cb) {
		var settings = _.assign({}, spider.defaults, options);
	});

	return spider;
}

util.inherits(Spider, events.EventEmitter);

module.exports = new Spider();
