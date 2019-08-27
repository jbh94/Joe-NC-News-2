process.env.NODE_ENV = 'test';
const chai = require('chai');
const { expect } = require('chai');
const chaiSorted = require('chai-sorted');
chai.use(chaiSorted);
const request = require('supertest');
const app = require('../app');
const connection = require('../db/connection');

describe('/api', () => {
  beforeEach(() => {
    return connection.seed.run();
  });
  after(() => {
    return connection.destroy();
  });

  it('Status 200: API Router', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).to.equal('You have reached the API router!');
      });
  });
  it('Status 404: Return a message if an incorrect route is passed', () => {
    return request(app)
      .get('/api/route-not-found')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).to.equal('Route not found!');
      });
  });

  describe('/topics', () => {
    describe('METHOD NOT ALLOWED', () => {
      it('Status 405: Return a message if the wrong method is used on this endpoint', () => {
        const invalidMethods = ['put', 'delete', 'patch', 'post'];
        const returnError = invalidMethods.map(method => {
          return request(app)
            [method]('/api/topics')
            .expect(405);
        });
        return Promise.all(returnError);
      });
    });
    describe('GET', () => {
      it('Status 200: Return a response object with a suitable key name', () => {
        return request(app)
          .get('/api/topics')
          .expect(200)
          .then(({ body }) => {
            expect(body.topics[0]).to.be.an('object');
            expect(body.topics[0]).to.have.keys('slug', 'description');
          });
      });
    });
  });

  describe('/users/:username', () => {
    describe('METHOD NOT ALLOWED', () => {
      it('Status 405: Return a message if the wrong method is used on this endpoint', () => {
        const invalidMethods = ['put', 'delete', 'patch', 'post'];
        const returnError = invalidMethods.map(method => {
          return request(app)
            [method]('/api/users/:username')
            .expect(405);
        });
        return Promise.all(returnError);
      });
    });
    describe('GET', () => {
      it('Status 200: Return a response object with a suitable key name for the passed in user', () => {
        return request(app)
          .get('/api/users/butter_bridge')
          .expect(200)
          .then(({ body }) => {
            expect(body.user).to.eql({
              username: 'butter_bridge',
              name: 'jonny',
              avatar_url:
                'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg'
            });
            expect(body.user).to.be.an('object');
            expect(body.user).to.have.keys('username', 'name', 'avatar_url');
          });
      });
      it('Status 404: Return a message if an incorrect route is passed', () => {
        return request(app)
          .get('/api/users/wrong-username')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.eql('Username not found!');
          });
      });
    });
  });

  describe('/articles/:article_id', () => {
    describe('METHOD NOT ALLOWED', () => {
      it('Status 405: Return a message if the wrong method is used on this endpoint', () => {
        const invalidMethods = ['put', 'delete'];
        const returnError = invalidMethods.map(method => {
          return request(app)
            [method]('/api/articles/:article_id')
            .expect(405);
        });
        return Promise.all(returnError);
      });
    });
    describe('GET', () => {
      it('Status 200: Return a reponse object of an article for the passed in id', () => {
        return request(app)
          .get('/api/articles/1')
          .expect(200)
          .then(({ body }) => {
            expect(body.article).to.be.an('object');
            expect(body.article).to.have.keys(
              'article_id',
              'title',
              'body',
              'votes',
              'topic',
              'author',
              'created_at',
              'comment_count'
            );
            expect(body.article.article_id).to.equal(1);
          });
      });
      it('Status 404: Return a message if an incorrect route is passed', () => {
        return request(app)
          .get('/api/articles/1000')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.eql('Article not found!');
          });
      });
      it('Status 400: Return a message if passed a bad article_id', () => {
        return request(app)
          .get('/api/articles/dog')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.eql('Bad request!');
          });
      });
    });
    describe('PATCH', () => {
      it('Status 200: Return a response object of a passed article_id, with an updated votes object', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 1 })
          .expect(200)
          .then(({ body }) => {
            expect(body.article.votes).to.equal(101);
          });
      });
      it('Status 200: Return a response object of a passed article_id, when an updated votes object is sent and handles negative values', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: -100 })
          .expect(200)
          .then(({ body }) => {
            expect(body.article.votes).to.equal(0);
          });
      });
      it('Status 400: Return a message if a bad request is sent on the inc_votes object', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 'cats' })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal('Bad request!');
          });
      });
      it('Status 400: Return a message if a different bad request is sent on the inc_votes object', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 'cats', name: 'Mitch' })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal('Bad request!');
          });
      });
    });
  });
});
