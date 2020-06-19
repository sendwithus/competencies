# Competency - Production Access Readiness

Control over access and permissions are in place for everyone's well-being, from the employee all the way back to the end-user. Having access to Production environments will make investigations, deployments, maintenance, and systems management faster, but also comes with a great deal of responsibility. It is important to understand the potential harm a single command can do while working in a production environment. A team member who is ready for Production access will know and consider the symptoms an action may have and take measures to isolate such actions wherever possible.

To borrow an adage from Spiderman lore, "with great power comes great responsibility". For some reason, I'm also reminded of my favourite Yeats poem, "Never Give All the Heart", with the final couplet being: "He that made this knows all the cost, / For he gave all his heart and lost." Those who have made careless or ignorant mistakes in Production endure enough anxiety and cause enough damage that one would do better to follow a strict code than learn Production-safe conduct at the expense of themself and others.

## How do you prove it?

You pair while working on Production systems. Always.

You confirm and discuss actions with your pair partner such that both understand what you are attempting to do, why, and what the risks and alternatives are.

You treat the super- and root user role with the utmost respect, only using them when absolutely necessary and avoiding them wherever possible.   

You interact with databases using extreme levels of caution, understanding that corrupted and lost data can and will be absolutely breaking to our system. You are naturally averse to performing manual mutative actions to table data or DB state. You log in using a role with the fewest grants required to do your work. You do not execute complex queries on live databases, and exhaustively limit SELECT statements and other consumptive actions. You understand what a table scan is, why it is dangerous, and what actions will cause one to occur. You know which actions are locking at any level of the data (row, table, etc.) and understand the implications of performing those actions on a live database.

You treat Redis and any other datastore with the same degree of respect and caution as stated above.

You download large log files and inspect them locally instead of on the host machine.

You do not perform expensive operations like file scans from the root directory.

You are calm and conscientious in a Production setting such that actions taken are mindful, calculated, and deliberate. You never panic and know to rely on your team in the face of concern or doubt.

## How do you improve it?

