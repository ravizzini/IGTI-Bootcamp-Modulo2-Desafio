import express from 'express';

//const fs = require('fs').promises;
import { promises } from 'fs';

//import cors from 'cors';

//criação de variavel para uso de promises evita repetição de escrita toda vez que for usar promises

const router = express.Router(); //cria objeto router para substituir app uma vez que todos endpoint respondem na mesma url
const readFile = promises.readFile;
const writeFile = promises.writeFile;

//1. Crie um endpoint para criar uma grade.Este endpoint deverá receber como parâmetros os campos student, subject, type e value
router.post('/createGrade', async (req, res) => {
  //pegar parametros que estão sendo enviados
  let grade = req.body;

  try {
    //data da callback passa a ser retornado pela promisse caso ela tenha sucesso. Erro retornado no catch
    let data = await readFile(global.fileName, 'utf8');

    let json = JSON.parse(data); // le o arquivo
    //console.log(json);

    // operador ... destructing faz a mesma função que criar as propiedades do objeto name: grade.name, balance: grade.balance
    grade = { id: json.nextId++, ...grade, timestamp: new Date() }; //constroi o objeto grade
    json.grades.push(grade); // inserindo objeto no final do array grade

    //escrita do conteudo. Como já foi lido podemos usar o writeFile e reescrever o novo arquivo
    await writeFile(global.fileName, JSON.stringify(json));

    //res.end(); // retorna status 200
    res
      .status(200)
      .send(`Conta cadastrada com sucesso: ${JSON.stringify(grade)}`);

    logger.info(`POST /grade - ${JSON.stringify(grade)}`);
  } catch (error) {
    res.status(400).send({ error: error.message });
    logger.error(`POST /grade -${err.message}`);
  }
});

//2. Crie um endpoint para atualizar uma grade.

router.put('/updateGrade', async (req, res) => {
  try {
    //pegar parametros que estão sendo enviados
    let newGrade = req.body;

    let data = await readFile(global.fileName, 'utf8');

    let json = JSON.parse(data); //Lê a informação do arquivo

    let oldIndex = json.grades.findIndex((grade) => grade.id === newGrade.id); //método finfIndex encontra o índice anterior ao registro que desejamos alterar

    json.grades[oldIndex].student = newGrade.student; //altera a posição do registro com os valores recebidos da requisição
    json.grades[oldIndex].subject = newGrade.subject;
    json.grades[oldIndex].type = newGrade.type;
    json.grades[oldIndex].value = newGrade.value;

    await writeFile(global.fileName, JSON.stringify(json));

    res.status(200).send('Grade atualizada');
    //res.end(); // retorna status 200

    logger.info(`PUT /grade - ${JSON.stringify(newGrade)}`);
  } catch (error) {
    res.status(400).send({ error: error.message });

    logger.error(`PUT /grade -${err.message}`);
  }
});

//3. Crie um endpoint para excluir uma grade. Esse endpoint deverá receber como parâmetro o id da grade e realizar sua exclusão do arquivo grades.json.

router.delete('/deleteGrade/:id', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');

    // criando variavel json para responder data usando a conversão parse e remover o next id com delete json.nextID

    let json = JSON.parse(data);
    //é possivel inserir um tratamento de erro aqui caso não exista o id no array

    let grades = json.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id, 10) // parseInt usado para converter string para inteiro
    ); //usar o metodo filter para localizar o objeto com id fornecido no array grades e remover retornando o array sem o objeto

    json.grades = grades; // troca o array com todos os registros pelo novo array

    //escreve o novo arquivo

    await writeFile(global.fileName, JSON.stringify(json));

    //res.end(); // retorna status 200
    res.status(200).send('Grade removida com sucesso');

    logger.info(`DELETE /grade/:id - ${req.params.id}`);
  } catch (error) {
    res.status(400).send({ error: error.message });

    logger.error(`DELETE /grade -${err.message}`);
  }
});

//4. endpoint para consultar uma grade em específico. Esse endpoint deverá receber como parâmetro o id da grade e retornar suas informações.

router.get('/getById/:id', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');

    // criando variavel json para responder data usando a conversão parse e remover o next id com delete json.nextID
    let json = JSON.parse(data);
    const grade = json.grades.find(
      (grade) => grade.id === parseInt(req.params.id, 10) // parseInt usado para converter string para inteiro
    ); //usar o metodo find para localizar o objeto com id fornecido no array accounts

    if (grade) {
      res.send(`${JSON.stringify(grade)}`);

      logger.info(`GET /grade/:id - ${JSON.stringify(account)}`);
    } else {
      res.status(200).send('Conta não localizada');

      logger.info('GET /grade/:id');
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
    logger.error(`GET /grade/:id -${err.message}`);
  }
});

// router.post('/transaction', async (req, res) => {
//   //pegar parametros que estão sendo enviados

//   try {
//     let params = req.body;

//     let data = await readFile(global.fileName, 'utf8');

//     // let json = JSON.parse(data); //Lê a informação do arquivo

//     let json = JSON.parse(data);
//     let index = json.accounts.findIndex((account) => account.id === params.id);

//     //método dinfIndex encontra o índice anterior ao registro que desejamos alterar

//     // prettier-ignore
//     if ((params.value < 0) && ((json.accounts[index].balance + params.value) < 0)) {
//         throw new Error("Não há saldo suficiente.");
//       }

//     json.accounts[index].balance += params.value;

//     await writeFile(global.fileName, JSON.stringify(json));

//     res.send(json.accounts[index]);
//     //res.end(); // retorna status 200
//     logger.info(`POST /account/transaction - ${JSON.stringify(params)}`);
//   } catch (err) {
//     res.status(400).send({ error: err.message });

//     logger.error(`POST /account/transaction -${err.message}`);
//   }
// });

//extra
router.get('/', async (_, res) => {
  try {
    //ler o arquivo
    let data = await readFile(global.fileName, 'utf8');

    // criando variavel json para responder data usando a conversão parse e remover o next id com delete json.nextID
    let json = JSON.parse(data);
    delete json.nextId;
    res.send(json);

    logger.info('GET /account');
  } catch (error) {
    res.status(400).send({ error: error.message });

    logger.error(`GET /account -${err.message}`);
  }
});

export default router; //pesquisar outras formar de exportar variaveis. Aqui exportamos o modulo inteiro.
