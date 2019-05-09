const fs = require('fs');
const spider = require('.');

const citations = [
  { pmid: '19826172' }
]

const scenario = async () => {
  const spideredCitations = await spider.spiderCitations(citations, {
    directions: ['backwards', 'forwards'],
    drivers: [
      {
        database: 'europepmc',
      },
      {
        database: 'scopus',
        config: {
          apiKey: '',
        }
      }
    ]
  })

  return spideredCitations;
}

scenario().then((spideredCitations) =>{
  fs.writeFileSync('./scenario-output.json', JSON.stringify({
    original: citations, 
    spidered: spideredCitations,
  }));
}).catch(console.log);