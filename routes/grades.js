import express from 'express';

//const fs = require('fs').promises;
import { promises } from 'fs';

//import cors from 'cors';

const router = express.Router(); //cria objeto router para substituir app uma vez que todos endpoint respondem na mesma url

//criação de variavel para uso de promises evita repetição de escrita toda vez que for usar promises
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

    let json = JSON.parse(data);

    let grades = json.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id, 10) // parseInt usado para converter string para inteiro
    );

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

    let json = JSON.parse(data);
    const grade = json.grades.find(
      (grade) => grade.id === parseInt(req.params.id, 10) // parseInt usado para converter string para inteiro
    ); //usar o metodo find para localizar o objeto com id fornecido no array grades

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

//5. Crie um endpoint para consultar a nota total de um aluno em uma disciplina.
router.post('/subjectResult', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');

    let json = JSON.parse(data);

    const params = req.body;

    const results = json.grades.filter(
      (grade) =>
        grade.student === params.student && grade.subject === params.subject
    );

    const resultsSum = results.reduce((accumulator, currentItem) => {
      return accumulator + currentItem.value;
    }, 0);

    res.status(200).send(`Nota Final subject ${params.subject}: ${resultsSum}`);
  } catch (error) {
    res.status(400).send({ error: error.message });
    logger.error(`POST /grade/subjectResult -${err.message}`);
  }
});

//6. Crie um endpoint para consultar a média das grades de determinado subject e type

router.post('/gradeAverage', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');

    let json = JSON.parse(data);

    const params = req.body;

    const results = json.grades.filter(
      (grade) => grade.subject === params.subject && grade.type === params.type
    );

    if (!results.length) {
      throw new Erros(
        'Não foram encontrados registros para os parametros informados'
      );
    }

    const resultsSum = results.reduce((accumulator, currentItem) => {
      return accumulator + currentItem.value;
    }, 0);

    const average = resultsSum / results.length;

    console.log(average);

    res
      .status(200)
      .send(
        `Média dos resultados do subject ${params.subject} e type ${params.type}: ${average}`
      );
  } catch (error) {
    res.status(400).send({ error: error.message });
    logger.error(`POST /grade/subjectResult -${err.message}`);
  }
});

//7. Crie um endpoint para retornar as três melhores grades de acordo com determinado subject e type.

router.post('/top3Grades', async (req, res) => {
  try {
    let data = await readFile(global.fileName, 'utf8');

    let json = JSON.parse(data);

    const params = req.body;

    const results = json.grades.filter(
      (grade) => grade.subject === params.subject && grade.type === params.type
    );

    if (!results.length) {
      throw new Erros(
        'Não foram encontrados registros para os parametros informados'
      );
    }

    results.sort((a, b) => {
      if (a.value < b.value) return 1;
      else if (a.value > b.value) return -1;
      else return 0;
    });

    const top3 = [];
    results
      .slice(0, 3)
      .forEach((item) =>
        top3.push(item.id + ' ' + item.student + ' - ' + item.value)
      );

    res
      .status(200)
      .send(
        `Melhores 3 grades do subject ${params.subject} e type ${params.type}: ${top3}`
      );
  } catch (error) {
    res.status(400).send({ error: error.message });
    logger.error(`POST /grade/subjectResult -${err.message}`);
  }
});

//extra métodos retorna todos as grades do arquivo grades.json
router.get('/', async (_, res) => {
  try {
    //ler o arquivo
    let data = await readFile(global.fileName, 'utf8');

    let json = JSON.parse(data);
    delete json.nextId;
    res.send(json);

    logger.info('GET /account');
  } catch (error) {
    res.status(400).send({ error: error.message });

    logger.error(`GET /account -${err.message}`);
  }
});

export default router;
