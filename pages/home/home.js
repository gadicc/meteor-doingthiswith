if (Meteor.isClient) {

  Router.map(function() {
    this.route('home', {
      path: '/'
    });
  });

  Template.home.helpers({
    userCount: function() {
      return Meteor.users.find().count();
    },
    tagCount: function() {
      return Tags.find().count();
    },
    appCount: function() {
      return Apps.find().count();
    }
  });

  var getChartData = function(key, title) {
    var query = {};
    query[key + 'Count'] = { $gt: 0 };

    var options = { sort: {}, limit: 8 };
    options.sort[key + 'Count'] = -1;

    var data = Tags.find(query, options).fetch();
    data = [{
      key: title || key,
      values: _.map(data, function(tag) {
        return { label: tag.name, value: tag[key+'Count'] }
      })
    }];
    console.log(data);
    return data;
  }

  allCharts = {};
  Template.home.rendered = function() {
    _.each(['interest', 'usage'], function(key) {
      nv.addGraph(function() {
        var chart = nv.models.discreteBarChart()
          .x(function(d) { return d.label })    //Specify the data accessors.
          .y(function(d) { return d.value })
          .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
          .tooltips(true)        //Don't show tooltips
          .showValues(true)       //...instead, show the bar value right on top of each bar.
          .transitionDuration(350)
          ;

        chart.valueFormat(d3.format('d'));

        d3.select('#chart_' + key)
          .datum(getChartData(key))
          .call(chart);

        chart.discretebar.dispatch.on("elementClick", function(event) {
          if (event.point)
            Router.go((key == 'interest' ? '/users/search/' : '/apps/search/')
              + event.point.label);
        });

        nv.utils.windowResize(chart.update);

        allCharts[key] = chart;
        return chart;
      });
    });

    var chartUpdate = function() {
      for (key in allCharts)
        d3.select('#chart_' + key)
          .datum(getChartData(key))
          .transition().duration(500)
          .call(allCharts[key]);
    };

    var route = Router.current();
    if (!route.handles) route.handles = {};
    route.handles.tagsObserve = Tags.find().observe({
      added: chartUpdate,
      changed: chartUpdate,
      removed: chartUpdate
    });
  }
}