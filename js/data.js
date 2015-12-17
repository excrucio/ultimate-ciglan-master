/*
*	An enumeration describing the current state of the automaton engine.
*/
Status = {
	'Play' : 0,
	'Pause' : 1,
	'Stop' : 2
}

/*
*	An enumeration of actions which the character can perform.
*/
Action = {
	'Stop' : 0,
	'Left' : 1,
	'Right' : 2,
	'JumpLeft' : 3,
	'JumpRight' : 4,
	'Jump' : 5
}

GameStatus = {
	'Win' : 0,
	'Lose' : 1,
	'InProgress' : 2
}

{
	/*
	*	General purpose variables
	*/

	//Number used for naming states
	var nameNumber = 0;

	//Low-efficiency action queue
	var queue = [];

	//A map of states for state names
	var states = {};

	//Active transition character
	var active = null;

	//Input String
	var inputStr = '';

	//Index of the current letter
	var letterIndex = 0;

	//Current status of the automaton-running engine
	var status = Status.Stop;

	//Current game status
	var gameStatus = GameStatus.InProgress;

	//Current state in the transitions
	var currentState = undefined;

	//New state, used for defining transitiosn
	var newState = undefined;

	var instance = undefined;

	var addingState = false;

	var deletingState = false;


	/*
	*	Gets the action name from the action enum
	*/
	function actionName(action) {
		for(var k in Action) {
			if(Action[k] == action) return k;
		}

		return 'Halt';
	}

	/*
	*	Finds the first state, using numerical order.
	*/
	function findFirstAvailableState() {
		for(var s in states) {
			return states[s];
		}

		return null;
	}

	/*
	*	Gets the next available name for an automaton.
	*/
	function nextName() {
		return "S" + nameNumber++;
	}

	/*
	*	A simple model of a deterministic finine automaton state.
	*/
	function State() {
		//The automaton's name
		this.Name = nextName();
		
		//The automaton's map of transitions
		this.Transitions = {
			"a" : {"next" : undefined, "action" : undefined},
			"c" : {"next" : undefined, "action" : undefined},
			"b" : {"next" : undefined, "action" : undefined}
		};

		/*
		*	Transition setter
		*	@param input - Input character
		*	@param next  - Next state - transition target
		* 	@param action - The action the character performs for this transition
		*/
		this.SetTransition = function(input, next, action) {
			this.Transitions[input] = {"next" : next, "action" : action};
		};

		/*
		* 	@return - {next : nextState, action : action} pair.
		*/
		this.GetTransition = function(input) {
			return this.Transitions[input];
		};
	}

	/*
	*	Hides the input-character-selection buttons
	*/
	function hideButtons() {
		//$('.circle').fadeOut();
		$('.circle').css('opacity', '0');
	}

	/*
	*	Gets the current mouse position from the event
	*/
	function mousePos (e) {
        return {'x' : e.pageX, 'y' : e.pageY};
	}

	function getClosest(x, y) {
		var ret = {'x' : x, 'y': y};
		var dist = Infinity;

		$('.automatonimg').each(function(i) {
			//$(this).css('background-color', 'red');
			var position = $(this).parent().position();

			var distance = Math.floor(Math.sqrt(
				Math.pow(position.left - x, 2),
				Math.pow(position.top - y, 2)
				));

			if(distance < dist) {
				ret = {'x' : position.left, 'y': position.top};
				dist = distance;
			}
		});

		return ret;
	}

	/*
	*	Places the action selection menu on the click location
	*/
	function placeMenu(e) {
		var pos = mousePos(e);
		var menu = $('#actionmenu');
		var truePos = getClosest(pos.x, pos.y);
		var area = $('#automatons');
		var xOffset = 30;
		var yOffset = area.offset().top - 35;

		menu.css('top', truePos.y + yOffset);
		menu.css('left', truePos.x - xOffset);
		menu.show();
	}

	/*
	*	If a transition is currently being set, sets the state as the transition target and activates the action-picking menu.
	*	Otherwise, activates the state as the current state and shows a selection of the input alphabet.
	*/
	function stateDoubleclick(e) {
		e.preventDefault();
		e.stopPropagation();

		if(deletingState) {
			var children = $(this).children();

			for(var i = 0; i < children.length; i++) {
				instance.detachAllConnections(children[i]);
			}

			var id = $(this).attr('id');
			delete states[id];
			
			instance.repaintEverything();
			$(this).remove();
			deletingState = false;
			enableRightImage();
			return;
		}

		if(active !== null) {		
			newState = states[$(this).attr('id')];		
			placeMenu(e);
		} else {
			hideButtons();
			$(this).find('.circle').css('opacity', '1');//.fadeIn();
		}
	}

	/*
	*	Sets all input selection button appearances to deactivated.
	*/
	function normalizeButtons() {
		var circles = $('.circle img');
		circles.css('width', '20px');
		circles.css('height', '20px');
		$('.circle').css('font-weight', 'normal');
	}

	/*
	*	Sets the currently defined transition's action according the the menu field clicked.
	*/
	function menuClick(e) {
		e.preventDefault();
		e.stopPropagation();
		var state = states[active.state];
		var action = getAction($(this).attr('id'));
		state.SetTransition(active.input, newState, action);

		arrowConnect(state, active.input, newState, action);

		newState = undefined;
		$('#actionmenu').hide();
		normalizeButtons();
		active = null;
	}

	/*
	*	Draws an arrow over a connection
	*	@param from - From which state
	*	@param input - For which input
	*	@param to - To which state
	*	@param action - Which action
	*/
	function arrowConnect(from, input, to, action) {
		var src = from.Name + input;
		var dest = to.Name + "img";

		var oldEndpoints = instance.getEndpoints(src);

		if(oldEndpoints != undefined) {
			for(var i = 0; i < oldEndpoints.length; i++) {
				instance.deleteEndpoint(oldEndpoints[i]);
			}
		}

		instance.draggable(src);

		var dynamicAnchors = [
			[0, 0.5, 1, 0, -10, 0], 
			[0.5, -1, 0.5, 0.5, 0, -10]
		];
		instance.connect({
			source : src,
			target : dest,
			overlays : [
				[ "Label", {label : input + " : " + actionName(action), location: 0.25, cssClass : "lbl"}]
			],
			anchors: ["Continuous", [ "Continuous", {faces : ["top", "left", "right"]}]]
		});
	}

	/*
	*	Gets an action for predefined name.
	*/
	function getAction(name) {
		var names = {
			'halt' : Action.Stop,
			'left' : Action.Left,
			'right' : Action.Right,
			'jumpleft' : Action.JumpLeft,
			'jumpright' : Action.JumpRight,
			'jump' : Action.Jump,
			'chalt' : Action.Stop,
			'cleft' : Action.Left,
			'cright' : Action.Right,
			'cjumpleft' : Action.JumpLeft,
			'cjumpright' : Action.JumpRight,
			'cjump' : Action.Jump
 		}

		return names[name];
	}

	/*
	*	Makes an input character selection button bigger and bolds its text, to indicate it has been picked.
	*/
	function resizeIcons(me) {
		normalizeButtons();
		me.find('img').css('width', '22px');
		me.find('img').css('height', '22px');
		me.css('font-weight', 'bolder');
	}

	/*
	*	If an already active input character selection button is clicked, deactivates it.
	*	Otherwise, activates the clicked button and sets it as the selected input character in defining a transitio.
	*/
	function activateConnections(me) {
		//Setting active state and letter
		var newactive = {'state' : me.parent().attr('id'), 'input' : me.attr('class').split(/\s/)[1]};

		if(active !== null && active['state'] === newactive['state'] && active['input'] === newactive['input']) {
			normalizeButtons();
			active = null;
		} else {
			active = newactive;
		}
	}

	/*
	*	Adds a new state on the board and activates its handlers.
	*/
	function addState(x, y) {
		var state = new State();
		states[state.Name] = state;

		var x = typeof x === 'undefined' ? '100px' : x + 'px';
		var y = typeof y === 'undefined' ? '100px' : y + 'px';


		//The html of a state, with id generated according to the state name
		var div = $('<div id="' + state.Name + '" class="statecontainer">\
					<img class="automatonimg" src="img/State.png" id="' + state.Name + 'img" />\
					<span class="statename">' + state.Name + '</span>\
					<span id="' + state.Name + 'a" class="circle a">\
						<img src="img/Circle.png" />\
							<span class="text">a</span>\
					</span>\
					<span id="' + state.Name + 'b" class="circle b">\
						<img src="img/Circle.png" />\
							<span class="text">b</span>\
					</span>\
					<span id="' + state.Name + 'c" class="circle c">\
						<img src="img/Circle.png" />\
							<span class="text">c</span>\
					</span>\
					</div>');
		$('#area').append(div);

		//Setting the initial visual properties
		hideButtons();

		jsPlumb.draggable(div);

		div.css('left', x);
		div.css('top', y);

		//Event handler for doubleclick
		div.on('click', stateDoubleclick);
		div.on('mousemove', function() { instance.repaintEverything(); });


		//Adding event handlers for child input character selection buttons
		div.find('.circle').on('click', function(ev) {
			var me = $(this);
			ev.preventDefault();
			ev.stopPropagation();
			resizeIcons(me);
			activateConnections(me);
		});
	}

	/*
	* Turns the individual letters of the input string in the level into a set of spans containing individual letters.
	*/
	function spanify() {
		var alphabet = $('#alphabet');
		var text = alphabet.html();
		var newHtml = '';

		for(var i = 0; i < text.length; i++) {
			newHtml += '<span class="letter" id="letter' + i + '">' + text.charAt(i) + '</span>\n';
		}

		alphabet.html(newHtml);
	}

	/*
	*	Highlights a letter - essentially just makes it uppercase and all other members lowercae.
	*/
	function highlightCurrentLetter(elem) {
		lowercaseInput();
		elem.html(elem.html().toUpperCase());
	}

	function enableImage() {
		$('#play').attr('src', 'img/Play.png');
		$('#pause').attr('src', 'img/Pause.png');
		$('#stop').attr('src', 'img/Stop.png');
		if(status == Status.Stop) {
			$('#stop').attr('src', 'img/StopOn.png');
		} else if(status == Status.Pause) {
			$('#pause').attr('src', 'img/PauseOn.png');
		} else if(status == Status.Play) {
			$('#play').attr('src', 'img/PlayOn.png');
		}
	}

	function enableRightImage() {
		$('#new').attr('src', 'img/New.png');
		$('#delete').attr('src', 'img/Delete.png');

		if(addingState) {
			$('#new').attr('src', 'img/NewOn.png');
		} else if(deletingState) {
			$('#delete').attr('src', 'img/DeleteOn.png');
		}
	}

	function setSound(value) {
		if(value === true) {
			Game.sound = true;
			$('#sound').attr('src', 'img/SoundOn.png');
			return;
		}

		Game.sound = false;
		$('#sound').attr('src', 'img/SoundOff.png');
	}

	function pause(e) {
		e.preventDefault();
		if(gameStatus === GameStatus.Lose || gameStatus == GameStatus.Win) {
			stop(e);
			return;
		}

		status = Status.Pause;
		enableImage();
		Crafty.trigger("PauseSimulation", '');
	}

	function play(e) {
		e.preventDefault();

		if (gameStatus === GameStatus.Lose) {
			alert("He's dead, Jim!");
			return;
		} else if(gameStatus == GameStatus.Win) {
			stop(e);
			play(e);
		}

		if(currentState == undefined) {
			currentState = findFirstAvailableState();
			if(currentState == null) {
				alert('You need at least one state for this to work, silly!');
				currentState = undefined;
				return;
			}
		}

		if(status == Status.Play) {
			return;
		}

		hideButtons();
		status = Status.Play;
		enableImage();
		execute();
		Crafty.trigger("StartSimulation", {onWin: success, onLose: failure, onCont: execute});
	}

	function stop(e) {
		e.preventDefault();
		status = Status.Stop;
		gameStatus = GameStatus.InProgress;
		enableImage();
		currentState = undefined;
		lowercaseInput();
		letterIndex = 0;
		Crafty.trigger("StopSimulation", '');
	}

	/*
	*	Executes the currenly set up automatons.
	*/
	function execute() {
		if(status == Status.Pause) {
			return;
		} else if(status == Status.Stop) {
			currentState = findFirstAvailableState();
			letterIndex = 0;
			return;
		} 

		highlightCurrentLetter($('#letter' + letterIndex));
		var input = inputStr.charAt(letterIndex).toLowerCase();
		var transition = currentState.GetTransition(input);
		currentState = transition.next != undefined ? transition.next : currentState;
		queue.push(transition.action != undefined ? transition.action : Action.Stop);

		$('#'+currentState.Name).effect('bounce', {times : 3}, 450);

		letterIndex = (letterIndex + 1) % inputStr.length;

		Crafty.trigger('Step', queue.shift());
	}

	function success() {
		gameStatus = GameStatus.Win;
	}

	function failure() {
		gameStatus = GameStatus.Lose;
	}

	/*
	*	Lowercases all input stream characters.
	*/
	function lowercaseInput() {
		$('.letter').each(function() {
			$(this).html($(this).html().toLowerCase());
		});
	}

	function resizePlayingArea() {
		var area = $('#automatons');
		var viewPortH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		var position = area.position();
		var margin = 10;

		area.height(viewPortH - position.top - margin);
	}
 
	window.onload = function() {
		inputStr= $('#alphabet').html().trim();
		letterIndex = 0;
		spanify();

		resizePlayingArea();
		window.onresize = resizePlayingArea;

		status = Status.Stop;

		$('body').on('click', function(e) {
			active = null;
			$('#actionmenu').hide();
			normalizeButtons();
		});

		$('#actionmenu').hide();

		$('#actionmenu img').on('click', menuClick);

		$('#new').on('click', function(e) {
			e.preventDefault();
			addingState = !addingState;
			enableRightImage();
		});

		$('#delete').on('click', function(e) {
			e.preventDefault();
			deletingState = !deletingState;
			enableRightImage();
		})

		$('#play').on('click', play);

		$('#stop').on('click', stop);

		$('#pause').on('click', pause)

		$('#area').on('click', function(e) {
			hideButtons(); 
			active = null;
			if(addingState === true) {
				addingState = false;
				enableRightImage();
				var pos = mousePos(e);
				var yOffset = $('#automatons').position().top + 15;
				var divOffset = 15;
				addState(pos.x - divOffset, pos.y - yOffset - divOffset);
			}
		});

		$('#sound').on('click', function() {
			setSound(!Game.sound);
		})

		enableImage();

		instance = jsPlumb.getInstance({
			Endpoint : ["Dot", {radius:2}],
			PaintStyle : {strokeStyle:"blue", lineWidth: 2},
			Connector: [ "Flowchart", {midpoint : 0.2, stub: 25, alwaysRespectStubs: true, cornerRadius: 10}],
			ConnectorStyle:{ strokeStyle:"#5c96bc", lineWidth:2, outlineColor:"transparent", outlineWidth:4 },
			ConnectionOverlays : [
				[ "Arrow", { 
					location:1,
					id:"arrow",
                    length:20,
                    width: 8,
                    foldback:0.8
				} ]
			],
			Container:"area"
		});
	}
}