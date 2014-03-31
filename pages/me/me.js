if (Meteor.isClient) {

  Router.map(function() {
    this.route('me', {
      onBeforeAction: 'loginFirst'
    });
  });

  Template.me.helpers({
    'tags': function() {
      var user = Meteor.user();
      return user && user.profile && user.profile.tags && user.profile.tags.join(',');
    }
  });

  Template.me.rendered = function() {
    this.$('input').select2({
      width: 'resolve',
      tags: function() {
        return tagCache;
      },
      initSelection : function (element, callback) {
        var data = [];
        $(element.val().split(",")).each(function () {
            data.push({id: this, text: this});
        });
        callback(data);
      },
      tokenSeparators: [",", " "],
    }).on('change', function(event) {
        if (event.added)
          Meteor.call('tags', 'user', Meteor.userId(), 'push', event.added);
        if (event.removed) {
          // select2 bug?
          if (typeof(event.removed.id) == 'object')
            event.removed = {
              id: event.removed.id.toString(),
              text: event.removed.id.toString()
            };
          Meteor.call('tags', 'user', Meteor.userId(), 'pull', event.removed);
        }
    });
  }
}