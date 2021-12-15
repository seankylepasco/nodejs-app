// npm i joi@13.1.0 ..
const Joi = require("joi");
// npm i express ..
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const app = express();
// JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "db_test",
});

// ---------- TESTS --------------- //
app.get("/api/test", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connection as id ${connection.threadId}`);
    connection.query("SELECT * FROM `tbl_tests` WHERE 1", (err, rows) => {
      connection.release();
      if (!err) {
        res.send(rows);
      } else {
        res.send(err);
      }
    });
  });
});

app.get("/api/test/:id", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connection as id ${connection.threadId}`);
    connection.query(
      "SELECT * FROM `tbl_tests` WHERE id=?",
      [req.params.id],
      (err, rows) => {
        const row = rows.find((data) => data.id === parseInt(req.params.id));
        if (!row) return res.status(404).send("record was not found");
        connection.release();
        if (!err) {
          res.send(rows);
        } else {
          res.send(err);
        }
      }
    );
  });
});

app.post("/api/test", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connection as id ${connection.threadId}`);

    const params = req.body;

    connection.query("INSERT INTO `tbl_tests` SET ?", params, (err, rows) => {
      connection.release();
      if (!err) {
        res.send("record added successfully!");
      } else {
        res.send(err);
      }
    });
  });
});

app.put("/api/test", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connection as id ${connection.threadId}`);

    const { id, name, value } = req.body;

    connection.query(
      "UPDATE `tbl_tests` SET name= ? , value= ? WHERE id= ?",
      [name, value, id],
      (err, rows) => {
        if (!rows) return res.status(404).send("record was not found");
        connection.release();
        if (!err) {
          res.send("record updated successfully!");
        } else {
          res.send(err);
        }
      }
    );
  });
});

app.delete("/api/test/:id", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connection as id ${connection.threadId}`);
    connection.query(
      "DELETE FROM `tbl_tests` WHERE id=?",
      [req.params.id],
      (err, rows) => {
        const row = rows.find((data) => data.id === parseInt(req.params.id));
        if (!row) return res.status(404).send("record was not found");

        connection.release();
        if (!err) {
          res.send(
            `record with id of ${req.params.id} has been deleted successfully!`
          );
        } else {
          res.send(err);
        }
      }
    );
  });
});

// ---------- COURSES ------------- //

const courses = [
  {
    id: 1,
    name: "BSIT",
  },
  {
    id: 2,
    name: "BSCS",
  },
  {
    id: 3,
    name: "BSEMC",
  },
  {
    id: 4,
    name: "ACT",
  },
];

app.get("/", (req, res) => {
  res.send("Hi, this is Sean Kyle Pasco's API!");
});

app.get("/api/courses", (req, res) => {
  res.send(courses);
});

app.get("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).send("Course was not found");

  res.send(course);
});

app.get("/api/courses/:year/:month", (req, res) => {
  res.send(req.query);
});

app.put("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).send("Course was not found");

  const { error } = validateCourse(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  course.name = req.body.name;
  res.send(course);
});

app.post("/api/courses", (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const course = {
    id: courses.length + 1,
    name: req.body.name,
  };
  courses.push(course);
  res.send(course);
});

app.delete("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).send("Course was not found");

  const index = courses.indexOf(course);
  courses.splice(index, 1);

  res.send(course);
});

function validateCourse(course) {
  // validate ..
  const schema = {
    name: Joi.string().min(3).required(),
  };
  // Joi validate ..
  return Joi.validate(course, schema);
}
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server started at ${port}`);
});
