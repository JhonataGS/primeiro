const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const port = 3000;
const secret = 'seu-segredo-seguro';

app.use(express.json());
app.use(cors());

app.post('/register', async (req, res) => {
  const { nome, usuario, senha } = req.body;
  const hashedPassword = await bcrypt.hash(senha, 10);
  try {
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        usuario,
        senha: hashedPassword,
      },
    });
    res.status(201).send(novoUsuario);
  } catch (error) {
    res.status(500).send({ error: 'Erro ao registrar usuário' });
  }
});

app.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;
  const user = await prisma.usuario.findUnique({ where: { usuario } });
  if (user && await bcrypt.compare(senha, user.senha)) {
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
    res.send({ token });
  } else {
    res.status(401).send({ error: 'Credenciais inválidas' });
  }
});

app.post('/chamados', async (req, res) => {
  const { dataInicial, nome, canal, problema, numeroTicket, dataFinal, usuarioId } = req.body;
  try {
    const novoChamado = await prisma.chamado.create({
      data: {
        dataInicial: new Date(dataInicial),
        nome,
        canal,
        problema,
        numeroTicket,
        dataFinal: new Date(dataFinal),
        usuarioId
      },
    });
    res.status(201).send(novoChamado);
  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    res.status(500).send({ error: 'Erro ao criar chamado' });
  }
});

app.get('/chamados', async (req, res) => {
  try {
    const chamados = await prisma.chamado.findMany();
    res.send(chamados);
  } catch (error) {
    res.status(500).send({ error: 'Erro ao listar chamados' });
  }
});

app.get('/export-chamados', async (req, res) => {
  try {
    const chamados = await prisma.chamado.findMany();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Chamados');
    
    worksheet.columns = [
      { header: 'ID', key: 'id' },
      { header: 'Data Inicial', key: 'dataInicial' },
      { header: 'Nome', key: 'nome' },
      { header: 'Canal', key: 'canal' },
      { header: 'Problema', key: 'problema' },
      { header: 'Número do Ticket', key: 'numeroTicket' },
      { header: 'Data Final', key: 'dataFinal' }
    ];

    // Adiciona os dados à planilha
    chamados.forEach(chamado => {
      worksheet.addRow({
        id: chamado.id,
        dataInicial: chamado.dataInicial.toISOString().split('T')[0],
        nome: chamado.nome,
        canal: chamado.canal,
        problema: chamado.problema,
        numeroTicket: chamado.numeroTicket,
        dataFinal: chamado.dataFinal.toISOString().split('T')[0]
      });
    });

    const exportPath = path.join(__dirname, 'chamados_export.xlsx');
    await workbook.xlsx.writeFile(exportPath);
    res.download(exportPath);
  } catch (error) {
    console.error('Erro ao exportar chamados:', error);
    res.status(500).send({ error: 'Erro ao exportar chamados' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
