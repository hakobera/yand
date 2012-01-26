var cache = require('../lib/cache'),
    should = require('should');

describe('cache', function() {

  beforeEach(function(done) {
    cache.clear(done);
  });

  describe('.get()', function() {
    it('should return the same value for same key', function(done) {
      var key = 'a',
          value = [1, 2, 3];
      cache.set(key, value, 100000, function(err) {
        if (err) return done(err);
        cache.get(key, function(err, result) {
          if (err) return done(err);

          result.should.have.length(3);
          result.should.eql(value);

          done();
        });
      });
    });

    it('should not return the same value for different key', function(done) {
      var key1 = 'a',
          key2 = 'b',
          value = [1, 2, 3];
      cache.set(key1, value, 100000, function(err) {
        if (err) return done(err);
        cache.get(key2, function(err, result) {
          if (err) return done(err);

          should.not.exist(result);
          
          done();
        });
      });
    });
  });

  describe('.keys()', function() {
    it('should return matech keys in cache', function(done) {
      cache.set('a', [1,2,3], 100000, function(err, obj) {
        if (err) return done(err);
        cache.set('ab', [1,2,3], 100000, function(err, obj) {
          if (err) return done(err);
          cache.keys('a*', function(err, keys) {
            if (err) return done(err);

            keys.should.have.length(2);
            keys.should.eql(['ab', 'a']);

            done();
          });
        });
      });
    });
  })
})