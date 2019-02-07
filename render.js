class Render
{
	constructor( canvas, grid )
	{
		this.canvasWidth  = canvas.width;
		this.canvasHeight  = canvas.height;
		this.context = canvas.getContext( "2d" );
		
		this.cellsWidth = 0;
		this.cellsHeight = 0;
		this.gridMarginLeft = 50;
		this.gridMarginTop = 50;

		this.cursor = { 
			x: canvas.width/2, 
			y: canvas.height/2 
		};
		this.filledCells = [];
	}

	reset( grid )
	{
		this.unfillCells();
		this.normalizeGrid( grid );
	}

	// Draw the grid at the canvas.
	draw( grid, backgroundColor, wallColor )
	{
		this.normalizeGrid( grid );
		// Draw the background first.
		this.drawBackground( backgroundColor );
		// Draw walls over the background.
		this.drawWalls( grid, wallColor );
		// Draw the fill of cells over the cells.
		for( let i = 0; i < this.filledCells.length; i++ )
			this.drawFilledCell( 
				this.filledCells[i].x, 
				this.filledCells[i].y,
				this.filledCells[i].color,
				this.filledCells[i].margin,
				this.filledCells[i].isCircle
			);
		// After cells walls drawed draw the limits.
		this.drawBottomLimit( grid._cols, grid._rows, wallColor );
		this.drawLeftLimit( grid._rows, wallColor );
	}

	// Mark a cell, at the given position, as filled, with the following properties.
	fillCell( x, y, color, margin = 0, isCircle = false )
	{
		let fillValues = {			
			x: x, 
			y: y, 
			color: color,
			margin: margin,
			isCircle: isCircle
		};
		let index = this.filledCells.findIndex( v => (v.x == fillValues.x && v.y == fillValues.y) );
		if ( index != -1)
			this.filledCells[index] = fillValues;
		else
			this.filledCells.push(fillValues);
	}

	unfillCells()
	{
		this.filledCells = [];
	}

	drawBackground( color )
	{
		this.context.fillStyle = color;
		this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
	}

	// Mark a cell in the position as filled.

	// Draw cell walls with the selected colors.
	drawWalls( grid, color )
	{
		this.context.strokeStyle = color;
		for( let i = 0; i < grid.bufferSize; i++ )
		{
			// Get coordinates based on index.
			let x = grid.to_x(i);
			let y = grid.to_y(i);
			//Draw walls
			if ( Grid.isBitOn(grid.cell(x,y),TOP_WALL) ) 
				this.drawTopWallAt(x,y);
			if ( Grid.isBitOn(grid.cell(x,y),RIGHT_WALL) )
				this.drawRightWallAt(x,y);
		}
	}

	// Fill the cell at the given index.
	drawFilledCell( x, y, color, fillMargin, isCircle )
	{
		let cellPos = this.cellCanvasPosition( x, y );
		this.context.fillStyle = color;
		// is square / is circle
		if (!isCircle)
			this.drawFilledSquareCell( cellPos.x, cellPos.y, fillMargin )
		else
			this.drawFilledElipseCell( cellPos.x, cellPos.y, fillMargin )

		// Link at is the byte that indicate in which direction the cell should be linked.
		//this.linkCell(  cellPos.x, cellPos.y, fillMargin, TOP+RIGHT+BOTTOM+LEFT  )
	}

	// Draw an elipsed fill cell at the position
	drawFilledElipseCell( x, y, margin )
	{
		this.context.beginPath();
		this.context.ellipse( 
			((this.cellsWidth-(margin*2))/2)+(x+margin), //x
			((this.cellsHeight-(margin*2))/2)+(y+margin), //y
			((this.cellsHeight-(margin*2))/2), //radius x
			(this.cellsHeight-(margin*2))/2,// radius y
			Math.PI, // rotation
			0, //start angle
			2 * Math.PI // end angle
		);
		this.context.fill();
	}

	// Draw an squared fill cell at the position
	drawFilledSquareCell( x, y, margin )
	{
		this.context.fillRect( 
			x+margin, 
			y+margin, 
			this.cellsWidth-(margin*2), 
			this.cellsHeight-(margin*2) 
		);
	}

	// Get the cell drawing position.
	cellCanvasPosition( x, y )
	{
		return {
			x: this.gridMarginLeft+(x*this.cellsWidth),
			y: this.gridMarginTop+(this.cellsHeight*y)
		}
	}

	// Draw top wall of a cell in the position.
	drawTopWallAt( x, y )
	{
		let lineStart = this.cellCanvasPosition( x, y );
		let lineEnd   = this.cellCanvasPosition( x+1, y );
		this.context.beginPath();
		this.context.moveTo( 
			lineStart.x, 
			lineStart.y 
		);
		this.context.lineTo( 
			lineEnd.x, 
			lineEnd.y
		); 
		this.context.closePath();
		this.context.stroke();
	}

	// Make a visual link between the cells.
		// The '+1's and  '+2's operations exist to offset the walls.
	linkCell( x, y, margin, direction )
	{
		// Top link.
		if (Grid.isBitOn(direction, TOP))
			this.context.fillRect( 
				x+margin, 
				y-1,
				this.cellsWidth-(margin*2), 
				margin+2
			);
		// Right link.
		if (Grid.isBitOn(direction, RIGHT))
			this.context.fillRect( 
				x+this.cellsWidth-margin-1, 
				y+margin,
				margin+2, 
				this.cellsHeight-(margin*2)
			);
		// Bottom link.
		if (Grid.isBitOn(direction, BOTTOM))
			this.context.fillRect( 
				x+margin, 
				y+this.cellsHeight-margin-1,
				this.cellsWidth-(margin*2), 
				margin+2
			);
		// Left link.
		if (Grid.isBitOn(direction, LEFT))
			this.context.fillRect( 
				x, 
				y+margin,
				margin+2, 
				this.cellsHeight-(margin*2)
			);
	}

	// Draw right wall of a cell in the position.
	drawRightWallAt( x, y )
	{
		let lineStart = this.cellCanvasPosition( x+1, y );
		let lineEnd   = this.cellCanvasPosition( x+1, y+1 );
		this.context.beginPath();
		this.context.moveTo( 
			lineStart.x, 
			lineStart.y 
		);
		this.context.lineTo( 
			lineEnd.x, 
			lineEnd.y
		); 
		this.context.closePath();
		this.context.stroke();
	}

	// Draw the line of bottom limit of the grid.
	drawBottomLimit( gridCols, gridRows, color )
	{
		this.strokeStyle = color;
		this.context.beginPath();
		this.context.moveTo( 
			this.gridMarginLeft, 
			this.gridMarginTop+( (gridRows*this.cellsHeight) ) 
		);
		this.context.lineTo( 
			this.gridMarginLeft+( (gridCols*this.cellsWidth) ), 
			this.gridMarginTop+( (gridRows*this.cellsHeight) ) 
		); 
		this.context.closePath();
		this.context.stroke();
	}

	// Draw the line of left limit of the grid.
	drawLeftLimit( gridRows, color )
	{
		this.strokeStyle = color;
		this.context.beginPath();
		this.context.moveTo( this.gridMarginLeft, this.gridMarginTop );
		this.context.lineTo( this.gridMarginLeft, this.gridMarginTop+((gridRows*this.cellsHeight)) ); 
		this.context.closePath();
		this.context.stroke();
	}


	get _gridMarginTop()
	{
		return this.gridMarginTop;
	}

	get _gridMarginLeft()
	{
		return this.gridMarginLeft;
	}

	set _gridMarginTop( n )
	{
		this.gridMarginTop = n;
	}

	set _gridMarginLeft( n )
	{
		this.gridMarginLeft = n;
	}

	// Get a 2d position ´x,y´ from a cursor.
	trackCursor( cursorPosition )
	{
		this.cursor = cursorPosition;
	}

	// Make a more proportional grid visualization.
	/* 
	 *	Change the ´cellsWidth´ and ´cellsHeight´ based in defined proportion with the margins.
	*/  
	normalizeGrid( grid )
	{
		if ( grid._cols == grid._rows )
		{
			this.makeEqualProportion(grid);
		}else
		{
			if ( grid._cols > grid._rows )
				this.makeColsProportion(grid);
			else // ( grid._rows > grid._cols )
				this.makeRowsProportion(grid);
		}
	}

	// Make the cells width/height proportion when the grid have same num of cols and rows
	makeEqualProportion( grid )
	{
		this.cellsWidth  = (this.canvasWidth-(this.gridMarginLeft*2))/grid._cols;
		this.cellsHeight = (this.canvasHeight-(this.gridMarginTop*2))/grid._rows;	
	}

	// Make the cells width/height proportion when the grid have more cols than rows
	makeColsProportion( grid )
	{
		let proportion = Math.floor(grid._cols/grid._rows);
		this.cellsWidth  = (this.canvasWidth-(this.gridMarginLeft*2))/grid._cols;
		this.cellsHeight = Math.floor(((this.canvasHeight-(this.gridMarginTop*2))/grid._rows)/proportion);	
	}
	
	// Make the cells width/height proportion when the grid have more rows than cols
	makeRowsProportion( grid )
	{
		let proportion = Math.floor(grid._rows/grid._cols);
		this.cellsWidth  = Math.floor(((this.canvasWidth-(this.gridMarginLeft*2))/grid._cols)/proportion);
		this.cellsHeight = (this.canvasHeight-(this.gridMarginTop*2))/grid._rows;
	}

}