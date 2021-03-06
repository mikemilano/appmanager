'use strict';

var fs = require('fs');
var path = require('path');
var config = require('./config.js');
var Docker = require('dockerode');
var docker =  new Docker(config.docker);

/**
 * Returns create options for a specific component.
 */
exports.createOpts = function(component) {
  var dopts = {
    Hostname: component.hostname,
    name:  component.cname,
    Image:  component.image.name,
    Dns: ['8.8.8.8', '8.8.4.4'],
    Env: ['APPNAME=' +  component.app.appname, 'APPDOMAIN=' +  component.app.appdomain]
  };

  if ( component.createOpts) {
    _( component.createOpts).each(function(opt, key) {
      dopts[key] = opt;
    });
  }

  return dopts;
};

/**
 * Creates a container for a specific component.
 */
exports.create = function(component, callback) {
  var sopts = exports.createOpts(component);
  docker.createContainer(sopts, function(err, container) {
    if (container) {
      var fs = require('fs');
      fs.writeFileSync(path.resolve(component.cidfile), container.id);
      callback();
    }
  });
};

/**
 * Returns start options for a specific component.
 */
exports.startOpts = function(component, opts) {
  var sopts = {
    Hostname: component.hostname,
    PublishAllPorts: true,
    VolumesFrom: component.dataCname,
    Env: ['APPNAME=' + component.appname, 'APPDOMAIN=' + component.appdomain]
  };

  if (opts) {
    _(opts).each(function(opt, key) {
      sopts[key] = opt;
    });
  }

  return sopts;
};

/**
 * Starts the container of a specific component.
 */
exports.start = function(component, callback) {
  var sopts = exports.startOpts(component);
  docker.getContainer(component.cid).start(sopts, function(err, data) {
    // TODO: Handle errors
    callback(data);
  });
};

/**
 * Stops the container of a specific component.
 */
exports.stop = function(component, callback) {
  docker.getContainer(component.cid).stop(function(err, data) {
    callback(data);
  });
};

/**
 * Kills the container of a specific component.
 */
exports.kill = function(component, callback) {
  docker.getContainer(component.cid).kill(function(err, data) {
    callback();
  });
};

/**
 * Removes the container of a specific component.
 */
exports.remove = function(component, callback) {
  docker.getContainer(component.cid).remove(function(err, data) {
    if (!err && fs.existsSync(component.cidfile)) {
      fs.unlinkSync(component.cidfile);
    }
    callback();
  });
};