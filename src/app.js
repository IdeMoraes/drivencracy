import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();
app.use(cors());
dotenv.config();

app.listen(process.env.PORTA,()=>{
    console.log(`App listening on port ${process.env.PORTA}`);
});