let usuario = null;

async function login() {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  const res = await fetch('/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email, senha })
  });

  if (res.status !== 200) return alert('Erro login');

  usuario = await res.json();
  alert('Logado!');
}

async function cadastrar() {
  const nome = document.getElementById('nome').value;

  await fetch('/funcionario', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ nome, usuario_id: usuario?.id })
  });

  listar();
}

async function listar() {
  const res = await fetch('/funcionarios');
  const dados = await res.json();

  const ul = document.getElementById('lista');
  ul.innerHTML = '';

  dados.forEach(f => {
    const li = document.createElement('li');
    li.textContent = f.id + ' - ' + f.nome;
    ul.appendChild(li);
  });
}

async function ponto() {
  const id = document.getElementById('id').value;

  await fetch('/ponto', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ funcionario_id: id })
  });

  carregarRelatorio();
}

async function carregarRelatorio() {
  const res = await fetch('/relatorio');
  const dados = await res.json();

  const ul = document.getElementById('relatorio');
  ul.innerHTML = '';

  dados.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `Func ${p.funcionario_id} - ${p.horas}`;
    ul.appendChild(li);
  });
}

listar();
carregarRelatorio();