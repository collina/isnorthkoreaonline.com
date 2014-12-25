if (typeof RIPEStatus === 'undefined') {
  
  var RIPEStatus = function(config) {
    this.measurement_type = config.measurement_type;
  }
  
}
RIPEStatus.prototype = {
  measurements: [],
  measurement_type: null,
  
  add_measurement: function(measurement) {
    this.measurements.push(measurement);
    return true;
  },
  
  latest_results: function() {
    var latest_results = {};
    $(this.measurements).each( function (index, measurement) {
      if ((measurement.prb_id in latest_results) == false || (measurement.timestamp > latest_results[measurement.prb_id].timestamp)) {
        latest_results[measurement.prb_id] = measurement;
      }
    });
    return latest_results;
  },
  determination: function (measurement) {
    switch(this.measurement_type) {
      case "ssl": return this.determination_SSL(measurement); break;
      case "dns": return this.determination_DNS(measurement); break;
      default: return false; break;
    }
  },
  determination_SSL: function (measurement) { return measurement.err == undefined; },
  determination_DNS: function (measurement) { return measurement.error == undefined && measurement.result.abuf != undefined; },
  
  consensus: function() {
    var votes = { "error": 0, "success": 0},
        latest_results = this.latest_results();
    
    for (var probe_id in latest_results) {
      if ( this.determination(latest_results[probe_id], this.measurement_type) ) {
        votes["success"] += 1;
      } else {
        votes["error"] += 1;
      }
    }
    return (votes["success"] / ( votes["success"] + votes["error"] ));
  },
}

function get_socket (callback) {
  var socket = io("http://atlas-stream.ripe.net", {path : "/stream/socket.io"});
  socket.on('msm', callback);
  return socket;
}
function subscribe_socket (socket, prb, msm) {
  socket.emit("config", { msm: msm, prb: prb });
}

//
//RIPEStatus.prototype.process = function(measurements) {
//  latest_results = this.latest_results(measurements);
//  consensus = this.consensus(latest_results);  
//  return consensus;
//}


