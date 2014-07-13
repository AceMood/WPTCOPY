var perfLogger = (function(){
	
	// global reference
	var proformance = window.proformance,
		timing = proformance.timing;

	// local variables
	var serverLogURL = "savePerfData.php",
		_pTime = Date.now() - timing.navigationStart || 0,
		_redirTime = timing.redirectEnd - timing.redirectStart || 0,
		_cacheTime = timing.domainLookupStart - timing.fetchStart || 0,
		_dnsTime = timing.domainLookupEnd - timing.domainLookupStart || 0,
		_tcpTime = timing.connectEnd = timing.connectStart || 0,
		_roundtripTime = timing.responseEnd - timing.connectStart || 0,
        _renderTime = Date.now() - timing.domLoading || 0;

	// @constructor
	// single result object Class
    function TestResult(){}
    TestResult.prototype.perceivedTime = _pTime;
    TestResult.prototype.redirectTime = _redirTime;
    TestResult.prototype.cacheTime = _cacheTime;
    TestResult.prototype.dnsLookupTime = _dnsTime;
    TestResult.prototype.tcpConnectionTime = _tcpTime;
    TestResult.prototype.roundTripTime = _roundtripTime;
    TestResult.prototype.pageRenderTime = _renderTime;

    proformance.now = (function() {
    	return proformance.now || 
    		proformance.webkitNow || 
    		function(){
    			return (new Date()).getTime();	
    		}
    })();

    function jsonConcat(obj1, obj2) {
    	for (var key in obj2) {
    		obj1[key] = obj2[key];
    	}
    	return obj1;
    }

    function calculateResult(id) {
    	loggerPool[id].runtime = loggerPool[id].stopTime - loggerPool[id].startTime;
    }

    function setResultsMetaData(id) {
    	loggerPool[id].url = window.location.href;
    	loggerPool[id].userAgent = navigator.userAgent;
    }

    function drawToDebugScreen(id) {
    	var debug = document.getElementById("debug");
    	var output = formatDebugInfo(id);
    	if (!debug) {
    		var divTag = document.createElement("div");
    		divTag.id = "debug";
    		divTag.innerHTML = output;
    		document.body.appendChild(debug);
    	} else {
    		debug.innerHTML += output;
    	}
    }

    function logToServer(id) {
    	var params = "data=" + JSON.stringify(jsonConcat(loggerPool[id], TestResult.prototype));
    	var xhr = new XMLHttpRequest();
    	xhr.open("POST", serverLogURL, true);
    	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    	xhr.setRequestHeader("Content-length", params.length);
    	xhr.setRequestHeader("Connection", "close");
    	xhr.onreadystatechange = function() {
    		if (xhr.readyState == 4 && xhr.status == 200) {

    		}
    	};
    	xhr.send(params);
    }

    function formatDebugInfo(id) {
    	var debuginfo = "<p><strong>" + loggerPool[id].description + "</strong><br/>";
    	if (loggerPool[id].avgRunTime) {
    		debuginfo += "average run time: " + loggerPool[id].avgRunTime + "ms<br/>";
    	} else {
    		debuginfo += "run time: " + loggerPool[id].runtime + "ms<br/>";
    	}
    	debuginfo += "path: " + loggerPool[id].url + "<br/>";
    	debuginfo += "useragent: " + loggerPool[id].useragent + "ms<br/>";
    	debuginfo += "</p>";

    	return debuginfo;
    }

    return {
    	startTimeLogging: function(id, desc, drawToPage, logToServer) {
    		loggerPool[id] = new TestResult();
    		loggerPool[id].startTime = proformance.now(); // High-resolution time
    		loggerPool[id].description = desc;
    		loggerPool[id].drawtopage = drawToPage;
    		loggerPool[id].logtoserver = logToServer;
    	},
    	stopTimeLogging: function() {
    		loggerPool[id].stopTime = proformance.now(); // High-resolution time
    		calculateResult(id);
    		setResultsMetaData(id);
    		if (loggerPool[id].drawtopage) {
    			drawToDebugScreen(id);
    		} 
    		if (loggerPool[id].logtoserver) {
    			logToServer(id);
    		}
    	},
    	logBenchmark: function(id, timestoIterate, func, debug, log) {
    		var timeSum = 0;
    		for (var x = 0; x < timestoIterate; x++) {
    			perfLogger.startTimeLogging(id, "benchmarking " + func, false, false);
    			func();
    			perfLogger.stopTimeLogging(id);
    			timeSum += loggerPool[id].runtime;
    		}
    		loggerPool[id].avgRunTime = timeSum / timestoIterate;
    		if (debug) {
    			drawToDebugScreen(id);
    		}
    		if (log) {
    			logToServer(id);
    		}
    	},
    	// expose derived performance data
    	perceivedTime: function() { return _pTime; },
    	redirectTime: function() { return _redirTime; },
    	cacheTime: function() { return _cacheTime; },
    	dnsLookupTime: function() { return _dnsTime; },
    	tcpConnectionTime: function() { return _tcpTime; },
    	roundTripTime: function() { return _roundtripTime; },
    	pageRenderTime: function() { return _renderTime; }
    };

})();