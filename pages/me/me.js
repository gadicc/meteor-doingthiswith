if (Meteor.isClient) {

  Router.map(function() {
    this.route('me', {
      onBeforeAction: 'loginFirst'
    });
  });

  Template.me.helpers({
    'user': function() {
      return Meteor.user();
    },
    'tags': function() {
      return this.profile && this.profile.tags && this.profile.tags.join(',');
    },
    'apps': function() {
      return Apps.find({userId: Meteor.userId()}, { sort: { name: 1 }});
    }
  });

  Template.me.events({
    'submit': function(event, tpl) {
      event.preventDefault();
      var data = {
        name: tpl.$('#mna_name').val(),
        siteUrl: tpl.$('#mna_siteUrl').val(),
        projectUrl: tpl.$('#mna_projectHome').val(),
        createdAt: new Date(),
        userId: Meteor.userId()
      }

      var appId = Apps.insert(data);
      var tags = tpl.$('#mna_tags').select2('val');
      Meteor.call('tags', 'app', appId, 'push', tags);
 
      tpl.$('.collapse').removeClass('in');
      tpl.$('#mna_name').val('');
      tpl.$('#mna_siteUrl').val('');
      tpl.$('#mna_projectHome').val('')
      tpl.$('#mna_tags').select2('val', '');
    }
  });

  Template.me.rendered = function() {
    this.$('#meName').editable({
      success: function(response, newValue) {
        var userId = $(this).closest('[data-user-id]').data('user-id');
        Meteor.users.update(userId, { $set: { 'profile.name': newValue } });
      }
    });

    this.$('#meProfile').editable({
      success: function(response, newValue) {
        var userId = $(this).closest('[data-user-id]').data('user-id');
        Meteor.users.update(userId, { $set: { 'profile.pic': newValue } });
      }
    });

    // tag input
    this.$('input[data-type="tags"]').select2({
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
    });

    this.$('#meTags').on('change', function(event) {

        if (event.added)
          Meteor.call('tags', 'user', Meteor.userId(), 'push', event.added.id);
        if (event.removed) {
          // select2 bug?
          Meteor.call('tags', 'user', Meteor.userId(),
            'pull', event.removed.id.toString());
        }
    });
  }
}