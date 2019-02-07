//This class recieves a grid then use it to make a perfect maze.

// Stack controller
/*
	1:  TOP_WALL
	2:  RIGHT_WALL
	4:  BOTTOM_WALL
	8:  LEFT_WALL
	16: FREE
	32: VISITED
	64: DISCARDED
	128: CHECKING
*/

var FREE = 16;
var VISITED = 32;
var DISCARDED = 64;
var CHECKING = 128;


// Used to get the top of the stack without popping out elements.
Array.prototype.top = function() {
	return this[this.length-1];
};
// Used to get a random position of the array.
Array.prototype.getRandom = function() {
	return this[Math.round(Math.random()*(this.length-1))];
};

class Builder
{
	constructor( grid )
	{
		this.maze = grid;
		this.startFlag = 0; // On sequential algorithms will start building from this index.
		this.stack = [ this.startFlag ]; // Stack that store the index of each cell visited.
		this.moves = []; // Stack that store every movement realized on building.
		this.method = "none";

		// Mark the startFlag cell as on checking.
		this.checkingCell(
			this.currentPosition.x, 
			this.currentPosition.y
		);
	}

	get buffer()
	{
		return this.maze;
	}

	reset( grid, startFlag = 0 )
	{
		this.maze = grid;
		this.startFlag = 0; // On sequential algorithms will start building from this index.
		this.stack = [ startFlag ]; // Stack that store the index of each cell visited.
		this.moves = []; // Stack that store every movement realized on building.
		// Mark the startFlag cell as on checking.
		this.checkingCell(
			this.currentPosition.x, 
			this.currentPosition.y
		);
	}

	freeCell ( x, y )
	{
		this.maze.turnOn(x,y,FREE);
		this.maze.turnOff(x,y,VISITED);
		this.maze.turnOff(x,y,DISCARDED);
		this.maze.turnOff(x,y,CHECKING);		
	}

	visitCell( x, y )
	{
		this.maze.turnOff(x,y,FREE);
		this.maze.turnOff(x,y,DISCARDED);
		this.maze.turnOff(x,y,CHECKING);
		this.maze.turnOn(x,y,VISITED);
	}

	discardCell( x, y )
	{
		this.maze.turnOff(x,y,FREE);
		this.maze.turnOff(x,y,VISITED);
		this.maze.turnOff(x,y,CHECKING);
		this.maze.turnOn(x,y,DISCARDED);
		console.log("Discarding cell: " +x+ " " + y);
		console.log( ( Grid.isBitOn(this.maze.cell(x,y), DISCARDED) ) );
	}

	checkingCell( x, y )
	{
		this.maze.turnOff(x,y,FREE);
		this.maze.turnOff(x,y,VISITED);
		this.maze.turnOff(x,y,DISCARDED);
		this.maze.turnOn(x,y,CHECKING);
	}

	isPerfect()
	{
		return !(this.maze.paths.length > 1);
	}

	// Get the position of the cell that is being checked.
	get currentPosition()
	{
		return {
			x: this.maze.to_x(this.currentIndex),
			y: this.maze.to_y(this.currentIndex),
		}
	}

	// Return the position of the last visited cell at the stack.
	get lastPosition()
	{
		return {
			x: this.maze.to_x(this.lastIndex),
			y: this.maze.to_y(this.lastIndex),
		}
	}

	get currentIndex ()
	{
		return this.stack.top();
	}


	get lastIndex ()
	{
		return this.stack[this.stack.length-2];
	}

	// Get a direction bit that represents the last movement direction.
	get lastMove()
	{
		return this.moves.top();
	}

	set lastMove( lm )
	{
		this.moves.push(lm);
	}

	canMoveTo( directionBit )
	{
		let newIndex = this.maze.neighborIndex( 
				this.currentPosition.x, 
				this.currentPosition.y,
				directionBit
		);
		// If the index is outside return false.
		return !this.maze.outside(newIndex);
	}

	move( directionBit )
	{
		// store the new index of the actual cell.
		if (!this.canMove()) return false;

		//else
		// Remove the walls to make a path.
		this.maze.removeWall(
			this.currentPosition.x, 
			this.currentPosition.y,
			directionBit
		);
		// Update the current index ( set as the index of the cell at the direction ).
		this.stack.push(
			this.maze.neighborIndex( 
					this.currentPosition.x, 
					this.currentPosition.y,
					directionBit
			)
		);
		// Update the last sucessefull movementation.
		this.lastMove = directionBit;
	}

	update()
	{
		// Mark the last cell on checking as visited.
		this.visitCell(
			this.lastPosition.x, 
			this.lastPosition.y
		);
		// Mark the current cell as on checking.
		this.checkingCell(
			this.currentPosition.x, 
			this.currentPosition.y
		);

	}	

	// Back one step on building.
		// Actually `back()` have a problem that im not trying to solve now.
		// The problem is: To back a step we have to split back the paths array
		// of the current index and the last index into two different sets of paths again
		// and that require a unmerge function or something like that
		// to make the paths back to a previous state.
		// I think im going to make a stack of grids but i will solve this later.
	back()
	{
		if ( this.stack.length <= 1 ) return;
		this.visitCell(
			this.currentPosition.x, 
			this.currentPosition.y
		);
		this.stack.pop();
		this.moves.pop();
		this.update();
	}

	// Go to the next step of a maze generation selected method.
	next()
	{
		switch( this.method )
		{
			case "recursive backtrack":
				if(this.recursive_backtrack() != 1)
					this.update();
			break;

			default: // case none:
				this.update();
		}
	}

	// Return an array with the directions of cells around that are free.
	freeCellsAround()
	{
		let atTop = this.maze.cell( 
				this.currentPosition.x,
				this.currentPosition.y-1
		);
		let atRight = this.maze.cell( 
				this.currentPosition.x+1,
				this.currentPosition.y
		);
		let atBottom = this.maze.cell( 
				this.currentPosition.x,
				this.currentPosition.y+1
		);
		let atLeft = this.maze.cell( 
				this.currentPosition.x-1,
				this.currentPosition.y
		);
		let freeCells = [
			(atTop != -1 && Grid.isBitOn(atTop, FREE)) ?TOP :-1,
			(atRight != -1 && Grid.isBitOn(atRight, FREE))?RIGHT :-1,
			(atBottom != -1 && Grid.isBitOn(atBottom, FREE))?BOTTOM :-1,
			(atLeft != -1 && Grid.isBitOn(atLeft, FREE))?LEFT :-1,
		];

		return freeCells.filter( function (value) {
			return value != -1;
		});
	}

	canMove()
	{
		return (this.freeCellsAround().length > 0);
	}

	init( method )
	{
		this.method = method;
	}

	recursive_backtrack()
	{
		if (this.isPerfect()) return 1;
		//else
		if (this.canMove())
			this.move(this.freeCellsAround().getRandom());
		else 
			this.back();
	}
}