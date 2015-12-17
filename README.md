# ultimate-ciglan

## Summary

Ultimate-Cignal is a simple online arcade game in which the player controls the actions of the character using deterministic finite automata.  


The player thus solves simple tasks like collecting keys and skipping over pits with automata instead of the traditional keyboard or swipes.
Each level features the level itself, as well as default input string. The automata are used to parse the input string and produce actions.
The automata are Mealy automata, and as such for each state and input character, they transition into a new state and produce an action.
Check the tutorial for more. (Not yet written)

## Technologies and Libraries Used

The game itself is written in Javascript, CSS and HTML. The light-weight version (to be made available on github.io) contains only that code, modified
slightly to require no backend. The full version also uses PHP and MySQL.

The code relies on [jQuery](http://jquery.com), [jQuery UI](http://jquery.com), [jQuery Mobile](http://jquery.com), [Crafty](http://craftyjs.com) and [jsPlumb](http://jsplumbtoolkit.com) to work.

## Level Design

Currently, the level design feature is not implemented.

Levels can be imported manually via the admin page. By typing in valid JSON. The dimensions of the grid are 24x15 blocks (width x height).
The format of the JSON must be:

	{
		title: "Level name",
		inputstring: "aabcabbac" //Any length,
		t : {
			[0010101...],
			[05...],
			...
		}
	}


The numbers denote block types. The block types and their numbers are as following:   

*	Blank : 0
*	Brick : 1 
*	Mossy Brick : 2
*	Grass : 3
*	Door : 4
*	Key : 5
*	Stone : 6
*	Mossy Stone : 7
*	Breakable Stone : 8
*	Spike (Upwards) : 9
*	Spike (Leftwards) : 10
*	Spike (Downwards) : 11
*	Spike (Rightwards) : 12
*	Player : 13

## Authors

*	[Luka Skukan](https://github.com/Tweety-FER ) - Automaton engine, design, auxiliaries
*	Gabrijel Mrgan - The game screen and implemented actions, graphics, design
*	[Belma Gutlić](https://github.com/morrigan) - The user management part of the backend, database
*	Josip Vinković - Level selection part of the backend
