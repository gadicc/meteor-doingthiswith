if (Meteor.isClient) {

	Router.map(function() {
		this.route('appInfoPage', {
			path: '/apps/:id',
			data: function() {
				return {
					app: Apps.findOne(this.params.id)
				}
			}
		});
	});

	Template.appInfo.events({
		'click a.updateThumb': function(event, tpl) {
			if (this.userId == Meteor.userId())
				Meteor.call('webshot', this._id);
		}
	});

	Template.appInfo.rendered = function() {
    // Nothing to do if user doesn't own this app
    if (this.data.userId != Meteor.userId())
      return;

		// pretty much all adapted from me.js

    this.$('#appInfoSiteUrl').editable({
      success: function(response, newValue) {
        var appId = $(this).closest('[data-app-id]').data('app-id');
        Apps.update(appId, { $set: { 'siteUrl': newValue } });
      }
    });

    this.$('#appInfoProjectUrl').editable({
      success: function(response, newValue) {
        var appId = $(this).closest('[data-app-id]').data('app-id');
        Apps.update(appId, { $set: { 'projectUrl': newValue } });
      }
    });

    // tag input
    this.$('#appTags').select2({
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
      var appId = $(this).closest('[data-app-id]').attr('data-app-id');
      if (event.added)
        Meteor.call('tags', 'app', appId, 'push', event.added.id);
      if (event.removed) {
        // select2 bug?
        Meteor.call('tags', 'app', appId,
          'pull', event.removed.id.toString());
      }
    });
  }

}