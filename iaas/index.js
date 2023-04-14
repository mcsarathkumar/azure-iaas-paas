const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Render HTML form with file upload field for PDF files
app.get('/upload', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Upload PDF File</h1>
        <form action="/process" method="post" enctype="multipart/form-data">
          <input type="file" name="pdfFile" accept=".pdf" />
          <button type="submit">Upload</button>
        </form>
      </body>
    </html>
  `);
});

// Process uploaded PDF file
app.post('/process', upload.single('pdfFile'), (req, res) => {
  // Get the uploaded file path
  const pdfFilePath = req.file.path;

  // Compress the PDF using Ghostscript
  const compressedFilePath = path.join('uploads/', `${Date.now()}_compressed.pdf`);
  const ghostscriptCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${compressedFilePath} ${pdfFilePath}`;
  exec(ghostscriptCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Ghostscript error: ${error.message}`);
      res.status(500).send('Failed to compress PDF file');
      return;
    }

    console.log(`Ghostscript stdout: ${stdout}`);
    console.error(`Ghostscript stderr: ${stderr}`);

    // Read the compressed file and send as response attachment
    const compressedFile = fs.readFileSync(compressedFilePath);
    fs.unlinkSync(pdfFilePath);
    fs.unlinkSync(compressedFilePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=compressed.pdf');
    res.send(compressedFile);
  });
});

// Start the server
app.listen(80, () => {
  console.log('Server started on http://localhost:80');
});