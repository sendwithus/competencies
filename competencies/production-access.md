# Competency - Production Access Readiness

Generally only robots and devops should have access to production.  Production is a dangerous place where things can easily go drastically wrong.
However, with legacy systems that don't have good automated processes behind them, sometimes it is necessary to go on to these machines and make modifications, for example during outages or failures to investigate / rectify.  This competency describes what skills you need to navigate those systems safely.


## How do you prove it?

You have shadowed three production systems accesses.

You always pair when making production changes and communicate what you are attempting to do, why, and what the risks and alternatives are.

You can explain when you should and should not use root / super role.

You can demonstrate interacting with a database in a safe way.

You can explain what a table scan is, why it is dangerous, and what actions will cause one to occur.

## How do you improve it?

Interact with databases using extreme levels of caution, understanding that corrupted and lost data can and will be absolutely breaking to our system. 
Log in to the database using a role with the fewest grants required to do your work. 
You know which actions are locking at any level of the data (row, table, etc.) and understand the implications of performing those actions on a live database.
