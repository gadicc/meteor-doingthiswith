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

  UI.registerHelper('xEditableUpdate', function(selector, value) {
    var el = $(selector);
    var data = el.data();

    // .editable() hasn't been run yet
    if (!data || !data.editable)
      return value;

    console.log('data');
    // this is used the first time the popup is opened
    data.editable.value = value;
    // this is used for all consequent lookups
    if (data.editableContainer)
      data.editableContainer.formOptions.value = value;
    // since return value isn't used anymore
    el.text(value);
    // not actually used; innerText from x-editable breaks reactivity
    return value;
  });

  Router.hooks.loginFirst = function(pause) {
    if (!Meteor.userId()) {
      this.render('loginFirst');
      pause();
    }
  }

  UI.registerHelper('userId', function() {
    return this.userId || Meteor.userId();
  });
  UI.registerHelper('notLoggedIn', function() {
    return !Meteor.userId();
  });

  UI.registerHelper('username', function(userId) {
    var user = userId ? Meteor.users.findOne(userId) : Meteor.user();
    return user && user.profile && user.profile.name;
  });
  UI.registerHelper('ownedByUser', function() {
    return this.userId == Meteor.userId();
  });
  UI.registerHelper('itsMe', function() {
    return this._id == Meteor.userId();
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
