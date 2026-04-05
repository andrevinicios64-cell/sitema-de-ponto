const express = require('express');
const app = express();

const db = require('./db/database');

app.use(express.json());
app.use(express.static('public'));

// CADASTRAR FUNCIONÁRIO
app.post('/funcionario', (req, res) => {
  const { nome } = req.body;

  db.run(`INSERT INTO funcionarios (nome) VALUES (?)`, [nome], function(err) {
    if (err) return res.send(err);
    res.send('Funcionário cadastrado');
  });
});

// LISTAR FUNCIONÁRIOS
app.get('/funcionarios', (req, res) => {
  db.all(`SELECT * FROM funcionarios`, [], (err, rows) => {
    if (err) return res.send(err);
    res.json(rows);
  });
});

// EXCLUIR FUNCIONÁRIO
app.delete('/funcionario/:id', (req, res) => {
  const id = req.params.id;

  db.run(`DELETE FROM funcionarios WHERE id = ?`, [id], (err) => {
    if (err) return res.send(err);
    res.send('Removido');
  });
});

// REGISTRAR PONTO (entrada/saída automática)
app.post('/ponto', (req, res) => {
  const { funcionario_id } = req.body;
  const agora = new Date().toISOString();

  db.get(
    `SELECT * FROM pontos WHERE funcionario_id = ? ORDER BY id DESC LIMIT 1`,
    [funcionario_id],
    (err, ultimo) => {

      if (!ultimo || ultimo.saida) {
        db.run(
          `INSERT INTO pontos (funcionario_id, data, entrada)
           VALUES (?, ?, ?)`,
          [funcionario_id, agora, agora],
          (err) => {
            if (err) return res.send(err);
            res.send("Entrada registrada");
          }
        );
      } else {
        db.run(
          `UPDATE pontos SET saida = ? WHERE id = ?`,
          [agora, ultimo.id],
          (err) => {
            if (err) return res.send(err);
            res.send("Saída registrada");
          }
        );
      }
    }
  );
});

// RELATÓRIO
app.get('/relatorio', (req, res) => {
  db.all(`SELECT * FROM pontos`, [], (err, rows) => {
    if (err) return res.send(err);

    const resultado = rows.map(p => {
      if (p.entrada && p.saida) {
        const entrada = new Date(p.entrada);
        const saida = new Date(p.saida);

        let horas = (saida - entrada) / 3600000;

        if (horas > 6) horas -= 1;

        return { ...p, horas: horas.toFixed(2) };
      }

      return { ...p, horas: 'Em aberto' };
    });

    res.json(resultado);
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});