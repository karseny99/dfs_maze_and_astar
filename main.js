var black_chance = 0.2;
var column = 80;
var rows = 80;



function ElementRemove(array, elem) {
    for(var i = array.length - 1; i >= 0; --i) {
        if(array[i] == elem) {
            array.splice(i, 1);
        }
    }
}



var grid = new Array(column);
var openQueue = [];
var visited = [];
var path = [];
var start;
var end;

var w, h;


function isInArea(x, y) {
    if(0 <= x && x < column) {
        if(0 <= y && y < rows) {
            return true;
        }
    }
    return false;
}


function heuristic(a, b) {
    return dist(a.x, a.y, b.x, b.y);
    // return abs(a.x - b.x) + abs(a.y - b.y);
}



function Cell(i, j) {
    this.x = i;
    this.y = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.prev = undefined;
    this.wall = false;

    if(random(1) < black_chance) {
        this.wall = true;
    }

    this.neighbors = [];

    this.show = function(color) {
        fill(color);
        if(this.wall) {
            fill(40);
            color = 0;
        }
        stroke(150);
        // noStroke();
        rect(this.x * w, this.y * h, w - 1, h - 1);
    }

    this.addNeighbors = function(grid) {
        var shifts = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]; // closest cells to current 

        var x = this.x;
        var y = this.y;

        for(var i = 0; i < shifts.length; ++i) {
            if(isInArea(x + shifts[i][0], y + shifts[i][1])) {  
                this.neighbors.push(grid[x + shifts[i][0]][y + shifts[i][1]]);
            }
        }

    }
}

function setup() {
    createCanvas(900, 900, 0);
    console.log("A*");

    w = width / column;
    h = height / rows;

    for(var i = 0; i < column; i++) {
        grid[i] = new Array(rows);
    }
    
    for(var i = 0; i < column; i++) {
        for(var j = 0; j < rows; j++) {
            grid[i][j] = new Cell(i, j);
        }
    }
    
    for(var i = 0; i < column; i++) {
        for(var j = 0; j < rows; j++) {
            grid[i][j].addNeighbors(grid);
        }
    }
    
    start = grid[0][0];
    end = grid[column - 1][rows - 1];
    
    end.wall = false;
    start.wall = false;
    
    openQueue.push(start);
    
}


function draw() {
    if(openQueue.length > 0) {
        var winner = 0;
        
        for(var i = 0; i < openQueue.length; ++i) {
            if(openQueue[winner].f > openQueue[i].f) {
                winner = i;
            }
        }

        var current = openQueue[winner];

        if(current === end) {
            noLoop();
            console.log("Done!");
        }

        visited.push(current);
        ElementRemove(openQueue, current);

        // cycling related vertex to current
        var listOfNeighbors = current.neighbors;    
        for(var i = 0; i < listOfNeighbors.length; ++i) {
            var neighbor = listOfNeighbors[i];

            if(visited.includes(neighbor) || neighbor.wall) {
                continue; 
            }

            var tmpG = current.g + 1;
            var newPath = false;
            if(openQueue.includes(neighbor)) {
                if(tmpG < neighbor.g) {
                    neighbor.g = tmpG;
                    newPath = true;
                } 
            } else {
                neighbor.g = tmpG;
                newPath = true;
                openQueue.push(neighbor);
            }
            
            if(newPath) {
                neighbor.prev = current;
                neighbor.h = heuristic(neighbor, end);
                neighbor.f = neighbor.g + neighbor.h;
            }

        }
        
    } else {

        console.log("No solution!");
        noLoop();
        return;

    }
    

    for(var i = 0; i < column; i++) {
        for(var j = 0; j < rows; j++) {
            grid[i][j].show(color(180));
        }
    }

    for(var i = 0; i < visited.length; ++i) {
        visited[i].show(color(58, 134, 255));
    }

    for(var i = 0; i < openQueue.length; ++i) {
        openQueue[i].show(color(0, 255, 0));
    }

    path = [];
    var cur = current;
    while(cur.prev) {
        path.push(cur);
        cur = cur.prev;
    }
    path.push(cur);
    if(current === end) {
        for(var i = 0; i < path.length; ++i) {
            path[i].show(color(251, 86, 7));
        }
    } else {
        for(var i = 0; i < path.length; ++i) {
            path[i].show(color(125, 0, 125));
        }
    }


}