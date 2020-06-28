const winston= require('winston');
const pingModel= require('./models/ping')
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

//Function used to save data received via mqtt
async function caller(rangeQueue,flag){
    flag=1;
    logger.win.info('Listening for messages');
    while(rangeQueue.length!=0)
    {
        currentData=rangeQueue[0];
        logger.win.info("Data "+currentData);
        let newData= new pingModel({
            currentData
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
    return flag;
}

exports.caller=caller;