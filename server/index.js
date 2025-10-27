const express = require("express");
const app = express();
const db = require("./database.js");
const cors = require("cors");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret';

app.use(cors());
app.use(express.json());

const HTTP_PORT = 8000;

// Start server
app.listen(HTTP_PORT, () => {
    console.log(`Server running on port ${HTTP_PORT}`);
});

// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// API endpoints

// Get all workers
app.get("/api/workers", authenticateJWT, (req, res, next) => {
    var sql = "select id, name, email from workers"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

// Get worker by id
app.get("/api/workers/:id", authenticateJWT, (req, res, next) => {
    var sql = "select id, name, email from workers where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

// Create a new worker
app.post("/api/workers/", authenticateJWT, (req, res, next) => {
    var errors=[]
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        var data = {
            name: req.body.name,
            email: req.body.email,
            password : hash
        }
        var sql ='INSERT INTO workers (name, email, password) VALUES (?,?,?)'
        var params =[data.name, data.email, data.password]
        db.run(sql, params, function (err, result) {
            if (err){
                res.status(400).json({"error": err.message})
                return;
            }
            res.json({
                "message": "success",
                "data": data,
                "id" : this.lastID
            })
        });
    });
});

// Update a worker
app.put("/api/workers/:id", authenticateJWT, (req, res, next) => {
    if (req.body.password) {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            var data = {
                name: req.body.name,
                email: req.body.email,
                password : hash
            }
            db.run(
                `UPDATE workers set
                   name = COALESCE(?,name),
                   email = COALESCE(?,email),
                   password = COALESCE(?,password)
                   WHERE id = ?`,
                [data.name, data.email, data.password, req.params.id],
                function (err, result) {
                    if (err){
                        res.status(400).json({"error": err.message})
                        return;
                    }
                    res.json({
                        message: "success",
                        data: data,
                        changes: this.changes
                    })
            });
        });
    } else {
        var data = {
            name: req.body.name,
            email: req.body.email
        }
        db.run(
            `UPDATE workers set
               name = COALESCE(?,name),
               email = COALESCE(?,email)
               WHERE id = ?`,
            [data.name, data.email, req.params.id],
            function (err, result) {
                if (err){
                    res.status(400).json({"error": err.message})
                    return;
                }
                res.json({
                    message: "success",
                    data: data,
                    changes: this.changes
                })
        });
    }
});

// Delete a worker
app.delete("/api/workers/:id", authenticateJWT, (req, res, next) => {
    db.run(
        'DELETE FROM workers WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": err.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
});

// Get all attendees
app.get("/api/attendees", authenticateJWT, (req, res, next) => {
    var sql = "select * from attendees"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

// Check in
app.post("/api/checkin/", authenticateJWT, (req, res, next) => {
    var errors=[]
    if (!req.body.worker_id){
        errors.push("No worker_id specified");
    }

    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }

    var data = {
        worker_id: req.body.worker_id,
        check_in: new Date().toISOString()
    }

    var sql ='INSERT INTO attendees (worker_id, check_in) VALUES (?,?)'
    var params =[data.worker_id, data.check_in]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
});

// Check out
app.post("/api/checkout/", authenticateJWT, (req, res, next) => {
    var errors=[]
    if (!req.body.worker_id){
        errors.push("No worker_id specified");
    }

    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }

    var data = {
        worker_id: req.body.worker_id,
        check_out: new Date().toISOString()
    }

    var sql ='UPDATE attendees set check_out = ? WHERE id = (SELECT id FROM attendees WHERE worker_id = ? AND check_out IS NULL ORDER BY check_in DESC LIMIT 1)'
    var params =[data.check_out, data.worker_id]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
        })
    });
});

// Login
app.post("/api/login/", (req, res, next) => {
    var errors=[]
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }

    var sql = "select * from workers where email = ?"
    var params = [req.body.email]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        if (!row) {
            res.status(404).json({"error":"User not found"});
            return;
        }

        bcrypt.compare(req.body.password, row.password, function(err, result) {
            if (result) {
                const accessToken = jwt.sign({ username: row.email, id: row.id }, JWT_SECRET);
                res.json({
                    "message":"success",
                    "data": {
                        token: accessToken
                    }
                })
            } else {
                res.status(401).json({"error":"Unauthorized"});
            }
        });
    });
});

// Default response for any other request
app.use(function(req, res){
    res.status(404);
});
