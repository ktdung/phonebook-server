const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
require("dotenv").config();
const Person = require("./models/Person");
const note = require("../../../part3/part3-notes-backend/models/note");

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

morgan.token("body", function getBody(req, res) {
  return req.body ? JSON.stringify(req.body) : "";
});

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static("build"));
app.use(morgan(":method :url :status :response-time - ms :body"));

//

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.get("/info", (req, res) => {
  const htmlData = `
    <p>Phonebook has infor for ${persons.length} people</p>
    <p>${new Date().toUTCString()}</p>
  `;

  res.send(htmlData);
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Name and Nunber is requred",
    });
  }

  Person.findOneAndUpdate(
    {
      name: body.name,
    },
    {
      number: body.number,
    },
    {
      new: true,
      upsert: true,
    }
  )
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        error: "Server error",
      });
    });
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => res.json(updatedPerson))
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res) => {
  Person.findByIdAndRemove(req.params.id)
    .then((result) => res.status(204).end())
    .catch((error) => next(error));
});

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
