import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import joi from 'joi';
import dayjs from 'dayjs';
import { ObjectId } from "bson"

const app = express();
app.use(cors());
dotenv.config();

let db;
const mongoClient = new MongoClient(process.env.MONGO_URI);
mongoClient.connect().then(()=>{
    db = mongoClient.db('drivencracy');
    console.log(`Conectado ao Banco de Dados ${process.env.MONGO_URI}`)
}).catch((error)=>console.log(error.message));

app.post("/poll", async (req, res)=>{
    const {title, expireAt} = req.body;
    const titleSchema = joi.string().required();
    const validation = titleSchema.validate(title);
    if(validation.error){
        return res.sendStatus(422);
    }
    if(expireAt===""){
        expireAt = dayjs().add(30, 'day').format('YYYY-MM-DD HH:mm');
    }
    try {
        const answer = await db.collection("polls").insertOne({title, expireAt});
        return res.status(201).send({_id: ObjectId(answer.insertedId), title, expireAt});
    } catch (error) {
        console.log(error.message);
        return
    }
});

app.get("/poll", async (req, res)=>{
    try {
        const polls = await db.collection("polls").find().toArray();
        return res.send(polls);
    } catch (error) {
        console.log(error.message);
        return
    }
});

app.post("/choice", async (req, res) => {
    const {title, pollId} = req.body;
    const titleSchema = joi.string().required();
    const validation = titleSchema.validate(title);
    if(validation.error){
        return res.sendStatus(422);
    }
    try {
        const poll = await db.collection("polls").findOne({_id: ObjectId(pollId)});
        if(poll===null){
            console.log('Esse pollId de enquete não existe')
            return res.sendStatus(422);
        }
        const repeated = await db.collection("choices").findOne({title, pollId});
        if(repeated){
            console.log('Opção já existente para essa enquete')
            return sendStatus(409);
        }
        const isAfter = dayjs().isAfter(poll.expireAt.slice(0,-6));
        if(isAfter){
            console.log('A enquete com esse pollId já venceu');
            return res.sendStatus(403);
        }
        const answer = await db.collection("choices").insertOne({title, pollId});
        return res.status(201).send({_id: ObjectId(answer.insertedId), title, pollId});
    } catch (error) {
        console.log(error.message);
        return
    }
});

app.get("/poll/:id/choice", async (req, res)=>{
    const pollId = req.params.id;
    try {
        const choices = await db.collection("choices").find({pollId}).toArray();
        if(choices.length===0){
            return res.sendStatus(404);
        }
        return res.send(choices);
    } catch (error) {
        console.log(error.message);
    }
});

app.post("/choice/:id/vote", async (req, res)=>{
    const choiceId = req.params.id;
    const choice = await db.collection("choices").findOne({_id: ObjectId(choiceId)});
    if(choice===null){
        console.log('Esse choiceId de opção não existe')
        return res.sendStatus(404);
    }
    const poll = await db.collection("polls").findOne({_id: ObjectId(choice.pollId)});
    const isAfter = dayjs().isAfter(poll.expireAt.slice(0,-6));
    if(isAfter){
        return res.sendStatus(403);
    }
    const createdAt = dayjs().format('YYYY-MM-DD HH:mm')
    await db.collection("votes").insertOne({createdAt, choiceId});
    return res.sendStatus(201);
});

app.get("/poll/:id/result", async (req, res)=>{
    try {
        const poll = await db.collection("polls").findOne({_id: ObjectId(req.params.id)});
        if(poll===null){
            return res.sendStatus(404);
        };
        const choices = await db.collection("choices").find({pollId: req.params.id}).toArray();
        const votes = []
        const numberOfVotes = [];
        for (let i=0; i<choices.length;i++){
            votes[i] = await db.collection("votes").find({choiceId: choices[i]._id.toString()}).toArray();
            numberOfVotes[i] = votes[i].length;
            console.log(numberOfVotes[i]);
        }
        const highestNumberOfVotes = Math.max(...numberOfVotes);
        const WinnerPositionInArray = numberOfVotes.indexOf(highestNumberOfVotes);
        return res.send({
            _id: req.params.id,
            title: poll.title,
            expireAt: poll.expireAt,
            result : {
                title: choices[WinnerPositionInArray].title,
                votes: highestNumberOfVotes
            }});
    } catch (error) {
        console.log(error.message);
        return;
    } 
});

app.listen(process.env.PORT,()=>{
    console.log(`App listening on port ${process.env.PORT}`);
});