const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

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
const generateId = () => {
  const maxId = Math.floor(Math.random() * 10000 + 1);
  return maxId;
};

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "content missing",
    });
  }

  if (persons.find((person) => person.name === body.name)) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    phone: body.phone || "00-00-0000000",
  };

  persons = persons.concat(person);
  res.json(person);
  console.log(persons);
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);

  const person = persons.find((person) => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});
app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
