/*
 * A group of farmers has some elevation data, and we’re going to help them
 * understand how rainfall flows over their farmland.
 *
 * We’ll represent the land as a two-dimensional array of altitudes and use
 * the following model, based on the idea that water flows downhill:
 *
 * - If a cell’s four neighboring cells all have higher altitudes, we call
 *   this cell a sink; water collects in sinks.
 *   Otherwise, water will flow to the neighboring cell with the lowest
 *   altitude. If a cell is not a sink, you may assume it has a unique lowest
 *   neighbor and that this neighbor will be lower than the cell.
 *
 * - Cells that drain into the same sink – directly or indirectly – are said
 *   to be part of the same basin.
 *
 * Your challenge is to partition the map into basins. In particular, given a
 * map of elevations, your code should partition the map into basins and output
 * the sizes of the basins, in descending order.
 *
 * Assume the elevation maps are square.
 * Input will begin with a line with one integer, S, the height (and width) of
 * the map. The next S lines will each contain a row of the map, each with
 * S integers – the elevations of the S cells in the row. Some farmers have
 * small land plots such as the examples below, while some have larger plots.
 * However, in no case will a farmer have a plot of land larger than S = 5000.
 *
 * Your code should output a space-separated list of the basin sizes,
 * in descending order. (Trailing spaces are ignored.)
 *
 */
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
		var lowest = { nodeValue: mtx[y][x], x: x, y: y };

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

var start = process.hrtime();
var basins = matrix.findBasins();
var elapsed = process.hrtime(start)[1] / 1000000;

console.log( "Ran in: " +
		process.hrtime(start)[0] +
		"s " +
		elapsed.toFixed(3) +
		"ms\n"
);

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
