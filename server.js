const express = require('express');
const app = express();
const pool = require('./db/database');

app.use(express.json());
app.use(express.static('public'));

// LOGIN
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const result = await pool.query(
    'SELECT * FROM usuarios WHERE email = $1 AND senha = $2',
    [email, senha]
  );

  if (result.rows.length === 0) return res.status(401).send('Erro');

  res.json(result.rows[0]);
});

// CADASTRAR USUÁRIO
app.post('/registro', async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  await pool.query(
    'INSERT INTO usuarios (nome, email, senha, tipo) VALUES ($1, $2, $3, $4)',
    [nome, email, senha, tipo]
  );

  res.send('Usuário criado');
});

// FUNCIONÁRIOS
app.post('/funcionario', async (req, res) => {
  const { nome } = req.body;

  await pool.query(
    'INSERT INTO funcionarios (nome) VALUES ($1)',
    [nome]
  );

  res.send('OK');
});

app.get('/funcionarios', async (req, res) => {
  const result = await pool.query('SELECT * FROM funcionarios');
  res.json(result.rows);
});

// PONTO
app.post('/ponto', async (req, res) => {
  const { funcionario_id } = req.body;

  const ultimo = await pool.query(
    'SELECT * FROM pontos WHERE funcionario_id = $1 ORDER BY id DESC LIMIT 1',
    [funcionario_id]
  );

  if (ultimo.rows.length === 0 || ultimo.rows[0].saida) {
    await pool.query(
      'INSERT INTO pontos (funcionario_id, entrada) VALUES ($1, NOW())',
      [funcionario_id]
    );
    res.send('Entrada');
  } else {
    await pool.query(
      'UPDATE pontos SET saida = NOW() WHERE id = $1',
      [ultimo.rows[0].id]
    );
    res.send('Saída');
  }
});

// RELATÓRIO
app.get('/relatorio', async (req, res) => {
  const result = await pool.query('SELECT * FROM pontos');

  const dados = result.rows.map(p => {
    if (p.entrada && p.saida) {
      const horas = (new Date(p.saida) - new Date(p.entrada)) / 3600000;
      return { ...p, horas: horas.toFixed(2) };
    }
    return { ...p, horas: 'Aberto' };
  });

  res.json(dados);
});

const PORT = process.env.PORT || 3000;
criarTabelas();app.listen(PORT, () => console.log('Servidor rodando'));
async function criarTabelas() :await pool.query(`
  INSERT INTO usuarios (nome, email, senha, tipo)
  VALUES ('admin', 'admin@admin.com', '123', 'admin')
  ON CONFLICT DO NOTHING
`); {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome TEXT,
      email TEXT,
      senha TEXT,
      tipo TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS funcionarios (
      id SERIAL PRIMARY KEY,
      nome TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pontos (
      id SERIAL PRIMARY KEY,
      funcionario_id INTEGER,
      entrada TIMESTAMP,
      saida TIMESTAMP
    )
  `);

  console.log("Tabelas criadas com sucesso");
}app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});
