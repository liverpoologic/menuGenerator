Code Structure

CORE - contains base html, css, params, renderer and onLoad

utilities - contains helper functions that are called from rest of code. Utilities doesn't call anything

data - contains data structures and methods including read/write and clear Dict and Config. All are methods on the 'dict' and 'config' objects.

FRAMEWORK - contains stuff to generate the 'framework' of the application - navigation controls (including key presses), dropdown refresh and generation, etc. This is required BY CORE and tabs


require chain:
Core > tabs > framework > utilities > data



what happens when you write config.
TAB and only TAB can write config. Tab calls framework 'Write' function, which calls data 'write' function

KEYPRESSES must stay in core so they can call tabs.
