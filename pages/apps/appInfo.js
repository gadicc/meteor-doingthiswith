if (Meteor.isClient) {

	Router.map(function() {
		this.route('appInfo', {
			path: '/apps/:id',
			data: function() {
				return {
					app: Apps.findOne(this.params.id)
				}
			}
		});
	});

}