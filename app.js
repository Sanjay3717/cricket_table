const express = require("express");

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const app = express();

const dbPath = path.join(__dirname, "cricketTeam.db");

app.use(express.json());

let db = null;

module.exports = app;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,

      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);

    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,

    playerName: dbObject.player_name,

    jerseyNumber: dbObject.jersey_number,

    role: dbObject.role,
  };
};

//Return list of players

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `select * from cricket_team order by player_id`;

  const playerArray = await db.all(getPlayerQuery);

  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//Create a new player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayerQuery = `insert into cricket_team (player_name,jersey_number,role) values ("Vishal",17,"Bowler");`;

  const dbResponse = await db.run(addPlayerQuery);

  const playerId = dbResponse.lastID;

  response.send("Player Added to Team");
});

//Get one player

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerQuery = `select * from cricket_team where player_id = ${playerId};`;

  const player = await db.get(getPlayerQuery);

  response.send(player);
});

//Update player details

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerDetails = `update cricket_team set player_name = '${playerName}', jersey_number = ${jerseyNumber}, role = '${role}';`;

  await db.run(updatePlayerDetails);

  response.send("Player Details Updated");
});

//Deleting player details

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  //const playerDetails = request.body;

  const deletePlayerDetails = `delete from cricket_team where player_id = ${playerId};`;

  await db.run(deletePlayerDetails);

  response.send("Player Removed");
});

app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000/");
});
