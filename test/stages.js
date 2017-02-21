var expect = require('chai').expect;
var mlog = require('mocha-logger');
var spider = require('..');

describe('Stage breakdown', function() {

	var doc;
	it('should fetch a DOI', function(done) {
		spider.getDOI('10.1037/0003-066X.59.1.29', function(err, res) {
			expect(err).to.be.not.ok;
			doc = res;
			expect(doc).to.be.an.object;
			expect(doc).to.have.property('title');
			expect(doc.title).to.deep.equal(['How the Mind Hurts and Heals the Body.']);
			expect(doc).to.have.property('doi', '10.1037/0003-066x.59.1.29');
			expect(doc).to.have.property('publisher', 'American Psychological Association (APA)');
			expect(doc).to.have.property('type', 'journal-article');
			expect(doc).to.have.property('page', '29-40');

			expect(doc).to.have.property('author');
			expect(doc.author).to.deep.equal([
				{given: 'Oakley', family: 'Ray', affiliation: []},
			]);

			expect(doc).to.have.property('issn');
			expect(doc.issn).to.deep.equal(['1935-990X', '0003-066X']);

			done();
		});
	});

	it('should fetch all spidered DOIs', function(done) {
		this.timeout(60 * 1000);
		spider
			.on('pmid-invalid', id => mlog.log('Invalid PMID: ' + id))
			.exec('10.1037/0003-066X.59.1.29', function(err, dois) {
				expect(err).to.be.not.ok;
				expect(dois).to.be.an.array;
				done();
			});
	});

});
