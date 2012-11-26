// Generated by CoffeeScript 1.3.3
(function() {
  var code, dir, es, fs, read, traverse,
    __hasProp = {}.hasOwnProperty;

  es = require("esprima");

  code = "define([\n	'm/slice/performance',\n	'm/slice/merchants',\n	'constants'\n],function(\n	PerformanceSlice,\n	MerchantsSlice,\n	c\n) {\n	var Query = Backbone.ValueObject.extend({\n	},{\n		create: function(attrs,opts) {\n			var k = function(k) { return (attrs && attrs[k]) || opts && opts.current && opts.current.get(k) };\n			require([\"m/foo\"],function() {});\n		}\n	});\n});";

  traverse = function(node, fn) {
    var k, v;
    fn(node);
    for (k in node) {
      if (!__hasProp.call(node, k)) continue;
      v = node[k];
      if (typeof v === "object" && v !== null) {
        traverse(v, fn);
      }
    }
    return null;
  };

  fs = require("fs");

  dir = process.argv[2];

  read = function(dir, rel) {
    var depsByPath, files;
    if (rel == null) {
      rel = "";
    }
    depsByPath = {};
    files = fs.readdirSync(dir);
    files.forEach(function(file) {
      var allDeps, deps, dirDeps, parsed, path, stat;
      allDeps = [];
      path = dir + "/" + file;
      stat = fs.statSync(path);
      if (stat.isDirectory()) {
        dirDeps = read(path, rel + "/" + file);
        for (file in dirDeps) {
          if (!__hasProp.call(dirDeps, file)) continue;
          deps = dirDeps[file];
          depsByPath[file] = deps;
        }
        return;
      }
      if (!/\.js$/.test(file)) {
        return;
      }
      try {
        parsed = es.parse(fs.readFileSync(path, "utf8"));
      } catch (e) {
        console.error("Error parsing " + path + ": " + e);
        return;
      }
      traverse(parsed, function(node) {
        if (node.type !== "CallExpression" || !(node.callee.name in {
          "define": 1,
          "require": 1
        })) {
          return;
        }
        deps = node["arguments"].filter(function(arg) {
          return arg.type === "ArrayExpression";
        });
        if (deps.length > 0) {
          deps = deps[0].elements.map(function(dep) {
            return dep.value;
          });
        } else {
          deps = [];
        }
        return allDeps = allDeps.concat(deps);
      });
      return depsByPath[(rel + "/" + file.replace(/\.js$/, "")).replace(/^\//, "")] = allDeps;
    });
    return depsByPath;
  };

  console.log(JSON.stringify(read(dir)));

}).call(this);
