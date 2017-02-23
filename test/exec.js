var expect = require('chai').expect;
var mlog = require('mocha-logger');
var spider = require('..');

describe('exec()', function() {

	it('should fetch all spidered DOIs', function(done) {
		this.timeout(60 * 1000);
		spider
			.on('pmidInvalid', id => mlog.log('Invalid PMID: ' + id))
			.exec('10.1097/MCG.0000000000000359', function(err, doiSet) {
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
