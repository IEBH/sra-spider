var expect = require('chai').expect;
var mlog = require('mocha-logger');
var sraSpider = require('..');

describe('europePMC driver', function() {
	var config = require('./config');

	var spider;
	before(()=> { spider = new sraSpider() })
	before(()=> spider.set(config) )
	before(()=> spider.drivers(['europePMC']) )

	it('should be able to translate a DOI into a EPMCID', function(done) {
		spider._drivers.europePMC.getEPMCIDfromDOI('10.3322/caac.20107', function(err, epmcid) {
			expect(err).to.be.not.ok;
			expect(epmcid).to.equal('MED/21296855');
			done();
		});
	});

	it('should be able to translate EPMCIDs into a DOI', function(done) {
		spider._drivers.europePMC.getDOIfromEPMCID('MED/21296855', function(err, epmcid) {
			expect(err).to.be.not.ok;
			expect(epmcid).to.equal('10.3322/caac.20107');
			done();
		});
	});

	it('should fetch all spidered DOIs', function(done) {
		this.timeout(60 * 1000);
		spider
			.on('pmidInvalid', id => mlog.log('Invalid PMID: ' + id))
			.exec('10.3322/caac.20107', function(err, doiSet) {
				expect(err).to.be.not.ok;
				expect(doiSet).to.be.an.array;
				var dois = Array.from(doiSet);
				expect(dois).to.have.length.above(0);
				done();
			});
	});

	it('should fetch all spidered DOIs (no cites available)', function(done) {
		this.timeout(60 * 1000);
		spider
			.on('pmidInvalid', id => mlog.log('Invalid PMID: ' + id))
			.exec('10.1037/0003-066X.59.1.29', function(err, doiSet) {
				expect(err).to.be.not.ok;
				expect(doiSet).to.be.an.array;
				var dois = Array.from(doiSet);
				expect(dois).to.have.length.above(0);
				done();
			});
	});

});
