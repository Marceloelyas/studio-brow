const PDFDocument = require('pdfkit');
const db = require('../config/db');

exports.generate = async (req, res, next) => {
  try {
    const { id } = req.params; // ID do pagamento
    
    // Busca os dados do pagamento, cliente, serviço e agendamento
    const { rows } = await db.query(`
      SELECT p.id, p.amount, p.method, p.paid_at, 
             c.name AS client_name, c.phone AS client_phone,
             s.name AS service_name,
             a.scheduled_at
      FROM payments p
      JOIN appointments a ON a.id = p.appointment_id
      JOIN clients c ON c.id = a.client_id
      JOIN services s ON s.id = a.service_id
      WHERE p.id = $1
    `, [id]);

    if (!rows.length) return res.status(404).json({ error: 'Pagamento não encontrado' });
    const data = rows[0];

    // Cria o PDF
    const doc = new PDFDocument({ margin: 50 });

    // Define os headers para o navegador fazer o download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=recibo-${id.slice(0, 8)}.pdf`);

    // "Pipa" o PDF gerado direto para a resposta HTTP
    doc.pipe(res);

    // --- Layout do Recibo ---
    doc.fontSize(20).text('Studio Brow', { align: 'center' });
    doc.fontSize(10).text('Design de Sobrancelhas', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(16).text('RECIBO DE PAGAMENTO', { align: 'center', underline: true });
    doc.moveDown(2);

    doc.fontSize(12).text(`Cliente: ${data.client_name}`);
    doc.text(`Telefone: ${data.client_phone || '—'}`);
    doc.text(`Serviço: ${data.service_name}`);
    doc.text(`Data do Atendimento: ${new Date(data.scheduled_at).toLocaleString('pt-BR')}`);
    doc.moveDown();

    doc.text(`Valor Pago: R$ ${Number(data.amount).toFixed(2).replace('.', ',')}`);
    doc.text(`Forma de Pagamento: ${data.method.toUpperCase()}`);
    doc.text(`Data do Pagamento: ${new Date(data.paid_at).toLocaleString('pt-BR')}`);
    
    doc.moveDown(4);
    doc.text('_________________________________________', { align: 'center' });
    doc.text('Assinatura / Studio Brow', { align: 'center' });

    doc.end(); // Finaliza o PDF

  } catch (err) {
    next(err);
  }
};
