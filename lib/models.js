Apps = new Meteor.Collection('apps');
Tags = new Meteor.Collection('tags');

if (Meteor.isServer) {
	Meteor.users._ensureIndex({tags: 1});
	Apps._ensureIndex({tags: 1});
	Tags._ensureIndex({name: 1});	
}

var userOwnsApp = function(userId, doc) {
	return userId === doc.userId;
}

var loggedIn = function(userId) {
	return !!userId;
}

Apps.allow({
	insert: userOwnsApp, update: userOwnsApp, remove: userOwnsApp
});

Tags.allow({
	insert: loggedIn, update: loggedIn, remove: function() { return false; }
});
