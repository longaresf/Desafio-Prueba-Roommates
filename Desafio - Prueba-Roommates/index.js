// Importar módulos necesarios
const http = require('http');
const url = require('url');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const agregarRoommate = require('./funciones/getUser')

http
    .createServer((req,res) => {

        if(req.url == ('/') && req.method == 'GET') {
            res.writeHead(200,{'Content-Type':'text:html'});
            fs.readFile('index.html','utf8',(err,html) => {
                res.end(html);
            })
        }

        // Array que contiene todos los datos desde el archivo roommates.json
        let roommatesJSON = JSON.parse(fs.readFileSync('./archivos/roommates.json','utf8'));
        let roommates = roommatesJSON.roommates; 

        // Ruta para disponibilizar los datos desde archivo roommates.json
        if(req.url.startsWith('/roommate') && req.method == 'GET'){
            res.end(JSON.stringify(roommatesJSON,null,1))
        }
    
        // Ruta que sirve para agregar nuevos roommates
        if(req.url.startsWith('/roommate') && req.method == 'POST'){

            let nombre;
            let apellido;

            req.on('data', () => {

            })

            req.on('end', () => {

                agregarRoommate()
                    .then((datos) => {
                        nombre = datos.results[0].name.first;
                        apellido = datos.results[0].name.last;

                        // Objeto que se agregará al array
                        const roommate = {
                            id: uuidv4(),
                            nombre: nombre + ' ' + apellido,
                            debe:'',
                            recibe:''
                        }

                        // Agregando nuevo roommate al array roommates
                        roommates.push(roommate);

                        // Reescribiendo archivo
                        fs.writeFile('./archivos/roommates.json',JSON.stringify(roommatesJSON,null,1),()=>{
                            res.end();
                        });
                        
                });
                
            })
        }

//--------------------------------------------------------------


        // Array que contiene todos los datos desde el archivo
        let gastosJSON = JSON.parse(fs.readFileSync('./archivos/gastos.json','utf8'));
        let gastos = gastosJSON.gastos;
        
        // Ruta para disponibilizar los datos desde archivo gastos.json 
        if(req.url.startsWith('/gastos') && req.method == 'GET'){
            res.end(JSON.stringify(gastosJSON,null,1));
        }

        // Ruta para agregar nuevos registros al archivo gastos.json
        if(req.url.startsWith('/gasto') && req.method == 'POST'){
            let body;

            req.on('data',(payload) => {
                body = JSON.parse(payload);
            });

            req.on('end',() => {
                gasto = {
                    id: uuidv4(),
                    roommate: body.roommate,
                    descripcion: body.descripcion,
                    monto: body.monto
                };

                gastos.push(gasto);

                fs.writeFileSync('./archivos/gastos.json',JSON.stringify(gastosJSON,null,1));
                res.end();
                console.log('Gasto registrado con éxito en el archivo gastos.json');
            })
        }

        // Ruta para actualizar registros del archivo gastos.json
        if(req.url.startsWith('/gasto') && req.method == 'PUT') {
            let body;

            // Traer el id a través de query strings
            const { id } = url.parse(req.url,true).query;

            req.on('data',(payload) => {
                body = JSON.parse(payload);
                body.id = id;
            });

            req.on('end', () => {
                gastosJSON.gastos = gastos.map((g) => {
                    if ( g.id == body.id){
                        return body;
                    }
                    return g;
                });

                /* console.log(body.id) */

                fs.writeFileSync('./archivos/gastos.json',JSON.stringify(gastosJSON,null,1));
                res.end()
            })
        }

        // Ruta para borrar registros del archivo gastos.json
        if(req.url.startsWith('/gasto') && req.method == 'DELETE') {

            const { id } = url.parse(req.url,true).query;

            gastosJSON.gastos = gastos.filter((g) => g.id !== id);

            fs.writeFileSync('./archivos/gastos.json',JSON.stringify(gastosJSON,null,1));
            res.end();
        }

    })
    .listen(3000,()=>{console.log(`Server running on port 3000 and PID: ${process.pid}`)})
