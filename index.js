import express from 'express';
import { promises } from 'fs';
import winston from 'winston';
import gradesRouter from './routes/grades.js';

const readFile = promises.readFile;
const writeFile = promises.writeFile;

const app = express();

global.fileName = 'grades.json'; //criação de variavel global

const { combine, timestamp, label, printf } = winston.format; // destructuring para facilitar escrita

//criação de formato
const myformat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  //nível de logs - ver 7 níveis na documentação
  level: 'silly',
  //transports indica local onde vão ser salvo os dados neste caso no console e em arquivo
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'grades.log' }),
  ],
  //definir formato da info do log
  format: combine(
    label({ label: 'grades-control-api' }),
    timestamp(),
    myformat
  ),
});

app.use(express.json());
app.use('/grades', gradesRouter); //informa que deve utilizar o router

app.listen(3000, async () => {
  //verificar se existe objeto json se não existir criar json com a estrutura que definirmos. Melhor lugar para verificar é quando a api sobe.

  //try-catch com async await try tenta ler o arquivo com readFile se não conseguir cair no catch(error) e cria um novo arquivo
  try {
    await readFile(global.fileName, 'utf8');
    logger.info('API Started');
  } catch (error) {
    const initialJson = {
      nextId: 1, //nextId cria id incrementado
      grades: [],
    };

    writeFile(global.fileName, JSON.stringify(initialJson)).catch((error) => {
      logger.error(error);
    });
  }
});
