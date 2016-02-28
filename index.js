var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var CronJob = require('cron').CronJob;
var YQL = require('yql');
var util = require('util');

var currentAds = [];
var existingIds = [];

Array.prototype.move = function (old_index, new_index) {
  if (new_index >= this.length) {
    var k = new_index - this.length;
    while ((k--) + 1) {
      this.push(undefined);
    }
  }
  this.splice(new_index, 0, this.splice(old_index, 1)[0]);
  return this;
};

var fetchAds = function(callback){
  console.log('fetching ads...');
  new YQL.exec('select * from data.html.cssselect where url="http://www.chotot.vn/tp-ho-chi-minh/mua-ban/#" and css=".listing_thumbs_image"',
      function(response) {
        if(response && response.query && response.query.results
            && response.query.results.results && response.query.results.results.div){
          var results = response.query.results.results.div;
          var newAds = [];
          results.forEach(function(item){
            var id = item.div.a.href.substr(item.div.a.href.length-12, 8);
            if (existingIds.indexOf(id) <= -1) {
              var imgUrl = item.div.a.img['data-original'] ? item.div.a.img['data-original'] : item.div.a.img.src;
              var formattedItem = util.format('<li id="%s" class="draggable"><div class="extra_img-b"><a href="%s"><img alt="%s" src="%s" title="%s"></a></div></li>',
                  id,
                  item.div.a.href,
                  item.div.a.img.alt,
                  imgUrl,
                  item.div.a.img.title
              );
              currentAds.push(formattedItem);
              existingIds.push(id);
              newAds.push(formattedItem);
            }
          });
          if (callback) callback();
          else if (newAds.length > 0) io.emit('newAds', newAds);
        }
  });
};

var startServer = function(){

  app.use(express.static('public'));

  io.on('connection', function(socket){

    socket.emit('currentAds', currentAds);

    socket.on('positionChange', function(info){

      // find old index
      var count = 0;
      var oldIndex = count;
      var nextId;
      currentAds.forEach(function(item){
        if (item.substr(8, 8) === info.id){
          oldIndex = count;
        }
        else { ++count; }
      });

      // change position
      currentAds.move(oldIndex, info.newIndex);

      socket.broadcast.emit('positionChange', info);
    });
  });

  http.listen(3000, function(){
    console.log('listening on *:3000');
  });

  new CronJob('*/30 * * * * *', function() { // run every 30 seconds
    fetchAds();
  }, null, true, 'America/Los_Angeles');

};

fetchAds(startServer);

