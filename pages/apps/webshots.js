if (Meteor.isServer) {

  var webshot = Async.wrap(Meteor.require('webshot'));
  var gm = Meteor.require('gm');
  var im = gm.subClass({ imageMagick: true });
  var fs = Meteor.require('fs');

  // Modified from spiderable package
  // https://github.com/meteor/meteor/blob/devel/packages/spiderable/spiderable.js
  var phantomScript = function() {
    setInterval(function() {
      var ready;
      if (typeof Meteor !== 'undefined'
          && typeof(Meteor.status) !== 'undefined'
          && Meteor.status().connected) {
        Deps.flush();
        ready = DDP._allSubscriptionsReady();
      } else
        ready = false;

      if (ready) {
        window.callPhantom('takeShot');
      }
    }, 100);
  }

  var options = {
  	script: phantomScript,
  	takeShotOnCallback: true,
  	timeout: 10000	
  }

  Meteor.methods({

    'webshot': function(appId) {
      var app = Apps.findOne(appId);
      if (!app)
        throw new Meteor.Error(404, 'No such app');
      if (!app.siteUrl)
        return;
      if (app.userId != this.userId)
        return;

      var wsInsert = Async.wrap(Webshots, 'insert');
      this.unblock();

      /*
       * same filename doofus!
       * leaving in incase we need to change filename for cache issues
      var toRemove = [];
      if (app.picUrl != SPINNER_PATH) {
        // .../DuvAC4XBgJo7Yidtf-ws-ESNaJDgx4Y8zBq8Kw_thumb.png
        var re = /\/([^-\/]+)-ws-[^_]+_[^\.]+\.png$/;
        toRemove.push(re.exec(app.picUrl)[1]);
        toRemove.push(re.exec(app.thumbUrl)[1]);
      }
      */

      // also in me.js (app create)
      Apps.update(appId, { $set: {
        thumbUrl: SPINNER_PATH,
        picUrl: SPINNER_PATH
      } } );

      var wsFile = 'ws-' + appId + '_fullSize.png';
      var picFile = 'ws-' + appId + '_medium.png';
      var thumbFile = 'ws-' + appId + '_thumb.png';

      webshot(app.siteUrl, wsFile, options);

      // thumbnail
      Meteor.sync(function(done) {
        im(wsFile)
          .resize(100,75)
          .noProfile()
          .write(thumbFile, function(err) {
            if (err) console.log(err);
            done();
          });
      });
      fileObj = Webshots.insert(thumbFile);

      var thumbUrl = 'https://s3-eu-west-1.amazonaws.com/doingthiswith/webshots/'
        + fileObj._id + '-' + thumbFile;
      // Object comes back before bucket policy applied :(
      Meteor.setTimeout(function() {
        Apps.update(appId, { $set: { thumbUrl: thumbUrl } } );
      }, 2000);

      // medium
      Meteor.sync(function(done) {
        im(wsFile)
          .resize(400)
          .noProfile()
          .write(picFile, function(err) {
            if (err) console.log(err);
            done();
          });
      });
      fileObj = Webshots.insert(picFile);

      var url = 'https://s3-eu-west-1.amazonaws.com/doingthiswith/webshots/'
        + fileObj._id + '-' + picFile;
      // Object comes back before bucket policy applied :(
      Meteor.setTimeout(function() {
        Apps.update(appId, { $set: { picUrl: url } } );
      }, 2000);

      fs.unlink(picFile);
      fs.unlink(thumbFile);
      fs.unlink(wsFile);

      /*
       * same filename doofus!
      // if replacing an image, delete the old versions
      if (toRemove.length) {
        _.each(toRemove, function(id) {
          Webshots.remove(id);
        });
      }
      */
    }

  });
}