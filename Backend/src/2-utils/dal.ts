import mysql from "mysql";
import config from "./config";

// Creating a connection object:
const connection = mysql.createPool({
    host: config.mysqlHost,
    user: config.mysqlUser,
    password: config.mysqlPassword,
    database: config.mysqlDatabase
});

console.log("We're connected to MySQL");

function execute(sql: string): Promise<any> {

    return new Promise<any>((resolve, reject) => { // To Promisify an asynchronous function

        // Execute the sql on MySQL:
        connection.query(sql, (err, result) => {

            // If there is an error: 
            if (err) {
                reject(err);
                return;
            }

            // No error - report data: 
            resolve(result);
        });

    });
}

export default {
    execute
};