import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

const app = express();
app.use(cors());
dotenv.config();

let db;
const mongoClient = new MongoClient(process.env.MONGO_URI);
mongoClient.connect().then(()=>{
    db = mongoClient.db('drivencracy');
    console.log(`Conectado ao Banco de Dados ${process.env.MONGO_URI}`)
});

/* setInterval(function () { db.query('SELECT 1'); }, 5000); */

app.get("/", (req,res)=>{
    console.log(process.env.MONGO_URI);
    return res.send('Olá.')

})

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