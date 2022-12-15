let canvasX
let canvasY
let backgroundColor
let gridX = 20
let gridY = 20
let gridSpacingX
let gridSpacingY
let cells
let startingCellX
let startingCellY
let endingCellX
let endingCellY
let activeCellX
let activeCellY
let isGenerating
let path
let gameOver = false
let textHeight

function setup() {
    let smallSide = Math.min(windowWidth, windowHeight * 0.94)
    canvasX = smallSide * gridX / Math.max(gridX, gridY)
    canvasY = smallSide * gridY / Math.max(gridX, gridY)
    let myCanvas = createCanvas(canvasX, canvasY)
    myCanvas.parent("#canvas")
    backgroundColor = window.getComputedStyle(document.getElementById("canvas")).getPropertyValue('background-color')
    
	
    textHeight = 0.05 * min(canvasX, canvasY)
    
    setupGrid()
}

function setupGrid() {
    gridSpacingX = canvasX / gridX
    gridSpacingY = canvasY / gridY
    cells = []
    isGenerating = true
    path = []
    startingCellX = 0
    startingCellY = 0
    endingCellX = gridX - 1
    endingCellY = gridY - 1

    // Sets up each cell's position and size
    for (let i = 0; i < gridX; i++) {
        cells.push([])
        for (let j = 0; j < gridY; j++) {
            cells[i].push(new cell(i * gridSpacingX, j * gridSpacingY, gridSpacingX, gridSpacingY))
        }
    }

    // Gives each cell it's list of neighbors, putting null there if the neighbor does not exist
    for (let i = 0; i < gridX; i++) {
        for (let j = 0; j < gridY; j++) {
            // Left Neighbor
            if (i > 0) {
                cells[i][j].neighbors.push(cells[i - 1][j])
            } else {
                cells[i][j].neighbors.push(null)
            }

            // Top Neighbor
            if (j > 0) {
                cells[i][j].neighbors.push(cells[i][j - 1])
            } else {
                cells[i][j].neighbors.push(null)
            }

            // Right Neighbor
            if (i < gridX - 1) {
                cells[i][j].neighbors.push(cells[i + 1][j])
            } else {
                cells[i][j].neighbors.push(null)
            }

            // Bottom Neighbor
            if (j < gridY - 1) {
                cells[i][j].neighbors.push(cells[i][j + 1])
            } else {
                cells[i][j].neighbors.push(null)
            }
        }
    }
    
    // Starts the active cell in the top left corner
    activeCellX = startingCellX
    activeCellY = startingCellY
    cells[activeCellX][activeCellY].visited = true
    path.push([activeCellX, activeCellY])

    cells[endingCellX][endingCellY].color = color(220, 220, 220)

    cells.forEach(column => column.forEach(cell => cell.draw()))

}

function draw() {
    if (gameOver) {
        return
    } else {

        // Sets the background of the Canvas
        background(backgroundColor)

        // Loops through each column of the grid and draws the individual cells
        cells.forEach(column => column.forEach(cell => {
            if (cell.traversed) {
                cell.draw(color(100, 100, 100))
            } else {
                cell.draw()
            }
        }))

        cells[activeCellX][activeCellY].draw(color(200, 150, 0))



        if (isGenerating) {
            makeNextMove()
        } else if (activeCellX == endingCellX && activeCellY == endingCellY) {
            gameOver = true
			window.open("https://westernkiwi.github.io/Mind_Palace/","_self")
        } else {
			push()
			fill(color(100, 100, 100))
			textSize(textHeight)
			stroke(0)
			strokeWeight(5)
			textAlign(CENTER)
			textFont("courier")
			text("Navigate my muddled thoughts.\nThere is light at the end!", canvasX / 2, canvasY - textHeight / 2 * 3)
			pop()
	}
    }
}

function makeNextMove() {
    let options = []
    let choice;
    let activeCell = cells[activeCellX][activeCellY]
    
    // Looks for any valid moves, and loads them into the options array
    for (let i = 0; i < 4; i++) {
        if (activeCell.neighbors[i] != null && activeCell.neighbors[i].visited == false) {
            options.push(i)
        }
    }

 
    if (options.length == 0) {
        // If I have no options, go to the previous spot I was at in the path
        if (path.length > 0) {
            [activeCellX, activeCellY] = path.pop()
        } else {
            isGenerating = false
        }
    } else {
        // If I do have options, pick one valid option and move there, removing the walls in the process
        choice = random(options)
        switch (choice) {
            case 0:
                activeCellX--
                activeCell.walls[0] = false
                activeCell.neighbors[0].walls[2] = false
                activeCell.neighbors[0].visited = true
                break;
            case 1:
                activeCellY--
                activeCell.walls[1] = false
                activeCell.neighbors[1].walls[3] = false
                activeCell.neighbors[1].visited = true
                break;
            case 2:
                activeCellX++
                activeCell.walls[2] = false
                activeCell.neighbors[2].walls[0] = false
                activeCell.neighbors[2].visited = true
                break;
            case 3:
                activeCellY++
                activeCell.walls[3] = false
                activeCell.neighbors[3].walls[1] = false
                activeCell.neighbors[3].visited = true
                break;
            default:
        }
        path.push([activeCellX, activeCellY])
    }
}

function keyPressed() {
    if (isGenerating) {
        return
    }
    let activeCell = cells[activeCellX][activeCellY]
    if (keyCode == LEFT_ARROW) {
        if (activeCell.neighbors[0] != null && !activeCell.walls[0]) {
            activeCellX--
            activeCell.traversed = !cells[activeCellX][activeCellY].traversed
        }
    } else if (keyCode == UP_ARROW) {
        if (activeCell.neighbors[1] != null && !activeCell.walls[1]) {
            activeCellY--
            activeCell.traversed = !cells[activeCellX][activeCellY].traversed
        }
    } else if (keyCode == RIGHT_ARROW) {
        if (activeCell.neighbors[2] != null && !activeCell.walls[2]) {
            activeCellX++
            activeCell.traversed = !cells[activeCellX][activeCellY].traversed
        }
    } else if (keyCode == DOWN_ARROW) {
        if (activeCell.neighbors[3] != null && !activeCell.walls[3]) {
            activeCellY++
            activeCell.traversed = !cells[activeCellX][activeCellY].traversed
        }
    }
}

class cell {
    constructor(x = -1, y = -1, width = -1, height = -1, neighbors = [], walls = [true, true, true, true], visited = false, traversed = false, color = null) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.neighbors = neighbors
        this.walls = walls
        this.visited = visited
        this.traversed = traversed
        this.color = color
        this.draw = function(colorOverride = null) {
            noStroke()
            if (this.visited) {
                if (colorOverride != null) {
                    fill(colorOverride)
                } else {
                    if (this.color == null) {
                        fill(25, 25, 25)
                    } else {
                        fill(this.color)
                    }
                }
            } else {
                noFill()
            }
            rect(this.x, this.y, this.width, this.height)

            stroke(0)
            strokeWeight(2)

            if (this.walls[0]) {
                // Left wall exists
                line(this.x, this.y, this.x, this.y + this.height)
            }
            if (this.walls[1]) {
                // Top wall exists
                line(this.x, this.y, this.x + this.width, this.y)
            }
            if (this.walls[2]) {
                // Right wall exists
                line(this.x + this.width, this.y, this.x + this.width, this.y + this.height)
            }
            if (this.walls[3]) {
                // Bottom wall exists
                line(this.x, this.y + this.height, this.x + this.width, this.y + this.height)
            }
        }
    }
}
