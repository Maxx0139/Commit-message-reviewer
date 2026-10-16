import express from 'express';
import { Server } from 'http';
import fs from 'fs';

export function startServer(port: number = 3546): Server {
    const app = express();

    app.get('/', (req, res) => {
        const reportPath = process.env.REPORT_PATH || './report.html';
        try {
            const html = fs.readFileSync(reportPath, 'utf8');
            res.send(html);
        } catch (error) {
            res.status(404).send(`
        <h1>Report not found</h1>
        <p>Please run the review first: <code>npm start</code></p>
      `);
        }
    });

    const server = app.listen(port, () => {
        console.log(`\nHTML Report available at: http://localhost:${port}`);
        console.log(`Press Ctrl+C to stop the server\n`);
    });

    return server;
}