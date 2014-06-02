var fs = require("fs");
var fileName = process.argv[2]; // Get file from command line
var processedMatrix = [];

// Convert .txt file into 2 dimensional array
var matrix = fs.readFileSync(fileName, "utf8")
	.toString()
	.trim()
	.split("\n")
	.map(function (row) {
		return row.split(" ").map(function (x) { return +x; });
	});

// First line is the size of the matrix
var size = matrix.shift()[0];

// Create an empty matrix of same size as original
for (var i = 0, l = size; i < l; i ++) {
	processedMatrix.push([]);
	for (var j = 0, k = size; j < k; j ++) {
		processedMatrix[i].push(undefined);
	}
}

// Basin type
function Basin(sinkX, sinkY) {
	this.sinkX = sinkX; // X coordinate of the basins sink
	this.sinkY = sinkY; // Y coordinate of the basins sink
	this.members = [];  // points that are included in this basin
};

// Helper for traversing a 2d matrix matrix
Array.prototype.traverseMatrix = function (fn) {
	this.forEach(function (row, y) {
		row.forEach(function (point, x) { fn(point, x, y); });
	});
};

// Find basins based on lowest points in 2d array
Array.prototype.findBasins = function () {
	var basins = [], mtx = this, edges = [];

	function eachNeighbor(x, y, fn) {
		for (var i = -1, l = 1; i <= l; i++) {
			for (var j = -1, k = 1; j <= k; j++) {
				var coordX = x+j, coordY = y+i;
				if (mtx[coordY]) {
					var node = mtx[coordY][coordX];
					if (fn) { fn(node, coordX, coordY); }
				}
			}
		}
	};

	// Adds an edge to the edges list from x, y to that
	// points lowest neighbor
	function createEdgeToLowestNeighbor(x, y) {
		var lowest = { nodeValue: matrix[y][x], x: x, y: y };

		eachNeighbor(x, y, function (neighbor, nX, nY) {
			if (!lowest || neighbor < lowest.nodeValue) {
				lowest = { nodeValue: neighbor, x: nX, y: nY };
			}
		});

		edges.push({
			start: { x: x, y: y },
			end: {
				x: lowest.x,
				y: lowest.y
			}
		});
	};

	// Helper for returning whether or not a given value is the lowest
	// of all it's neighbors (ie a sink)
	function isSink(nodeValue, x, y) {
		var retVal = true;

		// Loop through surrounding elements, if given point is >
		// any of them, it's not a sink
		eachNeighbor(x, y, function (neighborValue) {
			if (nodeValue > neighborValue) { retVal = false; }
		});

		return retVal;
	};

	// given a list of points, a starting point, and a basin,
	// find points in the list that are connected to the given point,
	// and add it to the given basin
	function findConnectedEdges(point, basin) {
		edges.forEach(function (edge, i) {
			if (edge.end.y === point.y && edge.end.x === point.x) {
				var obj = { x: edge.start.x, y: edge.start.y };
				basin.members.push(obj);
				findConnectedEdges(obj, basin);
			}
		});
	};

	// Create basins based on sink locations
	this.traverseMatrix(function (node, x, y) {
		if (isSink(node, x, y)) {
			var b = new Basin(x, y);
			b.members.push({ x: x, y: y });
			basins.push(b);
		} else {
			createEdgeToLowestNeighbor(x, y);
		}
	});

	// Add points to a basin based on their
	// relationship with the basin's sink
	basins.forEach(function (basin) {
		findConnectedEdges({ x: basin.sinkX, y: basin.sinkY }, basin);
	});

	return basins;
};

/*
 *
 * Run it
 *
 */

var basins = matrix.findBasins();


/*
 *
 * Display results
 *
 */

console.log("Sizes:");
console.log("------------------------");

// Create a processed matrix with basins denoted by numbers
basins.sort(function (a, b) {
	return b.members.length - a.members.length;
}).forEach(function (b, i) {
	var j = i + 1;
	console.log("Basin " + j + " size: " + b.members.length);
	processedMatrix[b.sinkY][b.sinkX] = j;

	b.members.forEach(function (member) {
		processedMatrix[member.y][member.x] = j;
	});
});

console.log(" ");

console.log("Basin groups:");
console.log("------------------------");
processedMatrix.forEach(function (row) { console.log(row); });
