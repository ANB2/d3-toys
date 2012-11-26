// Generated by CoffeeScript 1.3.3
(function() {
  var color, height, svg, width;

  width = document.body.clientWidth * 0.9;

  height = document.body.clientHeight * 0.8;

  color = d3.scale.category20();

  svg = d3.select("body").append("svg").attr("width", width).attr("height", height).append("g").attr("transform", "translate(10,30)");

  d3.json("deps.json", function(json) {
    var byId, draw, link, nodes, seenBefore, tree, xScale, yScale;
    nodes = Object.keys(json).map(function(k) {
      var deps;
      deps = json[k];
      return {
        name: k,
        deps: deps,
        clients: []
      };
    });
    byId = nodes.reduce((function(byId, node) {
      byId[node.name] = node;
      return byId;
    }), {});
    seenBefore = {};
    nodes.forEach(function(node) {
      node.deps.forEach(function(dep) {
        var patron;
        byId[dep] || (byId[dep] = {
          name: dep,
          deps: [],
          clients: []
        });
        return patron = byId[dep];
      });
      return node.deps = node.deps.map(function(depName) {
        var dep;
        dep = byId[depName];
        dep.clients.push(byId[node.name]);
        if (seenBefore[depName]) {
          return {
            name: dep.name
          };
        } else {
          seenBefore[depName] = true;
          return dep;
        }
      });
    });
    tree = d3.layout.tree();
    tree.children(function(node) {
      return node.deps;
    });
    tree.size([width, height]);
    link = d3.svg.diagonal().projection(function(d) {
      return [d.x, d.y];
    });
    xScale = d3.scale.linear().range([25, width]);
    yScale = d3.scale.linear().range([25, height]);
    draw = function(drawNode) {
      var fromMain, links, linksFromMain, nodesEnter, tooltip;
      fromMain = tree.nodes(byId[drawNode]);
      linksFromMain = tree.links(fromMain);
      svg.selectAll(".link").remove();
      svg.selectAll(".node").remove();
      links = svg.selectAll(".link").data(linksFromMain);
      links.enter().append("svg:path").attr("class", "link").attr("d", link);
      links.exit().remove();
      tooltip = function(data) {
        var clients, enteringTooltip, tt;
        tt = d3.select("body").selectAll("#tooltip").data(data);
        enteringTooltip = tt.enter().append("div").attr("id", "tooltip").attr("class", "pane");
        enteringTooltip.append("h3");
        enteringTooltip.append("h4");
        tt.select("h3").text(function(d) {
          return d.node.name;
        });
        tt.select("h4").text(function(d) {
          var clientCount;
          clientCount = (byId[d.node.name].clients || []).length;
          if (clientCount === 0) {
            return "No clients";
          }
          return "Called by " + clientCount;
        });
        enteringTooltip.append("ul");
        tt.style("left", function(d) {
          return d.left || d3.select(this).attr("left");
        }).style("top", function(d) {
          return d.top || d3.select(this).attr("top");
        }).transition().style("opacity", function(d) {
          if (d.shown) {
            return 1;
          }
          return 0;
        });
        clients = tt.selectAll("li").data(function(d) {
          return byId[d.node.name].clients || [];
        }).on("click", function(d) {
          return draw(d.name);
        });
        clients.enter().append("li");
        clients.text(function(d) {
          return d.name || d;
        });
        return clients.exit().remove();
      };
      nodes = svg.selectAll(".node").data(fromMain);
      nodes.exit().remove();
      nodesEnter = nodes.enter().append("g").attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      }).attr("class", "node").on("mouseover", function(node) {
        var bounding;
        bounding = this.getBoundingClientRect();
        d3.select(this).select("text").transition().attr("opacity", 1);
        return tooltip([
          {
            top: bounding.top + 10,
            left: bounding.left,
            node: node,
            shown: true
          }
        ]);
      }).on("mouseout", function() {
        var _this = this;
        return setTimeout(function() {
          d3.select(_this).select("text").transition().attr("opacity", 0);
          return d3.select("#tooltip").style("opacity", 0);
        }, 10000);
      });
      nodesEnter.append("circle").attr("r", 5).style("fill", "red");
      return nodesEnter.append("text").attr("opacity", 0).attr("transform", function(d) {
        var bounding;
        bounding = this.getBoundingClientRect();
        return "translate(" + (-bounding.width / 2) + ",-10)";
      });
    };
    draw("main");
    return window.draw = draw;
  });

}).call(this);