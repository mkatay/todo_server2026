 

import express from 'express';
import mysql from 'mysql2/promise';
import {myConfig} from './configDatabase.js';
import cors from 'cors'

const app=express()
app.use(express.json())
app.use(cors())


let connection//Létrehozunk egy connection nevű változót, 
//amelynek egyelőre nincs értéke, ezért az értéke undefined.
//Azért let-et használunk, mert később értéket akarunk adni neki.

try {
    connection = mysql.createPool(myConfig);//promise alapú
    //teszt:a mysql.createPool(config) csak létrehozza a pool objektumot, 
    // de nem ellenőrzi azonnal, hogy létezik-e az adatbázis
    await connection.execute('SELECT 1');
    console.log('sikeres kapcsolódás az adatbázishoz:',myConfig.database);    
  } catch (err) {
    console.log(err);
    process.exit(1);//leállítja a programot, mert az alkalmazás nem tud megfelelően működni adatbázis nélkül.
  }


app.get('/todos',async (request,response)=>{
    try {
        const sql = 'select * from todolist  order by timestamp desc'
        const [rows, fields] = await connection.execute(sql);
        //console.log(rows);
        //console.log(fields);
        response.status(200).
        send(rows)
      } catch (err) {
            console.log(err);
      }
})

app.post('/todos',async (request,response)=>{
    const {task}=request.body
    if(!task || task.trim().length==0) return response.status(400).json({msg:"Hiányos adat!"})
    try {
        const sql = 'insert into todolist (task) values (?)'
        const values=[task]
        const [rows, fields] = await connection.execute(sql,values);
        console.log(rows);
        console.log(fields);
       response.json({msg: "Sikeres hozzáadás!", id: rows.insertId});
      } catch (err) {
            console.log(err);
      }
})

app.patch('/todos/complete/:id',async (req,resp)=>{
    const { id } = req.params;
        try {
            const sql = "UPDATE todolist SET complete=NOT complete WHERE id=?";
            const values=[ +id] 
            const [rows, fields] = await connection.execute(sql,values);
            console.log(rows, rows.affectedRows);
            //console.log(fields);
            resp.json({msg:"Sikeres módosítás!"})

        } catch (error) {
             console.log(error);
             resp.status(500).json({msg:"Hiba történt!"})
        } 
})

app.patch('/todos/edit/:id',async (req,resp)=>{
    const { id } = req.params;
    const {task}=req.body
    if(!task || task.trim().length==0) return resp.json({msg:"Hiányos adat!"})
        try {
            const sql = "UPDATE todolist SET task=? WHERE id=?";
            const values=[ task,+id] 
            const [rows, fields] = await connection.query(sql,values);//ha több útasítást szeretnénk egyszerre futtani az execute nem engedi!!!
            console.log(rows, rows.affectedRows);
            //console.log(fields);
            resp.json({msg:"Sikeres módosítás!"})

        } catch (error) {
             console.log(error);
             resp.status(500).json({msg:"Hiba történt!"})
        } 
})
app.put('/todos/task/:id',async (req,resp)=>{
    const {task}=req.body
    const { id } = req.params;

    if( !task) return resp.json({msg:"Hiányos adat!"})
        try {
            const sql = "UPDATE todolist SET task=? WHERE id=?;";
            const values=[task, +id];
            const [rows, fields] = await connection.query(sql,values);
            console.log(rows);
            console.log(fields);
            resp.json({msg:"Sikeres módosítás!"})

        } catch (error) {
             console.log(error);
             resp.status(500).json({msg:"Hiba történt!"})
        }
    


        
    
})

app.delete('/todos/:id',async (req,resp)=>{
    const { id } = req.params;
    try {
        const sql = 'delete from todolist where id=?'
        const values=[id]
        const [rows, fields] = await connection.execute(sql,values);
        console.log(rows.affectedRows);//ha 0 nincs mit törölni!!!!!!!!!!!!!!!!
        resp.json({success:true, msg:"Sikeres törlés!"})
      } catch (err) {
            console.log(err);
            resp.status(500).json({success:false,msg:"Hiba történt!"})
      }
    
})

// Bejelentkezés
app.post('/todos/login', (request, response) => {
    const { username, password } = request.body;

    if (username === process.env.LOGIN_USERNAME && password === process.env.LOGIN_PASSWORD) 
        response.json({success: true, message: 'Sikeres bejelentkezés!'});
    else 
        response.status(401).json({success: false, message: 'Hibás felhasználónév vagy jelszó!'});
    
});


const port=process.env.PORT || 8000

app.listen(port,()=>console.log(`server listening on port ${port}...`))
