const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE workers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text,
            email text UNIQUE,
            password text,
            CONSTRAINT email_unique UNIQUE (email)
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO workers (name, email, password) VALUES (?,?,?)'
                bcrypt.hash("admin123456", saltRounds, function(err, hash) {
                    db.run(insert, ["admin","admin@example.com",hash])
                });
                bcrypt.hash("user123456", saltRounds, function(err, hash) {
                    db.run(insert, ["user","user@example.com",hash])
                });
            }
        });
        db.run(`CREATE TABLE attendees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            worker_id INTEGER,
            check_in TEXT,
            check_out TEXT,
            FOREIGN KEY (worker_id) REFERENCES workers (id)
            )`,
        (err) => {
            if (err) {
                // Table already created
            }
        });
    }
});


module.exports = db
