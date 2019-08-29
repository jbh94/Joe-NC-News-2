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
        const invalidMethods = ['put', 'patch'];
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
      it('Status 422: Returns a message if the passed in id is an unprocessable entity', () => {
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
      // it('Status 400: Returns a message if the posted object is empty', () => {
      //   return request(app)
      //     .post('/api/articles/1/comments')
      //     .send({})
      //     .expect(400)
      //     .then(({ body }) => {
      //       expect(body.msg).to.equal('Comment failed to post!');
      //     });
      // });
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
    describe('SORT BY', () => {
      it('Status 200: Returns a response of comments sorted descendingly by comment_id', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=comment_id')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.sortedBy('comment_id', {
              descending: true
            });
          });
      });
      it('Status 200: Returns a response of comments sorted descendingly by created_at', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=created_at')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.sortedBy('created_at', {
              descending: true
            });
          });
      });
      it('Status 200: Returns a response of comments sorted descendingly by votes', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=votes')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.sortedBy('votes', {
              descending: true
            });
          });
      });
      it('Status 200: Returns a response of comments sorted descendingly by author', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=author')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.sortedBy('author', {
              descending: true
            });
          });
      });
      it('Status 200: Returns a response of comments sorted descendingly by body', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=body')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.sortedBy('body', {
              descending: true
            });
          });
      });
    });
    describe('ORDER', () => {
      it('Status 200: Returns a response of comments ordered by default to descending by comment_id', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=comment_id')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.descendingBy('comment_id');
          });
      });

      it('Status 200: Returns a response of comments ordered descendingly by comment_id', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=comment_id&order=desc')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.descendingBy('comment_id');
          });
      });
      it('Status 200: Returns a response of comments ordered descendingly by votes', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=votes&order=desc')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.descendingBy('votes');
          });
      });
      it('Status 200: Returns a response of comments ordered descendingly by created_at', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=created_at&order=desc')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.descendingBy('created_at');
          });
      });
      it('Status 200: Returns a response of comments ordered descendingly by author', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=author&order=desc')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.descendingBy('author');
          });
      });
      it('Status 200: Returns a response of comments ordered descendingly by body', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=body&order=desc')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.descendingBy('body');
          });
      });
      it('Status 200: Returns a response of comments ordered ascendingly by comment_id', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=comment_id&order=desc')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.descendingBy('comment_id');
          });
      });
      it('Status 200: Returns a response of comments ordered ascendingly by votes', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=votes&order=asc')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.ascendingBy('votes');
          });
      });
      it('Status 200: Returns a response of comments ordered ascendingly by created_at', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=created_at&order=asc')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.ascendingBy('created_at');
          });
      });
      it('Status 200: Returns a response of comments ordered ascendingly by author', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=author&order=asc')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.ascendingBy('author');
          });
      });
      it('Status 200: Returns a response of comments ordered ascendingly by body', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=body&order=asc')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).to.be.ascendingBy('body');
          });
      });
    });
  });

  describe('/api/articles/', () => {
    describe('METHOD NOT ALLOWED', () => {
      it('Status 405: Return a message if the wrong method is used on this endpoint', () => {
        const invalidMethods = ['put', 'delete', 'patch'];
        const returnError = invalidMethods.map(method => {
          return request(app)
            [method]('/api/articles')
            .expect(405);
        });
        return Promise.all(returnError);
      });
    });
    describe('GET', () => {
      it('Status 200: Returns a response articles array of article objects with a comment count', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.an('array');
            expect(body.articles[0]).to.be.an('object');
            expect(body.articles[0]).to.have.keys(
              'author',
              'title',
              'article_id',
              'topic',
              'created_at',
              'votes',
              'comment_count'
            );
          });
      });
    });
    describe('SORT BY', () => {
      it('Status 400: Returns a response articles array of article objects sorted by author', () => {
        return request(app)
          .get('/api/articles?sort_by=badrequest')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal('Bad request!');
          });
      });
      it('Status 200: Returns a response articles array of article objects sorted by author', () => {
        return request(app)
          .get('/api/articles?sort_by=author')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.sortedBy('author');
          });
      });
      it('Status 200: Returns a response articles array of article objects sorted by comment_count', () => {
        return request(app)
          .get('/api/articles?sort_by=comment_count')
          .expect(200)
          .then(({ body }) => {
            body.articles.map(commentCount => {
              return (commentCount.comment_count = parseInt(
                commentCount.comment_count
              ));
            });
            expect(body.articles).to.be.sortedBy('comment_count');
          });
      });
      it('Status 200: Returns a response articles array of article objects sorted by title', () => {
        return request(app)
          .get('/api/articles?sort_by=title')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.sortedBy('title');
          });
      });
      it('Status 200: Returns a response articles array of article objects sorted by article_id', () => {
        return request(app)
          .get('/api/articles?sort_by=article_id')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.sortedBy('article_id');
          });
      });
      it('Status 200: Returns a response articles array of article objects sorted by topic', () => {
        return request(app)
          .get('/api/articles?sort_by=topic')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.sortedBy('topic');
          });
      });
      it('Status 200: Returns a response articles array of article objects sorted by created_at', () => {
        return request(app)
          .get('/api/articles?sort_by=created_at')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.sortedBy('created_at');
          });
      });
      it('Status 200: Returns a response articles array of article objects sorted by votes', () => {
        return request(app)
          .get('/api/articles?sort_by=votes')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.sortedBy('votes');
          });
      });
    });
    describe('ORDER BY', () => {
      it('Status 200: Returns a response object sorted by votes ascendingly', () => {
        return request(app)
          .get('/api/articles?sort_by=votes&order=asc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.ascendingBy('votes');
          });
      });
      it('Status 200: Returns a response object sorted by votes descendingly', () => {
        return request(app)
          .get('/api/articles?sort_by=votes&order=desc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.descendingBy('votes');
          });
      });
      it('Status 200: Returns a response object sorted by created_at ascendingly', () => {
        return request(app)
          .get('/api/articles?sort_by=created_at&order=asc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.ascendingBy('created_at');
          });
      });
      it('Status 200: Returns a response object sorted by created_at descendingly', () => {
        return request(app)
          .get('/api/articles?sort_by=created_at&order=desc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.descendingBy('created_at');
          });
      });
      it('Status 200: Returns a response object sorted by topic ascendingly', () => {
        return request(app)
          .get('/api/articles?sort_by=topic&order=asc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.ascendingBy('topic');
          });
      });
      it('Status 200: Returns a response object sorted by topic descendingly', () => {
        return request(app)
          .get('/api/articles?sort_by=topic&order=desc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.descendingBy('topic');
          });
      });
      it('Status 200: Returns a response object sorted by article_id ascendingly', () => {
        return request(app)
          .get('/api/articles?sort_by=article_id&order=asc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.ascendingBy('article_id');
          });
      });
      it('Status 200: Returns a response object sorted by article_id descendingly', () => {
        return request(app)
          .get('/api/articles?sort_by=article_id&order=desc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.descendingBy('article_id');
          });
      });
      it('Status 200: Returns a response object sorted by title ascendingly', () => {
        return request(app)
          .get('/api/articles?sort_by=title&order=asc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.ascendingBy('title');
          });
      });
      it('Status 200: Returns a response object sorted by title descendingly', () => {
        return request(app)
          .get('/api/articles?sort_by=title&order=desc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.descendingBy('title');
          });
      });
      it('Status 200: Returns a response object sorted by author ascendingly', () => {
        return request(app)
          .get('/api/articles?sort_by=author&order=asc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.ascendingBy('author');
          });
      });
      it('Status 200: Returns a response object sorted by author descendingly', () => {
        return request(app)
          .get('/api/articles?sort_by=author&order=desc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.descendingBy('author');
          });
      });
      it('Status 200: Returns a response object sorted by comment_count ascendingly', () => {
        return request(app)
          .get('/api/articles?sort_by=comment_count&order=asc')
          .expect(200)
          .then(({ body }) => {
            body.articles.map(commentCount => {
              return (commentCount.comment_count = parseInt(
                commentCount.comment_count
              ));
            });
            expect(body.articles).to.be.ascendingBy('comment_count');
          });
      });
      it('Status 200: Returns a response object sorted by comment_count descendingly', () => {
        return request(app)
          .get('/api/articles?sort_by=comment_count&order=desc')
          .expect(200)
          .then(({ body }) => {
            body.articles.map(commentCount => {
              return (commentCount.comment_count = parseInt(
                commentCount.comment_count
              ));
            });
            expect(body.articles).to.be.descendingBy('comment_count');
          });
      });
      it('Status 400: Returns a response articles array of article objects sorted by author', () => {
        return request(app)
          .get('/api/articles?sort_by=badrequest&order=badorder')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal('Bad request!');
          });
      });
    });
    describe('AUTHOR', () => {
      it('Status 200: Returns a response object of an author filtered by the passed in username', () => {
        return request(app)
          .get('/api/articles?author=butter_bridge')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles[0]).to.have.all.keys(
              'author',
              'title',
              'article_id',
              'topic',
              'created_at',
              'votes',
              'comment_count'
            );
            expect(body.articles[0].author).to.eql('butter_bridge');
            expect(body.articles).to.have.length(3);
          });
      });
      it('Status 404: Returns a message when author does not exist', () => {
        return request(app)
          .get('/api/articles?author=doesnotexist')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal('Articles not found!');
          });
      });
    });
    describe('TOPIC', () => {
      it('Status 200: Returns a response object of a topic filtered by the passed in topic name', () => {
        return request(app)
          .get('/api/articles?topic=mitch')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles[0]).to.have.all.keys(
              'author',
              'title',
              'article_id',
              'topic',
              'created_at',
              'votes',
              'comment_count'
            );
            expect(body.articles[0].topic).to.eql('mitch');
            expect(body.articles).to.have.length(11);
          });
      });
      it('Status 404: Returns a message when topic does not exist', () => {
        return request(app)
          .get('/api/articles?topic=doesnotexist')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal('Articles not found!');
          });
      });
    });
  });
  describe('/api/comments/:comment_id', () => {
    describe('METHOD NOT ALLOWED', () => {
      it('Status 405: Return a message if the wrong method is used on this endpoint', () => {
        const invalidMethods = ['put', 'get'];
        const returnError = invalidMethods.map(method => {
          return request(app)
            [method]('/api/comments/:comment_id')
            .expect(405);
        });
        return Promise.all(returnError);
      });
    });
    describe('PATCH', () => {
      it('Status 200: Returns a response with the updated comment', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({ inc_votes: 100 })
          .expect(200)
          .then(({ body }) => {
            expect(body.votes).to.equal(116);
          });
      });
      it('Status 400: Bad request when passed an empty or incorrect object', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({})
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal('Bad request - inc_votes not found!');
          });
      });
      it('Status 400: Bad request when sent an incorrect input', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({ inc_votes: 'joe' })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal(
              'Wrong input for inc_votes - expected an number!'
            );
          });
      });
    });

    describe('DELETE', () => {
      it('Status 204: Deletes the chosen comment by comment_id', () => {
        return request(app)
          .delete('/api/comments/1')
          .expect(204);
      });
      it('Status 404: Returns a message when the comment_id/comment does not exist', () => {
        return request(app)
          .delete('/api/comments/1000')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal('Comment not found!');
          });
      });
    });
  });
});
