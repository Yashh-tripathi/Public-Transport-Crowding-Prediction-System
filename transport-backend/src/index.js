const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({
    path: "./.env"
})

const app = express();
const PORT = process.env.NODE_ENV == 'development'? 4000 : process.env.PORT;

app.use(express.json())
app.use(express.urlencoded({extended: true}));

app.use(cors({
    origin: "*",
    methods: ['GET','POST','PUT','DELETE']
}));

app.get("/", (req, res) => {
    res.send(`Server is running`);
});

//routes 
const crowdRoutes = require("./routes/crowd.routes");
app.use("/",crowdRoutes);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

