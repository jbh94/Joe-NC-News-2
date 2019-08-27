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
      it('Status 200: Return a response object of an article for the passed in id', () => {
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
      it('Status 200: Return a response object of a passed article_id, when a negative updated votes object is sent', () => {
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

  describe('/articles/:article_id/comments', () => {
    describe('METHOD NOT ALLOWED', () => {
      it('Status 405: Return a message if the wrong method is used on this endpoint', () => {
        const invalidMethods = ['put', 'delete', 'patch'];
        const returnError = invalidMethods.map(method => {
          return request(app)
            [method]('/api/articles/1/comments')
            .expect(405);
        });
        return Promise.all(returnError);
      });
    });
    describe('POST', () => {
      it('Status 201: Returns a response object of the posted comment', () => {
        return request(app)
          .post('/api/articles/1/comments')
          .send({ username: 'butter_bridge', body: 'Worlds best comment' })
          .expect(201)
          .then(({ body }) => {
            expect(body.comment).to.have.all.keys(
              'comment_id',
              'author',
              'article_id',
              'votes',
              'created_at',
              'body'
            );
            expect(body.comment).to.be.an('object');
            expect(body.comment.article_id).to.equal(1);
            expect(body.comment.body).to.equal('Worlds best comment');
          });
      });
      it('Status 422: Returns a messge if the passed in id is an unprocessable entity', () => {
        return request(app)
          .post('/api/articles/1000/comments')
          .send({ username: 'butter_bridge', body: 'Worlds best comment' })
          .expect(422)
          .then(({ body }) => {
            expect(body.msg).to.equal('Unprocessable entity!');
          });
      });
      it('Status 400: Returns a message if the passed in id is a bad request', () => {
        return request(app)
          .post('/api/articles/cat/comments')
          .send({ username: 'butter_bridge', body: 'World best comment' })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal('Bad request!');
          });
      });
      it('Status 404: Returns a message if the passed endpoint is incorrect', () => {
        return request(app)
          .post('/api/articles/1/wrongpath')
          .send({ username: 'butter_bridge', body: 'Worlds best comment' })
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal('Route not found!');
          });
      });
    });

    describe('GET', () => {
      it('Status 200: Returns an array of comments for the passed article_id', () => {
        return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments[0]).to.have.all.keys(
              'article_id',
              'comment_id',
              'votes',
              'created_at',
              'author',
              'body'
            );
            expect(body.comments).to.have.length(13);
            expect(body.comments).to.be.an('array');
            expect(body.comments[0]).to.be.an('object');
          });
      });
      it('Status 400: Returns an message when the passed article_id is a bad request', () => {
        return request(app)
          .get('/api/articles/cat/comments')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal('Bad request!');
          });
      });
      it('Status 404: Returns a message when there are no comments to return for the passed in article_id', () => {
        return request(app)
          .get('/api/articles/100000/comments')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal('Comment not found!');
          });
      });
    });
  });

  describe('/api/articles/', () => {
    describe('GET', () => {
      it('Status 200: Returns a response articles array of article objects', () => {});
    });
  });
});
