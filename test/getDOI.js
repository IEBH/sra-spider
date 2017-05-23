var expect = require('chai').expect;
var mlog = require('mocha-logger');
var sraSpider = require('..');

describe('getDOI()', function() {

	var spider;
	before(()=> { spider = new sraSpider() })

	it('should fetch a DOI', function(done) {
		spider.getDOI('10.1037/0003-066X.59.1.29', function(err, doc) {
			expect(err).to.be.not.ok;
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

});
