if (Meteor.isClient) {

  var navbarActive = function(path) {
    $('.navbar-nav li.active').removeClass('active');
    $('.navbar-nav a[href="'+path+'"]').parent().addClass('active');
  }

  Router.configure({
    layoutTemplate: 'layout',
    onAfterAction: function() {
      navbarActive(this.path);
    },
    onStop: function() {
      if (this.handles)
      for (key in this.handles) {
        console.log('stop ' + key);
        this.handles[key].stop();
      }
    }
  });

  Router.hooks.loginFirst = function(pause) {
    if (!Meteor.userId()) {
      this.render('loginFirst');
      pause();
    }
  }

  UI.registerHelper('userId', function() {
    return Meteor.userId();
  });
  UI.registerHelper('notLoggedIn', function() {
    return !Meteor.userId();
  });

  // temporary while we use autopublish
  var allSubscriptionsReadyDep = new Deps.Dependency;
  var allSubscriptionsReadyValue = false;
  var allSubscriptionsReady = function() {
    allSubscriptionsReadyDep.depend();
    return allSubscriptionsReadyValue;
  }
  var allSubscriptionsReadyHandle = Meteor.setInterval(function() {
    var current = DDP._allSubscriptionsReady();
    if (allSubscriptionsReadyValue != current) {
      allSubscriptionsReadyValue = current;
      allSubscriptionsReadyDep.changed();
      Meteor.clearInterval(allSubscriptionsReadyHandle);
    }
  }, 50);
  Router.onBeforeAction(function(pause) {
    if (!allSubscriptionsReady()) {
      this.render('loading');
      pause();
    }
  });
}

if (Meteor.isServer) {

  AccountsExtra.init({
    saveCreatedAt: true,
    saveProfilePic: true,
    saveServiceUsername: true
  });

}
