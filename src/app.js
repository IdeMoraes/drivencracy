import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';

const app = express();
app.use(cors());
dotenv.config();

app.get("/", (req,res)=>{
    console.log(process.env.MONGO_URI);
    return res.send('Olá.')

})

app.post("/teste", async (req, res) => {
    try {
        await db.collection("teste").insertOne({
            teste: "string de teste",
        });
         res.send("Funcionou")
    } catch (error) {
        console.log("Erro no try")
        return
    }
});

app.listen(process.env.PORT,()=>{
    console.log(`App listening on port ${process.env.PORT}`);
});