const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3001;

app.use(express.json());

// API endpoint to execute shell commands
app.post('/api/execute-command', (req, res) => {
  const { command } = req.body;
  
  // Security check - only allow kubectl and helmfile commands
  if (!command.startsWith('kubectl') && !command.startsWith('helmfile') && !command.startsWith('updateImage')) {
    return res.status(403).json({ error: 'Only kubectl, updateImage and helmfile commands are allowed' });
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message, output: stderr });
    }
    return res.json({ output: stdout });
  });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});