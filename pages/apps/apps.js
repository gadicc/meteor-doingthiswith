if (Meteor.isClient) {

  Router.map(function() {
    this.route('apps');
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

	Template.user.helpers({

		inFilter: function() {
			return _.contains(Session.get('userTagFilter'), this.valueOf());
		}

	});
}
