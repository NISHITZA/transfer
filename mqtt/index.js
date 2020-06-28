const express = require('express');
const app=express();
const port=process.env.PORT||3000;
const senderRoute=require('./routes/send');
const mongoose= require('mongoose');
const winston= require('winston');
require('dotenv').config();
const databaseUri=process.env.URI;

//Format for Logging
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
app.use("/",senderRoute);
//Connection to mongoDB database
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
            logger.win.error('Database connection error '+error);
        })

// process.on('message', (msg) => {
//   if (msg == 'shutdown') {
//     console.log('Closing all connections...')
//     setTimeout(() => {
//       console.log('Finished closing connections')
//       process.exit(0)
//     }, 1500)
//   }
// })
module.exports = app;