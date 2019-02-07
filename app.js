var canvas;
var context;
var fps = 60;
var backgroundColor = "rgb(30,30,30)";
var wallColor = "darkgrey";
var startBuilding = false;
var removeDecoration = false;
var startPoint = 0;


window.addEventListener( "load", function( event ){
	
	// Auth:
	console.log("Made by: Pleshw");

	// Canvas setup.
	canvas  = document.getElementById( 'canvas' );

	// Canvas settings.
	canvas.width  = 800;
	canvas.height = 600;

	// Creates the grid object.
	let grid = new Grid( 11, 11 );

	// Creates the render object.
	let render = new Render( canvas );

	// Creates the builder object.
	let builder = new Builder( grid, render );

	// Call ´Render.draw´ function n times per milisecond.
	setInterval( 
		function(){

			if (!removeDecoration)
			{ 
				for( let i = 0; i < builder.buffer.bufferSize; i++ )
				{	
					let x = builder.buffer.to_x(i);
					let y = builder.buffer.to_y(i);
					// Fill cells that builder mark as visited.
					if ( Grid.isBitOn(builder.maze.cell(x,y), VISITED) )
						render.fillCell( x, y, "rgb(80,100,190)", ((90/2)/100)*render.cellsHeight );
					// Fill cells that builder mark as discarded.                        //34% of cellwidth
					if ( Grid.isBitOn(builder.maze.cell(x,y), DISCARDED) )
						render.fillCell( x, y, "rgb(160,70,70)", ((4/2)/100)*render.cellsHeight );
					// Fill cells that builder mark as discarded.
					if ( Grid.isBitOn(builder.maze.cell(x,y), CHECKING) )
						render.fillCell( x, y, "rgb(80,170,160)", ((40/2)/100)*render.cellsHeight );
				}
			}

			if ( startBuilding ) builder.next();

			render.draw( builder.buffer, backgroundColor, wallColor );
			render.unfillCells();
		}, 1000/fps /* 60(fps) frames/times per second */
	);


	// Reset the grid the builder and the render.
	function fullClear ()
	{
		grid.clean();
		render.reset( grid );
		builder.reset( grid, startPoint );		
	}



	// Canvas events.
	let rect = canvas.getBoundingClientRect();
	canvas.addEventListener( "mousemove", function(event){
		canvasMousePosition = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
		render.trackCursor(canvasMousePosition);
	});


	// Input events.
	document.getElementById("backgroundColor").addEventListener( "change", function(){
		backgroundColor = this.value;
	});

	document.getElementById("wallColor").addEventListener( "change", function(){
		wallColor = this.value;
	});

	document.getElementById("startX").addEventListener("keyup", function(){
		let val = parseInt(this.value);
		if (val > 0)
		{
			startPoint = builder.maze.toIndex( val, builder.currentPosition.y );
			fullClear();
		}
		startBuilding = false;
	});

	document.getElementById("startY").addEventListener("keyup", function(){
		let val = parseInt(this.value);
		if (val > 0)
		{
			startPoint = builder.maze.toIndex( builder.currentPosition.x, val );
			fullClear();
		}
		startBuilding = false;
	});

	document.getElementById("gridCols").addEventListener("keyup", function(){
		let val = parseInt(this.value);
		if (val > 0) grid._cols = val;
		else grid._cols = 10;
		render.reset( grid );
		builder.reset( grid, startPoint );
		startBuilding = false;
	});

	document.getElementById("gridRows").addEventListener("keyup", function(){
		let val = parseInt(this.value);
		if (val > 0) grid._rows = val;
		else grid._rows = 10;
		render.reset( grid );
		builder.reset( grid, startPoint );
		startBuilding = false;
	});


	document.getElementById("gridMarginTop").addEventListener("keyup", function(){
		let val = parseInt(this.value);
		if (val > 0) render.gridMarginTop = val;
		else render.gridMarginTop = 50;
	});

	document.getElementById("gridMarginLeft").addEventListener("keyup", function(){
		let val = parseInt(this.value);
		if (val > 0) render.gridMarginLeft = val;
		else render.gridMarginLeft = 50;
	});

	document.getElementById("builderStarter").addEventListener("click", function(){
		builder.init( "recursive backtrack" );
		startBuilding = true;
	});

	document.getElementById("builderStop").addEventListener("click", function(){
		startBuilding = false;
	});

	document.getElementById("decoration").addEventListener("click", function(){
		removeDecoration = !removeDecoration;
	});

	document.getElementById("reset").addEventListener("click", function(){
		fullClear();
		startBuilding = false;
	});
});