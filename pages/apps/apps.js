if (Meteor.isClient) {

  Router.map(function() {

    this.route('apps');

    this.route('appSearch', {
      template: 'apps',
      path: '/apps/search/:tags',
      onBeforeAction: function() {
      	Session.set('userTagFilter', this.params.tags.split(','));
      }
    });

  });

	Template.apps.helpers({

		apps: function() {

			var query = {};
			var userTagFilter = Session.get('userTagFilter');
			if (userTagFilter.length)
				query['tags'] = { $all: userTagFilter }

			return Apps.find(query, {
				sort: { 'name': 1 }
			});
		},

		userTagFilter: function() {
			return Session.get('userTagFilter').join(',');
		},

		inFilter: function() {
			return _.contains(Session.get('userTagFilter'), this.valueOf());
		}

	});

	Template.apps.rendered = function() {

    this.$('input').select2({
      width: '350px',
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
    	Session.set('userTagFilter', event.val);
    });

	}

	Template.app.events({

		'click a.updateThumb': function(event, tpl) {
			if (Meteor.userId() != this.userId)
				return;
			
			event.preventDefault();
			Meteor.call('webshot', this._id);
		},

		'click .serviceLinks a': function(event, tpl) {
			event.stopPropagation();
		}

	});
}
