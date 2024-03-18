const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDataBase = async () => {
  db = await open({
    fileName: dbPath,
    driver: sqlite3.DataBase,
  })
  app.listen(3000, () =>
    console.log('server running at https://localhost:3000/'),
  )
}
initializeDataBase()
const convertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
const convertDirectorDbObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
app.get('/movies/', async (request, response) => {
  const getMovieQuery = `
  SELECT movie_name 
  FROM 
  movie;`
  const moviesArray = await db.all(getMovieQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMoviesQuery = `SELECT * FROM movie
  WHERE movie_id =${movieId};`
  const movie = await db.get(getMoviesQuery)
  response.send(convertDbObjectToResponseObject(movie))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `INSERT INTO 
  movie(director_id,movie_name,lead_actor)
  Values (${directorId},'${movieName}','${leadActor}');`
  await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `UPDATE movie SET 
   director_id =${directorId},
   movie_name = ${movieName},
   lead_actor = ${leadActor},
   WHERE movie_id ='${movieId}';`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `DELETE  FROM movie
  WHERE movie_id ='${movieId}';`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `SELECT * 
  FROM 
  director;`
  const directorsArray = await db.all(getDirectorsQuery)
  response.send(
    directorsArray.map(eachDirector =>
      convertDirectorDbObjectToResponseObject(eachDirector),
    ),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMoviesQuery = `SELECT movie_name 
  FROM 
  movie WHERE director_id = '${directorId}';`
  const moviesArray = await db.all(getDirectorMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

module.exports = app
