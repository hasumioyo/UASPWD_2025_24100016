const http = require('http');
const fs = require('fs');
const path = require('path');
const {parse} = require('querystring');
const mysql = require('mysql2');

const publicDir = path.join(__dirname, 'public');
const PORT = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'guru_les_id'

});
db.connect((err) => {
    if(err){
        console.error("Gagal konek ke database");
        process.exit();
    }
    console.log("Berhasil konek ke database!");
})

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        const filePath = req.url === '/' ? '/index.html' : req.url;
        const fullPath = path.join(publicDir, filePath);

        fs.readFile(fullPath, (err, content) => {
            if (err) {
                res.writeHead(404);
                return res.end('File not found');
            }

            const ext = path.extname(fullPath);
            const contentType = ext === '.css' ? 'text/css' :
                                ext === '.js' ? 'text/javascript' :
                                ext === '.html' ? 'text/html' : 'text/plain';

            res.writeHead(200, {'Content-Type' : contentType});
            res.end(content);
        });

    } else if (req.method === 'POST' && req.url === '/contact') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => { 
            const parsed = parse(body); 
            const {student_name, email, tutor_name, message} = parsed;
            const sql = 'INSERT INTO contact (student_name, email, tutor_name, message) values(?,?,?,?)';
            db.query(sql, [student_name, email,tutor_name, message], (err) => {
                if(err){
                    console.log("gagal disimpan ke DB");
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    return res.end("gagal menyimpan data");
        }
            res.writeHead(200, {'Content-Type' : 'text/plain'});
            return res.end("Data Anda sudah disimpan di database!");
        })
    });

    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {console.log (`Server running at http://localhost:${PORT}`)});