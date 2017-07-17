
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

//load customers route
var customers = require('./routes/customers'); 
var app = express();

var connection  = require('express-myconnection'); 
var mysql = require('mysql');

// all environments
app.set('port', process.env.PORT || 4300);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*------------------------------------------
    connection peer, register as middleware
    type koneksi : single,pool and request 
-------------------------------------------*/
const connectionParams = {
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        multipleStatements: true
    };

app.use(
    connection(mysql, connectionParams, 'pool') //or single
);

app.get('/', routes.index);
app.get('/customers', customers.list);
app.get('/customers/add', customers.add);
app.post('/customers/add', customers.save);
app.get('/customers/delete/:id', customers.delete_customer);
app.get('/customers/edit/:id', customers.edit);
app.post('/customers/edit/:id',customers.save_edit);
app.use(app.router);

connectionParamsWithoutDB = Object.assign({}, connectionParams);
delete connectionParamsWithoutDB.database;
var connection = mysql.createConnection(connectionParamsWithoutDB);

connection.connect();

const migrationQuery = `

    CREATE DATABASE IF NOT EXISTS \`${connectionParams.database}\`;

    USE \`${connectionParams.database}\`;

    CREATE TABLE IF NOT EXISTS \`customer\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`name\` varchar(200) NOT NULL,
    \`address\` text NOT NULL,
    \`email\` varchar(200) NOT NULL,
    \`phone\` varchar(20) NOT NULL,
    PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=11 ;
`;

connection.query(migrationQuery, function (error, results, fields) {
    if (error) throw error;

    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
});

connection.end();

