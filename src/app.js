import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import joi from 'joi';
import dayjs from 'dayjs';

const app = express();
app.use(cors());
dotenv.config();

let db;
const mongoClient = new MongoClient(process.env.MONGO_URI);
mongoClient.connect().then(()=>{
    db = mongoClient.db('drivencracy');
    console.log(`Conectado ao Banco de Dados ${process.env.MONGO_URI}`)
});

/* const enqueteModelo = {
	_id: ObjectId("54759eb3c090d83494e2d222"),
	title: 'Qual a sua linguagem de programação favorita?', 
	expireAt: "2022-02-28 01:00"
}; */

/* const opcaoModelo = { 
	_id: ObjectId("54759eb3c090d83494e2d999"),
	title: "Javascript", 
	pollId: ObjectId("54759eb3c090d83494e2d222") 
}; */

/* const votoModelo = { 
	_id: ObjectId("54759eb3c090d83494e2d000"),
	createdAt: "2022-02-13 01:00", 
	choiceId: ObjectId("54759eb3c090d83494e2d999"), 
}; */

app.get("/", (req,res)=>{
    return res.send('Olá.')
});

app.post("/poll", async (req, res)=>{
    const {title, expireAt} = req.body;
    const titleSchema = joi.object({title: joi.string().required()});
    const validation = titleSchema.validate(title);
    if(validation.error){
        return res.sendStatus(422);
    }
    if(expireAt===""){
        expireAt = dayjs().add(30, 'day').format('YYYY-MM-DD HH:mm')
    }
    try {
        const poll = await db.collection("polls").insertOne({title, expireAt});
        return res.status(201).send("Inseriu");
    } catch (error) {
        console.log(error.message);
        return
    }
});

app.post("/teste", async (req, res) => {
    try {
        await db.collection("teste").insertOne({
            teste: "string de teste",
        });
        return res.send("Funcionou")
    } catch (error) {
        console.log(error.message);
        return
    }
});

app.listen(process.env.PORT,()=>{
    console.log(`App listening on port ${process.env.PORT}`);
});