const express = require('express');
const connectDB = require('./config/db')
const app = express();
connectDB()
const PORT = process.env.PORT || 5000;
app.get('/', (req,res) => {
    res.send('API started')
})
app.listen(PORT, ()=>console.log(`Server started on port ${PORT}`))