;(function( window ) {

"use strict";

var LineGraph = function (key) {};


LineGraph.prototype.testData = [
  {"count": 10,
    "date":"19/10/16 10:30:00"
  },    {"count": 12,
    "date":"20/10/16 10:30:00"
  },   {"count": 15,
    "date":"21/10/16 10:30:00"
  },  {"count": 18,
    "date":"22/10/16 10:30:00"
  },  {"count": 20,
    "date":"23/10/16 10:30:00"
  },  {"count": 20,
    "date":"24/10/16 10:30:00"
  },  {"count": 21,
    "date":"25/10/16 10:30:00"
  },  {"count": 32,
    "date":"25/12/16 10:30:00"
  }
];

LineGraph.hidden = {};

LineGraph.hidden.setDateFormat = function(format) {
  if (format==="yearly") { return function (date) {
      return date.split(" ")[0].split("/")[2];
    };
  }
  if (format==="yearly_whole") { return function (date) {
      return date.split(" ")[0];
    };
  }
  if (format==="month-year") { return function (date) {
      var mainDate = date.split(" ")[0].split("/");
      return mainDate[1] + "/" + mainDate[2];
    };
  }
  if (format==="daily") { return function (date) {
      return date.split(" ")[0].split("/")[0];
    };
  }
  if (format==="day-month") { return function (date) {
      var mainDate = date.split(" ")[0].split("/");
      return mainDate[0] + "/" + mainDate[1];
    };
  }
  if (format==="hour-day") { return function (date) {
      var mainDate = date.split(" ")[0]
      return mainDate[0].split("/")[0] + " " + mainDate[1].split(":")[0];
    };
  }
  if (format==="minute-hour") { return function (date) {
      return mainDate = date.split(" ")[1]
    };
  }
  if (format==="day_whole") { return function (date) {
      var mainDate = date.split(" ")
      var time = mainDate[1].split(":")
      console.log(mainDate[0].split("/")[0] + " " + time[0] + ":" + time[1]);
      return mainDate[0].split("/")[0] + " " + time[0] + ":" + time[1];
    };
  }
};

LineGraph.prototype.clear = function() {
  d3.select("svg").remove();
};

LineGraph.prototype.build = function(width, height) {
  var svg = d3.select("#graph").append("svg");
  svg.attr("width", width);
  svg.attr("height", height);
  var margin = {top: 50, right: 60, bottom: 40, left: 80};
  var width = +svg.attr("width") - margin.left - margin.right;
  var height = +svg.attr("height") - margin.top - margin.bottom;
  
  //white background
  svg.append("rect")
    .attr("width", "81%")
    .attr("height", "76%")
    .attr("fill", "white")
    .attr("transform", "translate(56,"  + margin.bottom + ")")
  
  this.g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  this.x = d3.scaleTime().rangeRound([0, width]);
  this.y = d3.scaleLinear().rangeRound([height, 0]);
  var me = this;
  this.line = d3.line()
    .x(function(d) { return me.x(d.date); })
    .y(function(d) { return me.y(d.close); });

  this.svg = svg;  
  this.height = height;
  this.width = width;
};

LineGraph.prototype.dateFormat;

LineGraph.prototype.setDateFormat = function(format) {
  if (format==="yearly") this.parseTime = d3.timeParse("%y");
  if (format==="yearly_whole") this.parseTime = d3.timeParse("%d/%m/%y"); 
  if (format==="month-year") this.parseTime = d3.timeParse("%m/%y");
  if (format==="daily") this.parseTime = d3.timeParse("%d");
  if (format==="day-month") this.parseTime = d3.timeParse("%d/%m");
  if (format==="hour-day") this.parseTime = d3.timeParse("%d %H");
  if (format==="minute-hour") this.parseTime = d3.timeParse("%H:%M");
  if (format==="day_whole") this.parseTime = d3.timeParse("%d %H:%M");
  this.dateFormat = LineGraph.hidden.setDateFormat(format);
};

LineGraph.prototype.setData = function(data) {
  if (typeof data === "undefined") {data = this.testData; }
  var me = this;
  var data = data.map(function(d) {
      return {
        date: me.parseTime(me.dateFormat(d.date)),
        close: d.count
      };
  });

//calculating the value domains
  this.x.domain(d3.extent(data, function(d) { return d.date; }));
  this.y.domain(d3.extent(data, function(d) { return d.close; }));

  this.buildAxis();      
  this.buildHLines(data);
  
//creating the line itself
  this.g.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", this.line);
};

LineGraph.prototype.buildAxis = function() {
//appending the horizontal axis
  this.g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x))
    .append("text")
      .attr("fill", "#666")
      .attr("y", 29)
      .attr("x", this.width)
      .style("class", "axis-text")
      .text("Days");
      
//appending the vertical axis
  this.g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(this.y))
    .append("text")
      .attr("fill", "#666")
      .attr("y", 6)
      .attr("x", -25)
      .style("class", "axis-text")
      .text("Words");
};

LineGraph.prototype.buildHLines = function(data) {
//adding some horizontal lines
    var min = data.reduce(function (p, v) {
          return ( p.close < v.close ? p : v );
     });
    var max = data.reduce(function (p, v) {
          return ( p.close > v.close ? p : v );
     });

  var step = ((max.close - min.close)/5)
  var start = min.close - step;

  do {
    start += step;
    if (start > max.close) start = max.close;
    this.g.append("line")
      .attr("y1", this.y(start))     // x position of the first end of the line
      .attr("x1", this.x(min.date))
      .attr("y2", this.y(start))     // x position of the second end of the line
      .attr("x2", this.x(max.date))
      .attr("class", "hLine");
  }while (start < max.close)
};

window.LineGraph = LineGraph;


})( window );
