const app = require('./app');

app.listen(9090, () => {
  console.log('Server is listening on port 9090...');
});

// const PORT = process.env.PORT || 9090;

// app.listen(PORT, err => {
//   if (err) throw err;
//   console.log(`Server listening on port ${PORT}...`);
// });
