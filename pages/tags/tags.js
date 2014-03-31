if (Meteor.isClient) {

  Router.map(function() {
    this.route('tags', {
      data: function() {
        return {
          tags: Tags.find({}, {sort: { interestCount: -1 }})
        }
      }
    });
  });

  tagCache = [];
  Tags.find().observe({
    'added': function(doc) {
      tagCache.splice(_.sortedIndex(tagCache, doc.name), 0, doc.name);
    }
  });

  Template.tag.events({
    'change select': function(event, tpl) {
      Tags.update(this._id, { $set: { type: event.currentTarget.value }});
    }
  });

  Template.tag.helpers({
    'selected': function(value) {
      return this.type == value;
    },
    'typeString': function() {
      switch(this.type) {
        case 'tech': return 'Technology';
        case 'framework': return 'Framework';
        case 'sitetype': return 'Type of Website';
        default: return 'Uncategorized';
      }
    }
  });

}

/* Client & Server */

Meteor.methods({
  'tags': function(target, targetId, action, tag) {
    check(target, Match.Where(function(s) { return s == 'app' || s == 'user' }));
    check(target, String);
    check(action, Match.Where(function(s) { return s == 'push' || s == 'pull' }));
    check(tag, { id: String, text: String });

    if ((target == "user" && targetId != this.userId))
      throw new Meteor.error('Attempt by non-admin user to modify other info');

    var col = target == 'user' ? Meteor.users : Apps;
    var query = {};
    action = '$' + action;    
    query[action] = { };
    query[action]['profile.tags'] = tag.id;
    col.update(targetId, query);

    query = { $inc: {} };
    query.$inc[target == 'user' ? 'interestCount' : 'usageCount']
      = action == '$push' ? 1 : -1;
    Tags.upsert({name: tag.id}, query);
  }
});

if (Meteor.isServer) {

}