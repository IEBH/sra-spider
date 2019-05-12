### SRA SPIDER

This module is part of the [Bond University Centre for Research in Evidence-Based Practice](https://github.com/CREBP) Systematic Review Assistant suite of tools.

The purpose of spider is to find backward and forward citations for a given citation.

## Supported sources

Sources can be found in the ```./drivers``` directory.

* **Europepmc**
* **Scopus**

## Spider API

### spider.spiderCitations

spider.spiderCitations(citations, options)

Takes a list of citations and returns a promise with a merged list of backwards and forwards citations across all citations.

Options: 
* **directions** - A list of the directions to use (backwards or forwards).
* **drivers** - A list of the drivers to use.

Example:
```sh
  const spider = require('sra-spider');

  const citations = [
    { doi: '10.1016/S0092-8674(00)81683-9' },
  ];

  const options = {
    directions: ['backwards', 'forwards'],
    drivers: [
      { database: 'europepmc' },
      {
        database: 'scopus',
        config: {
          apiKey: '',
        }
      }
    ]
  };

  const spideredCitations = await spider.spiderCitations(citations, options);
```

## Driver API

Drivers are orchestrated by the forager. Each driver implements the same interface.

### driver.spiderCitation

driver.spiderCitation(citation, options);

Takes a single citation and returns a promise with a merged list of backwards and forwards citations.

Options: 
* **directions** - A list of the directions to use (backwards or forwards).


Example:
```sh
  const spider = require('sra-spider');

  const citation = { doi: '10.1016/S0092-8674(00)81683-9' };

  const options = {
    directions: ['backwards', 'forwards'],
  };

  const spideredCitations = await driver.spiderCitation(citation, options);
```