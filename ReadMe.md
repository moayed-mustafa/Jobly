# Jobly

 ### Installation:
 - To run jobly on your local machine, make sure to first head to package.json file and npm install
 the dependencies listed there.

 - run the express server locally using the following command:-
    - nodemon server.js

 - data.sql file contains the database and tables createion. seed it using the following command:
    - psql < data.sql

- For testing, create the database and table for testing using :
    - psql < data_test.sql

- All tests are written in Jest, run them by first moving into __tests__
    - then you can use jest to run all test suites.
    - you can also run individually e.g jest user_routes.test