var _ = require('lodash');
var async = require('async-chainable');
var superagent = require('superagent');

module.exports = function(spider) {
	var driver = {};

	driver.id = 'europePMC',
	driver.description = 'sra-spider driver for EuropePMC',
	driver.url = 'http://www.ebi.ac.uk/europepmc',


	/**
	* Utility function to get the Europe PMC ID from the DOI
	* This is usually in the form of DOMAIN/PubMedID
	* @param {string} doi The DOI to translate
	* @param {function} cb The callback to call on completion
	*/
	driver.getEPMCIDfromDOI = function(doi, cb) {
		superagent.get('http://www.ebi.ac.uk/europepmc/webservices/rest/search')
			.query({
				format: 'json',
				query: 'doi:' + doi,
			})
			.end(function(err, res) {
				if (err) return cb(err);
				if (res.statusCode != 200) return cb('Response code ' + res.statusCode);
				var doc = _.get(res.body, 'resultList.result.0');
				cb(null, doc.source + '/' + doc.id);
			});
	};


	/**
	* Utility function to get the DOI from a Europe PMC ID
	* @param {string} epmcid The Europe PMC ID to translate
	* @param {function} cb The callback to call on completion
	*/
	driver.getDOIfromEPMCID = function(epmcid, cb) {
		superagent.get('https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/')
			.query({
				tool: 'my_tool',
				email: 'my_email@example.com',
				format: 'json',
				ids: epmcid,
			})
			.end(function(err, res) {
				if (err) return cb(err);
				if (_.isEmpty(res.body) || !res.body.records || !res.body.records.length) return cb('Invalid response while trying to find PMID ' + cite.id);
				var doc = res.body.records[0];
				if (doc && doc.doi) {
					cb(null, doc.doi);
				} else {
					cb('Cannot convert EMPCID "' + epmcid + '" into a DOI');
				}
			});
	};


	/**
	* Find all citations for a given DOI document
	* @param {string} doi The DOI to find citations for
	* @param {Object} options Options to use when scanning
	* @param {function} cb The callback to call on completion, this will be given an error return and a Set of dois
	* @emits pmidInvalid Emitted if the EPMCID cannot be translated back into a DOI. Called with (epmcid, fullCitation)
	*/
	driver.fetchCites = function(doi, options, cb) {
		async()
			.set('doc', this.doc)
			// Look up the epmcID from the DOI {{{
			.then('epmcId', function(next) {
				driver.getEPMCIDfromDOI(doi, next);
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
			// Translate europePMC ID results back into DOIs {{{
			.set('output', new Set())
			.forEach('cites', function(next, cite) {
				var output = this.output;
				driver.getDOIfromEPMCID(cite.id, function(err, doi) {
					if (err) {
						spider.emit('pmidInvalid', cite.id, cite);
					} else {
						output.add(doi);
					}
					next();
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
