const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });  
const app = require('./app');
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://callmecapricious:1023203304@cluster0.wf2lc8j.mongodb.net/wikis",{
  // useNewUrlParser:true,
  // useCreateIndex:true,
  // useFindAndModify:false
}).then(con =>{
  console.log("Connected");
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
