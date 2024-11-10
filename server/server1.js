const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // 추가된 부분
const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

// uploads 폴더를 정적 파일로 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/user", require("./route/userRoute"));
app.use("/post", require("./route/postRoute"));
app.use("/comments", require("./route/commentRoute"));

app.get("/test", (req,res)=>{
    res.send("hello express");
})

app.listen(3100, () => {
    console.log("server start!");
});
