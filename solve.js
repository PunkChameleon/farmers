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

var size = matrix.shift()[0];

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

// Helper for traversing matrix
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
				if (mtx[y+i] && mtx[y+i][x+j]) {
					var el = mtx[y+i][x+j];
					fn(el, x+j, y+i);
				}
			}
		}
	};

	function createEdgeToLowestNeighbor(point, x, y) {
		var lowest;

		eachNeighbor(x, y, function (neighbor, nX, nY) {
			if (!lowest || neighbor < lowest.value) {
				lowest = { value: neighbor, x: nX, y: nY };
			}
		});

		edges.push({
			start: { x: x, y: y },
			end: { x: lowest.x, y: lowest.y }
		});
	};

	function isSink(point, x, y) {
		var retVal = true;

		// Loop through surrounding elements, if given point is >
		// any of them, it's not a sink
		eachNeighbor(x, y, function (neighbor) {
			if (point > neighbor) { retVal = false; }
		});

		return retVal;
	};

	// Create basins based on sink locations
	this.traverseMatrix(function (point, x, y) {
		if (isSink(point, x, y)) { basins.push(new Basin(x, y)); }
		else { createEdgeToLowestNeighbor(point, x, y); }
	});

	basins.forEach(function (basin) {
		edges.forEach(function (edge) {
			if (edge.end.y === basin.sinkY &&
				edge.end.x === basin.sinkX
			) {
				basin.members.push({
					x: edge.start.x,
					y: edge.start.y
				});
			}
		});
	});

	return basins;
};

var basins = matrix.findBasins();

// Show the matrix with basins denoted by basin number
basins.forEach(function (b, i) {
	processedMatrix[b.sinkY][b.sinkX] = i + 1;

	b.members.forEach(function (member) {
		processedMatrix[member.y][member.x] = i + 1;
	});
});

processedMatrix.forEach(function (row) {
	console.log(row);
});
