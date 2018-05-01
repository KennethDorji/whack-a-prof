/*
*	hud.js
*	Heads-Up-Display
*	CLass that will implement Whack-A-Prof's Overlay
*	Score/Point System, Timer, Pause button(Maybe?)
*	Counter for each "Mole hit" to caclulate score
*/


class Hud extends Layer{
	constructor() {
      super({
          id:'game',
          hasCanvas:true,
          squareCanvas:true,
          classes:['hidden', 'fullscreen']
          });















	/*variable for pause button to be intially false
	//Pause Button work in progress
	var paused = false;
	function gamePaused()
	{
		if(!paused)
		{
			paused = true;
		}
		else if(paused)
		{
			paused = false;
		}
	}
	window.addEventListener('keydown',function(e))
	{
		//Char codes to identify Pause button, 'p' key is == 80
		var key = e.keyCode;
		if(key == 80)
		{
			gamePaused();
		}
	}
	*/

	scoreCounter()
	{
		//Function for score counter
		//Based on specs, Trustees: 10	Professors: 5	Department Head: 8



	}

	clockTimer()
	{
		//Function for Timer ticking down in Whack-A-Prof

		
	}







}