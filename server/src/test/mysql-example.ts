// npm i rows -S

const mysql = require("mysql");
// import * as mysql from "mysql";


const connOpts = { host: "localhost", user: "user", password: "password", database: "database" };
const conn = mysql.createConnection(connOpts);

conn.connect(err => {
    if (err) {
        console.log("Error connecting to Db");
        return;
    }
    console.log("Connection established");
});

conn.query(
    "SELECT * FROM employees",
    (err, res) => {
        if (err) throw err;
        console.log("Data received from Db:\n");
        console.log(res);
        res.forEach(row => {
            console.log(`${row.name} is in ${row.location}`);
        });
    });

conn.query(
    "INSERT INTO employees SET ?",
    { name: "Winnie", location: "Australia" },
    (err, res) => {
        if (err) throw err;
        console.log("Last insert ID:", res.insertId);
    });

    conn.query(
    "UPDATE employees SET location = ? Where ID = ?",
    ["South Africa", 5],
    (err, res) => {
        if (err) throw err;
        console.log(`Changed ${res.changedRows} row(s)`);
    });

    conn.query(
    "DELETE FROM employees WHERE id = ?",
    [5],
    (err, res) => {
        if (err) throw err;
        console.log(`Deleted ${res.affectedRows} row(s)`);
    });
