/*
	THIS CODE WAS PLANNED TO C++ AND IT IS ONLY A REPRESENTATION IN JAVASCRIPT.
*/

// The grid class represents a map of cells.

// Each cell represent a position at the grid.
// Each cell have a number from 0 to 255 that represents active bytes.
// Each byte represents a cell state.

// The grid class provide a ´paths´ variable.
/*
 *	The paths variable represents the cells that make path ones with others.
 *	Any path represents a index of a cell.
 *	A path contain a set of ´cell´ that make path with the cell at the index.
 *	Whenever a wall is removed the sets on its path merge.
 */


/* 
>> CELL STATES <<
{
	1:  TOP_WALL ON
	2:  RIGHT_WALL ON
	4:  BOTTOM_WALL ON
	8:  LEFT_WALL ON
	16: FREE ON // - > special bit to builder
}
*/

// Bit representation of walls. ( Will be used for bitwise operations )
var TOP_WALL    = 1;
var RIGHT_WALL  = 2;
var BOTTOM_WALL = 4;
var LEFT_WALL   = 8;

// Bit representation of directions. ( Usual )
var TOP    = 1;
var RIGHT  = 2;
var BOTTOM = 4;
var LEFT   = 8;

function opositeBit( wallBit )
{
	switch( wallBit )
	{
		case TOP:
			return BOTTOM;
		case RIGHT:
			return LEFT;
		case BOTTOM:
			return TOP; 
		default: // case LEFT
			return RIGHT;
	}
}



// Grid class
class Grid
{
	constructor( cols, rows ) // Grid constructor.
	{
		this.cells = []; // The cells array.
		this.paths = [];
		this.cols = cols; // The number of cols on grid.
		this.rows = rows; // The number of rows on grid.
	
		for( let i = 0; i < (this.cols*this.rows); i++ ) // All walls on for every cell.
			this.cells[i] = 31;

		for( let i = 0; i < (this.cols*this.rows); i++ )
			this.paths[i] = [ i ]; // The indexes of cells that make a path with.

	}


// Return the index representation of a given ´x,y´ position.
toIndex( x, y )
{
	return (y*this.cols) + x;
}
// Return the ´x´ position representation of a given index.
to_x( index )
{
	return Math.floor(index%this.cols);
}
// Return the ´y´ position representation of a given index.
to_y( index )
{
	return Math.floor(index/this.cols);
}


	// Reset the number of cols.
	// Note: Reset the cols also reset all the cells.
	set _cols(n)
	{
		this.cols = n;
		this.clean();
	}

	// Reset the number of rows.
	// Note: Reset the rows also reset all the cells.
	set _rows(n)
	{
		this.rows = n;
		this.clean();
	}

	clean()
	{
		this.cells = [];
		this.paths = [];
		for( let i = 0; i < (this.cols*this.rows); i++ ) // All walls on for every cell.
			this.cells[i] = 31;

		for( let i = 0; i < (this.cols*this.rows); i++ )
			this.paths[i] = [ i ]; // The indexes of cells that make a path with.		
	}	

	// Return the number of collums of the grid.
	get _cols()
	{
		return this.cols;
	}

	// Return the number of rows of the grid.
	get _rows()
	{
		return this.rows;
	}

	// Return the number of cells of the grid.
	get bufferSize()
	{
		return this.cols * this.rows;
	}

	// Checks if a position is outside the grid.
		// if only x is setted check the index.
	outside( x, y = undefined )
	{
		if ( x < 0 ) return true;
		if ( x >= this.bufferSize ) return true;
		if ( y != undefined ) 
		{
			if ( x >= this.cols ) return true;
			if ( y < 0 ) return true;
			if ( y >= this.rows ) return true;
			if ( this.toIndex(x,y) >= this.bufferSize ) return true;
			if ( this.toIndex(x,y) < 0 ) return true;
		}
		return false;
	}


	// Return the state of a grid cell in the position `x,y`.
	cell( x, y )
	{
		if (this.outside(x, y)) return -1;
		return this.cells[ this.toIndex(x,y) ];
	}

	// Return the neighbor position of a given index if it exists.
	neighborPosition( index, wallBit )
	{
		switch( wallBit )
		{
			case TOP:
				if (!this.outside(index-this.cols))
					return {
						x: this.to_x(index-this.cols),
						y: this.to_y(index-this.cols)
					}
			break;
			case RIGHT:
				if (!this.outside(index+1))
					return {
						x: this.to_x(index+1),
						y: this.to_y(index+1)
					}
			break;
			case BOTTOM:
				if (!this.outside(index+this.cols))
					return {
						x: this.to_x(index+this.cols),
						y: this.to_y(index+this.cols)
					}
			break;
			default: // case LEFT
				if (!this.outside(index-1))
					return {
						x: this.to_x(index-1),
						y: this.to_y(index-1)
					}
		}
		return -1;
	}

	// Return the neighbor index of a given position if it exists.
	neighborIndex( x, y, wallBit )
	{
		switch( wallBit )
		{
			case TOP:
				if (!this.outside(this.toIndex(x,y-1)))
					return this.toIndex(x,y-1);
			break;
			case RIGHT:
				if (!this.outside(this.toIndex(x+1,y)))
					return this.toIndex(x+1,y);
			break;
			case BOTTOM:
				if (!this.outside(this.toIndex(x,y+1)))
					return this.toIndex(x,y+1);
			break;
			default: // case LEFT
				if (!this.outside(this.toIndex(x-1,y)))
					return this.toIndex(x-1,y);
		}
		return -1;
	}

	// Checks if the ´bit´ is on for the cell at ´x,y´.
	// Param cell: the cell to be checked.
	// Param bit: the bit that represent the wall bit to be checked.
	static isBitOn( cell, bit ) 
	{
		// (Bitwise operation) If the cell have the ´bit´ on it returns true.
		return (cell & bit) == bit;
	}

	// Turn on a bit.
	turnOn( x, y, bit )
	{
		if( !Grid.isBitOn( this.cell(x,y), bit ) && !this.outside(x,y) )
			this.cells[this.toIndex(x,y)] += bit;
	}

	// Turn off a bit.
	turnOff( x, y, bit )
	{
		if( Grid.isBitOn( this.cell(x,y), bit ) && !this.outside(x,y) )
			this.cells[this.toIndex(x,y)] -= bit;
	}

	// Reset a cell to its initial state
	resetCell( index )
	{
		if( !this.outside(index) )
			this.cells[index] = 31;
	}


	// Find the position of the set that contain the given index.
	findSet( index )
	{
		for( let i = 0; i < this.paths.length; i++ )
			if (this.paths[i].indexOf(index) != -1)  // If find the ´cell´ in set of cells.
				return i; // Return it index.
		return -1;
	}

	// Merge two sets of cells and make turning then into one unique path.
	merge( index1, index2 )
	{
		let indexSet1 = this.findSet(index1);
		let indexSet2 = this.findSet(index2);
		// Find the set that contain index1 then concat with the set of index2.
		this.paths[indexSet1] = this.paths[indexSet1].concat(
			this.paths[indexSet2]
		);
		// Delete the obsolete set.
		this.paths.splice( indexSet2, 1 );
	}

	// Remove the wallBit from the cell at ´x,y´ if it is on.
	// Return true if wall is removed otherwise return false( including the case of wall already removed ).
	removeWall( x, y, wallBit )
	{
		let neighborPos = this.neighborPosition(x,y,wallBit); // get the neighbor position
		if( Grid.isBitOn( this.cell(x,y), wallBit ) )
		{
			this.turnOff(x,y,wallBit); // Turn off the wall bit.
			if( !this.outside( neighborPos.x, neighborPos.y, wallBit ) )
				 // this.turnOff(neighbor.x, neighbor.y, opositeWallBit)
				this.cells[this.neighborIndex(x,y,wallBit)] -= opositeBit(wallBit); 
			// Merge the cells that are now making a path.
			this.merge(this.toIndex(x,y), this.neighborIndex(x,y,wallBit));
			return true;
		}
		return false;
	}

}