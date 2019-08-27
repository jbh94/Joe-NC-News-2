const { expect } = require('chai');
const {
  formatDates,
  makeRefObj,
  formatComments
} = require('../db/utils/utils');

describe('formatDates', () => {
  it('should take an empty array of objects and return a new array', () => {
    const input = [];
    expect(formatDates(input)).to.eql([]);
  });
  it('should take a JavaScript date object and change it to a readable date object', () => {
    const list = [{ created_at: 1542284514171 }];
    const expectedResult = [{ created_at: new Date(1542284514171) }];
    expect(formatDates(list)).to.eql(expectedResult);
  });
  it('should take an array of an object from articles and return a new date under "created at" key', () => {
    const input = [
      {
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: 1542284514171,
        votes: 100
      }
    ];
    const expectedResult = [
      {
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: new Date(1542284514171),
        votes: 100
      }
    ];
    expect(formatDates(input)).to.eql(expectedResult);
  });
  it('the new date object should not mutate the original list', () => {
    const input = [
      {
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: 1542284514171,
        votes: 100
      }
    ];
    const newArray = [
      {
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: new Date(1542284514171),
        votes: 100
      }
    ];
    formatDates(input);
    expect(formatDates(input)).to.not.equal(newArray);
  });
});

describe('makeRefObj', () => {
  it('should return a reference object when passed in array of lists', () => {
    const input = [];
    expect(makeRefObj(input)).to.eql({});
  });
  it('returns a reference object when passed an array of one objects with the title property as a key and artist_id as a value', () => {
    let input = [
      {
        article_id: 1,
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: 1542284514171,
        votes: 100
      }
    ];
    let actualResult = makeRefObj(input);
    expect(actualResult).to.eql({ 'Living in the shadow of a great man': 1 });
  });
  it('returns a reference object when passed an array of multiple objects with the title property as a key and artist_id as a value', () => {
    let input = [
      {
        article_id: 1,
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: 1542284514171,
        votes: 100
      },
      {
        article_id: 2,
        title: 'Sony Vaio; or, The Laptop',
        topic: 'mitch',
        author: 'icellusedkars',
        body:
          'Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.',
        created_at: 1416140514171
      },
      {
        article_id: 3,
        title: 'Eight pug gifs that remind me of mitch',
        topic: 'mitch',
        author: 'icellusedkars',
        body: 'some gifs',
        created_at: 1289996514171
      }
    ];
    let actualResult = makeRefObj(input);
    expect(actualResult).to.eql({
      'Living in the shadow of a great man': 1,
      'Sony Vaio; or, The Laptop': 2,
      'Eight pug gifs that remind me of mitch': 3
    });
  });
});

describe('formatComments', () => {
  it('returns an empty array if an empty array is passed on', () => {
    const input = [];
    expect(formatComments(input)).to.eql([]);
  });
  it('does not mutate the orginal array', () => {
    const input = [
      {
        article_id: 1,
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: 'butter_bridge',
        votes: 16,
        created_at: 1511354163389
      }
    ];
    const refObj = { 'Living in the shadow of a great man': 1 };
    const actual = formatComments(input, refObj);
    expect(actual).to.not.equal([
      {
        article_id: 1,
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: 'butter_bridge',
        votes: 16,
        created_at: 1511354163389
      }
    ]);
  });
  it('returns an array of single object with its created_by property renamed to an author key, belongs_to renamed to an article_id key, value of article_id corresponds to original title value and its created_at value converted into a JavaScript date object', () => {
    const input = [
      {
        article_id: 1,
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: 'butter_bridge',
        votes: 16,
        created_at: 1511354163389
      }
    ];
    const expectedResult = [
      {
        article_id: 1,
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        author: 'butter_bridge',
        votes: 16,
        created_at: new Date(1511354163389)
      }
    ];
    const refObj = { 'Living in the shadow of a great man': 1 };
    expect(formatComments(input, refObj)).to.eql(expectedResult);
  });
  it('should return an array of multiple objects with the above specifications', () => {
    const input = [
      {
        article_id: 1,
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: 'butter_bridge',
        votes: 16,
        created_at: 1511354163389
      },
      {
        article_id: 2,
        body:
          'The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.',
        belongs_to: 'Living in the shadow of a great man',
        created_by: 'butter_bridge',
        votes: 14,
        created_at: 1479818163389
      },
      {
        article_id: 3,
        body:
          'Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.',
        belongs_to: 'Living in the shadow of a great man',
        created_by: 'icellusedkars',
        votes: 100,
        created_at: 1448282163389
      }
    ];
    const expectedResult = [
      {
        article_id: 1,
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        author: 'butter_bridge',
        votes: 16,
        created_at: new Date(1511354163389)
      },
      {
        article_id: 2,
        body:
          'The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.',
        author: 'butter_bridge',
        votes: 14,
        created_at: new Date(1479818163389)
      },
      {
        article_id: 3,
        body:
          'Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.',
        author: 'icellusedkars',
        votes: 100,
        created_at: new Date(1448282163389)
      }
    ];
    const refObj = { 'Living in the shadow of a great man': 1 };
    expect(formatComments(input, refObj)).to.eql(expectedResult);
  });
});
