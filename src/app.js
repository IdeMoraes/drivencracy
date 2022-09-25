import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db';

const app = express();
app.use(cors());
dotenv.config();

/* app.post("/teste", (req, res) => {
	db.collection("teste").insertOne({
		teste: "string de teste",
	});
}); */

app.listen(process.env.PORT,()=>{
    console.log(`App listening on port ${process.env.PORT}`);
});