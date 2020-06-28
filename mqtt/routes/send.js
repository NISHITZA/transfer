const router = require('express').Router();
const mongoose = require('mongoose');
const pingModel=require('../models/ping');
const winston=require('winston');
require('dotenv').config();
const mqtt=require('mqtt');
const mqttBroker=process.env.MQTT_LINK;

//Queue to save incoming data
let rangeQueue=[];
let mqttOptions={
    qos:2}//Quality of service is set to 2
let flag=0;

//Format for logging
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
//The start function is called every 50 seconds(time can be reduced)
let timer=setInterval(start,1000*50);

//Flag is used for synchronization of start function
function start()
{
    if(flag==0){
        caller();
    }
}
//Connection to Mqtt Broker
const mqttClient=mqtt.connect(mqttBroker);
mqttClient.on('connect',()=>{
    mqttClient.subscribe('retry',mqttOptions);
    logger.win.info('Mqtt broker connected');
});

//Event listener for message event
mqttClient.on('message',async(topic, message)=>{
    if(topic === 'retry') {
        logger.win.info('Message received '+message.toString());
        rangeQueue.push(message.toString());
        logger.win.info(rangeQueue);
    }
});
//Function used to save data received via mqtt
async function caller(){
    flag=1;
    logger.win.info('Listening for messages');
    while(rangeQueue.length!=0)
    {
        currentData=rangeQueue[0];
        let data=currentData;
        logger.win.info("Data "+currentData);
        let newData= new pingModel({
            data
        });

        await newData.save()
                     .then(()=>{
                        logger.win.info('Data Saved on retry '+currentData);
                        rangeQueue.shift();
                     })
                     .catch(err=>{
                        logger.win.error('Error while saving in the database '+currentData);
                        mqttClient.publish('retry',currentData.toString(),mqttOptions);
                        rangeQueue.shift();
                     })
    }
    flag=0;
}


router.get('/',(req,res)=>{
    res.send('Mqtt');
    logger.win.info('route called ');
});


module.exports = router;



