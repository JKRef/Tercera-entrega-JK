import winston from "winston";
import config from "../config/config.js"

const customLevelsOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'bold magenta',
        error: 'bold red',
        warning: 'bold yellow',
        info: 'bold blue',
        http: 'bold green',
        debug: 'bold white'
    }
}

winston.addColors(customLevelsOptions.colors);

const devLogger = winston.createLogger({
    levels: customLevelsOptions.levels,
    transports: [
        new winston.transports.Console({
            level: "debug",
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
})

const prodLogger = winston.createLogger({
    levels: customLevelsOptions.levels,
    transports: [
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
            )
        }),
        new winston.transports.File({
            filename: 'error.log',
            level: 'error'
        })    
    ]
})

export const addLogger = (req, res, next) => {
    //console.log(config.ENVIRONMENT)
    if(config.ENVIRONMENT == 'DEV'){
        req.logger = devLogger;
        req.logger.http(`${req.method} in ${req.url}`);
    }else{
        req.logger = prodLogger;
    }
    
    next();                                           
}