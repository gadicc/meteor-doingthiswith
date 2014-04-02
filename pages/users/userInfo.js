SPINNER_PATH = '/spinner.gif';

if (Meteor.isClient) {

	Router.map(function() {

    this.route('me', {
      onBeforeAction: function(pause) {
        if (Meteor.userId())
          Router.go('/users/' + Meteor.userId());
        else
          this.render('loginFirst');
        pause();
      }
    });
		this.route('userInfoPage', {
			path: '/users/:id',
			data: function() {
				return {
					user: Meteor.users.findOne(this.params.id),
					apps: Apps.find({userId: this.params.id}, { sort: { name: 1 }})
				}
			}
		});

	});

  Template.userInfo.helpers({
    'joinedTags': function() {
      return this.profile && this.profile.tags && this.profile.tags.join(',');
    }
  });

  Template.userInfo.events({
    'submit': function(event, tpl) {
      event.preventDefault();
      var data = {
        name: tpl.$('#mna_name').val(),
        siteUrl: tpl.$('#mna_siteUrl').val(),
        projectUrl: tpl.$('#mna_projectHome').val(),
        createdAt: new Date(),
        userId: Meteor.userId(),
        // also in webshots.js
        thumbUrl: SPINNER_PATH,
        picUrl: SPINNER_PATH 
      }

      var appId = Apps.insert(data);
      Meteor.call('webshot', appId);

      var tags = tpl.$('#mna_tags').select2('val');
      Meteor.call('tags', 'app', appId, 'push', tags);
 
      tpl.$('.collapse').removeClass('in');
      tpl.$('#mna_name').val('');
      tpl.$('#mna_siteUrl').val('');
      tpl.$('#mna_projectHome').val('')
      tpl.$('#mna_tags').select2('val', '');
    }
  });

  Template.userInfo.rendered = function() {
  	if (this.data._id != Meteor.userId())
  		return;

    _.each(
      ['name', 'pic', 'email', 'github', 'twitter', 'gplus'],
      function(what) {
      this.$('#user_'+what).editable({
        success: function(response, newValue) {
          var docId = $(this).closest('[data-user-id]').attr('data-user-id');
          var query = { $set: {} }; query['$set']['profile.'+what] = newValue;
          Meteor.users.update(docId, query);
        }
      });
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

    this.$('#userTags').on('change', function(event) {

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