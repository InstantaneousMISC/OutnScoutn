const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

//Setup Server to listen on port
const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))

//Configure middleware
app.use(express.json({
    extended: false
}))

//Connect to db
connectDB();

//Setup server routes
app.use('/api/auth/', require('./routes/auth')) //middleware function to auth routes

app.get('/', (req, res) => res.send('Gravy'))