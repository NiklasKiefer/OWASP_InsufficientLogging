import { inject, injectable } from "inversify";
import { Connection, r, RConnectionOptions, RDatum } from 'rethinkdb-ts';
import * as databaseConfiguration from '../../configuration/db-config.json';
import { CheckIn } from "../../models/checkin.model";
import { stringify } from "querystring";
import { TimeStampLogger } from "./timestamp-logger.service";


@injectable()
export class DatabaseService{
    constructor(@inject(TimeStampLogger.name) private timeStampLogger: TimeStampLogger){

    }

    public initialize(): Promise<boolean>{
        return new Promise((resolve, reject) => {
            this.connect().then((connection: Connection) =>{
                r.dbList()
                .contains(databaseConfiguration.databaseName)
                .do((containsDatabase: RDatum<boolean>) =>{
                    return r.branch(containsDatabase, {created: 0}, r.dbCreate(databaseConfiguration.databaseName));
                }).run(connection)
                  .then(() =>{
                       this.timeStampLogger.info("Trying to create tables");
                       this.createTables(connection)
                        .then(() =>{
                            this.timeStampLogger.info("Tables created");
                            resolve(true);
                        })
                        .catch((error) =>{
                            this.timeStampLogger.error(error, "Error while creating tables");
                            reject(false);
                        });
                   }).catch((error) => {
                       reject(false);
                       this.timeStampLogger.error(error, "Error after creating database.");
                   });
            });
        });
    }

    public loginUser(username: string, password: string): Promise<any>{
        return new Promise((resolve, reject) =>{
            this.connect().then((connection: Connection) =>{
                r.db(databaseConfiguration.databaseName)
                 .table("accounts")
                 .filter({username: username, password: password})
                 .count()
                 .eq(1)
                 .do((exists) => r.branch(
                     exists,
                     {Login: true},
                     {Login: false}
                 )).run(connection)
                 .then((response) =>{
                    if(response.Login) {
                        this.timeStampLogger.info(`User \"${username}\" logged in successfully.`);
                    }

                    if (!response.Login){
                        this.timeStampLogger.error(`User with username \"${username}\" and password \"${password}\" failed to login.`);
                    }

                    resolve(response);
                 })
            });
        });
    }

    public registerUser(username: string, password: string): Promise<any>{
        this.timeStampLogger.info("Starting to register new user with username " + username + " and password " + password);
        return new Promise((resolve, reject) =>{
            this.connect().then((connection: Connection) =>{
                r.db(databaseConfiguration.databaseName)
                 .table('accounts')
                 .filter({username: username})
                 .isEmpty()
                 .do((empty)=> r.branch(
                     empty,
                     r.db(databaseConfiguration.databaseName).table('accounts').insert({
                         username: username,
                         password: password
                     }),
                     {alreadyExists: true}
                 )).run(connection)
                 .then((response) =>{
                     this.timeStampLogger.info("Responding to client after new registration.");
                     //Returns false if data already exists.
                     if("alreadyExists" in response){
                        this.timeStampLogger.error(`The user with the username \"${username}\" and password \"${password}\" cannot be registered`);
                         resolve(response);
                     }
                     //Returns true if data has not existed until now.
                     else{
                        this.timeStampLogger.info(`The user with the username \"${username}\" and password \"${password}\" was registered`);
                         resolve({created: true});
                     }
                 }).catch((error) => { 
                     this.timeStampLogger.error(error, "Error while saving new account.");
                     reject(error);
                 })
            });
        });
    }

    private createTables(connection: Connection):Promise<boolean>{
        return new Promise((resolve, reject) =>{
            const promises = new Array<Promise<boolean>>();
            databaseConfiguration.databaseTables.forEach((table) =>{
                promises.push(this.createTable(connection, table));
            });
            Promise.all(promises).then(() =>{
                resolve(true);
            }).catch((error) => {
                this.timeStampLogger.error(error, "Error in createTables");
                reject(false);
            });
        });
    }

    private createTable(connection:Connection, tableName: string): Promise<boolean>{
        return new Promise((resolve, reject) =>{
            r.db(databaseConfiguration.databaseName)
            .tableList()
            .contains(tableName)
            .do((containsTable: RDatum<boolean>) =>{
                return r.branch(
                    containsTable, 
                    {create: 0}, 
                    r.db(databaseConfiguration.databaseName).tableCreate(tableName));
            }).run(connection)
            .then(() =>{
                resolve(true);
            }).catch((error) =>{
                this.timeStampLogger.error(error, "Error in createTable");
                reject(false);
            });
        });
    }

    private connect():Promise<Connection>{
        const rethinkDbOptions: RConnectionOptions ={
            host: databaseConfiguration.databaseServer,
            port: databaseConfiguration.databasePort
        }
        return new Promise((resolve, reject) =>{
            r.connect(rethinkDbOptions).then((connection: Connection) =>{
                resolve(connection);
            }).catch(reject);
        });
    }
}