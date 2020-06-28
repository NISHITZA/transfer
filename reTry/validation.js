const winston= require('winston');

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

function validate(rangeStart, rangeEnd){
    if(isNaN(rangeStart)||isNaN(rangeEnd)||(rangeStart>rangeEnd)){
        logger.win.error('Range values incorrect');
        return false;
    }
    return true;
}
exports.validate = validate;