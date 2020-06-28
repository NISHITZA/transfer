const express = require('express');
const app=express();
const winston=require('winston');
const mongoose = require('mongoose');
require('dotenv').config();
const databaseUri=process.env.ATLAS_URI2;

const port = process.env.PORT||5000;
const mqttRoute=require('./routes/mqtt');

//Format for logging using winston
const loggerFormat=winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf((info=>`${info.timestamp}  ${info.message}`)
    )
)
//Creating logger using Winston
const logger = {
    win: winston.createLogger({
        level:'info',
        format:loggerFormat,
        transports:[new winston.transports.File({ filename:'app-info.log'})],
    })
}
//View engine set to Embedded Javascript
app.set('view engine','ejs');
app.use(express.urlencoded({ extended:false }));
app.use('/',mqttRoute);

//Connection to MongoDB database
mongoose.connect(databaseUri,{useNewUrlParser:true, useCreateIndex:true, useUnifiedTopology:true})
        .then(res=>{
            logger.win.info('Database has been connected');

            const server = require('http').createServer(app)
            server.listen(port, () => {
            console.log('Express server listening on port ' + server.address().port)
            })
            //Graceful shutdown
            process.on('SIGINT', () => {
                logger.win.info('SIGINT signal received.');
                server.close(function(err){
                    if(err){
                        logger.win.error(err);
                        process.exit(1);
                    }
                    mongoose.connection.close(function () {
                      logger.win.info('Mongoose connection disconnected');
                      process.exit(0);
                   })
                });
              })
            
            // app.listen(port,()=>{
            //     logger.win.info('server listening ');
            // });
        })
        .catch(error=>{
            logger.win.error('Error while connecting to database');
        })



// process.on('message', (msg) => {
//     if (msg == 'shutdown') {
//       console.log('Closing all connections...')
//       setTimeout(() => {
//         console.log('Finished closing connections')
//         process.exit(0)
//       }, 1500)
//     }
//   })

module.exports = app;
