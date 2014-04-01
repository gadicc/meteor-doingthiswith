if (Meteor.isClient) {

	Router.map(function() {
		this.route('userInfo', {
			path: '/users/:id',
			data: function() {
				return {
					user: Meteor.users.findOne(this.params.id)
				}
			}
		});
	});

}