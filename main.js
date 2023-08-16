var w = 40;



function isInArea(x, y, columns, rows) {        
    if(0 <= x && x < columns) {
        if(0 <= y && y < rows) {
            return true; 
        }
    }
    return false;
}



function deleteWall(a, b) {
    let x = a.i - b.i;
    let y = a.j - b.j;

    if(x === 1) {
        a.wall[3] = false;
        b.wall[1] = false;
    } else if(x === -1) {
        a.wall[1] = false;
        b.wall[3] = false;
    }
    
    if(y === 1) {
        a.wall[2] = false;
        b.wall[0] = false;
    } else if(y === -1) {
        a.wall[0] = false;
        b.wall[2] = false;
    }
}



function make2DArray(columns, rows) {  
    let arr = new Array(columns);
    for(let i = 0; i < arr.length; ++i) {
        arr[i] = new Array(rows);
    }

    for(let i = 0; i < columns; ++i) {
        for(let j = 0; j < rows; ++j) {
            arr[i][j] = new Cell(i, j);
        }
    }

    return arr;
}

var isMazeReady = false;

var stack = [];
var current;
var columns;
var rows;
var grid;

var openQueue = [];
var visitedList = [];
var path = [];
var start;
var end;



function ElementRemove(array, elem) {
    for(var i = array.length - 1; i >= 0; --i) {
        if(array[i] == elem) {
            array.splice(i, 1);
        }
    }
}



function heuristic(a, b) {
    // return dist(a.i, a.i, b.j, b.j);
    return abs(a.i - b.i) + abs(a.j - b.j);
}



function Cell(i, j) {

    this.i = i;
    this.j = j;
    this.visited = false;

    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.prev = undefined;

                //up  right  bottom left      // Wall-sides
    this.wall = [true, true, true, true];

    
    this.showMaze = function(cur) {

        let x = this.i * w;
        let y = this.j * w;
        
        stroke(255);
        // strokeWeight(4);
        if (this.wall[2]) {
            line(x, y, x + w, y);
        }
        if (this.wall[1]) {
            line(x + w, y, x + w, y + w);
        }
        if (this.wall[0]) {
            line(x + w, y + w, x, y + w);
        }
        if (this.wall[3]) {
            line(x, y + w, x, y);
        }
        
        if(this.visited) {
            noStroke();
            fill(255, 0, 255, 100);
            rect(x, y, w, w);
        }
        
        if(this == cur) {
            noStroke();
            fill(30, 100, 255, 200);
            rect(x, y, w, w);
        }
        
    }

    
    this.getNextDirection = function() { 
                      //up    right    bottom   left
        let shifts = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // closest cells
        var neighbors = [];

        let i = this.i;
        let j = this.j;

        for(let k = 0; k < shifts.length; ++k) {
            if(isInArea(i + shifts[k][0], j + shifts[k][1], columns, rows) && !grid[i + shifts[k][0]][j + shifts[k][1]].visited) {
                neighbors.push(grid[i + shifts[k][0]][j + shifts[k][1]]);
            }
        }

        if(neighbors.length > 0) {
            return neighbors[floor(random(0, neighbors.length))];
        } else {
            return undefined;
        }
    
    }


    this.accessibleNeighbors = [];

    this.getAccessNeighbors = function() {
        let shifts = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // closest cells to cur 

        let i = this.i;
        let j = this.j;

        for(var k = 0; k < shifts.length; ++k) {
            
            if(isInArea(i + shifts[k][0], j + shifts[k][1], columns, rows) && !this.wall[k]) {  
                this.accessibleNeighbors.push(grid[i + shifts[k][0]][j + shifts[k][1]]);
            }
        }
    }


    this.showAstar = function(color, endPath) {
        fill(color);
        circle(this.i * w + w / 2, this.j * w + w / 2, w / 4);

        if(endPath) {
            fill(0);
            circle(this.i * w + w / 2, this.j * w + w / 2, w / 8);
        }


    }

}



function setup() {
    createCanvas(1200, 800);
    console.log("MazeGenerator");

    columns = width / w;
    rows = height / w;
    grid = make2DArray(columns, rows);


    current = grid[0][0];
    current.visited = true;
    stack.push(current);

    start = grid[0][0];
    end = grid[columns - 1][rows - 1];

    openQueue.push(start);

}



function draw() {
    background(51);
    
    if(!isMazeReady) {
        const button = document.querySelector("input");
        button.style.visibility = 'hidden';
        
        
        for(let i = 0; i < columns; ++i) {    
            for(let j = 0; j < rows; ++j) {
                grid[i][j].showMaze(current);
            }
        }
        
        
        if(stack.length > 0) {
            current = stack.pop();
            
            var next = current.getNextDirection();
            
            if(next != undefined) {
                stack.push(current);
                
                deleteWall(current, next);
                
                next.visited = true;
                
                stack.push(next);
            }        
        } else {
            button.style.visibility = 'visible';
            button.addEventListener("click", disableButton);

            function disableButton() {
              button.disabled = true;

              isMazeReady = true;
              button.style.visibility = 'hidden';
            }
            // isMazeReady = true;
            
            for(let i = 0; i < columns; ++i) {
                for(let j = 0; j < rows; ++j) {
                    grid[i][j].getAccessNeighbors();
                }
            }

            
        }
    } else {
        // frameRate(20);
        for(let i = 0; i < columns; ++i) {    
            for(let j = 0; j < rows; ++j) {
                grid[i][j].showMaze();
            }
        }
    
        if(openQueue.length > 0) {
            var winner = 0;
            
            for(var i = 0; i < openQueue.length; ++i) {
                if(openQueue[winner].f > openQueue[i].f) {
                    winner = i;
                }
            }
            
            var cur = openQueue[winner];
            
            if(cur === end) {
                noLoop();
                console.log("Done!");
            } else {
                
                visitedList.push(cur);
                ElementRemove(openQueue, cur);
                
                // cycling related vertexes to current
                var listOfNeighbors = cur.accessibleNeighbors;    
                for(var i = 0; i < listOfNeighbors.length; ++i) {
                    var neighbor = listOfNeighbors[i];
                    
                    if(visitedList.includes(neighbor)) {
                        continue; 
                    }
                    
                    var tmpG = cur.g + 1;
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
                        neighbor.prev = cur;
                        neighbor.h = heuristic(neighbor, end);
                        // console.log(neighbor.i, neighbor.j); 
                        // console.log(neighbor.h); 
                        neighbor.f = neighbor.g + neighbor.h;
                    }
        
                }
            }

            
        } else {
    
            console.log("No solution!");
            noLoop();
            return;
    
        }
            
        
    
        // for(var i = 0; i < columns; i++) {
        //     for(var j = 0; j < rows; j++) {
        //         grid[i][j].showAstar(color(0));
        //     }
        // }
    
        for(var i = 0; i < visitedList.length; ++i) {
            visitedList[i].showAstar(color(58, 134, 255));
        }
    
        for(var i = 0; i < openQueue.length; ++i) {
            openQueue[i].showAstar(color(0, 255, 0));
        }
    
        path = [];
        var curVertex = cur;
        while(curVertex.prev) {
            path.push(curVertex);
            curVertex = curVertex.prev;
        }
        path.push(curVertex);
        if(cur === end) {            
            noFill();
            stroke(251, 86, 7);
            beginShape();
            for(var i = 0; i < path.length; ++i) {
                vertex(path[i].i * w + w / 2, path[i].j * w + w / 2);
            }
            endShape();
            for(var i = 0; i < path.length; ++i) {
                path[i].showAstar(color(251, 86, 7), true);
            }
        } else {
            for(var i = 0; i < path.length; ++i) {
                path[i].showAstar(color(236, 0, 236));
            }
        }

    }
    
}
