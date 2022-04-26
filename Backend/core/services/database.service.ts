import { inject, injectable } from "inversify";
import { LoggerService } from "./logger.service";
import { Connection, r, RConnectionOptions, RDatum } from 'rethinkdb-ts';
import * as databaseConfiguration from '../../configuration/db-config.json';
import { CheckIn } from "../../models/checkin.model";
import { stringify } from "querystring";


@injectable()
export class DatabaseService{
    constructor(@inject(LoggerService.name) private loggerService: LoggerService){

    }

    private getClassAndMethodStack(methodname: string){
        return "[" + nameof(DatabaseService) + "]" + "[" + methodname + "]";
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
                       this.loggerService.info(this.getClassAndMethodStack(nameof(this.initialize)),"Trying to create tables");
                       this.createTables(connection)
                        .then(() =>{
                            this.loggerService.info(this.getClassAndMethodStack(nameof(this.initialize)),"Tables created");
                            resolve(true);
                        })
                        .catch((error) =>{
                            this.loggerService.error(this.getClassAndMethodStack(nameof(this.initialize)), "Error while creating Tables:" + error);
                            reject(false);
                        });
                   }).catch((error) => {
                       reject(false);
                       this.loggerService.error(this.getClassAndMethodStack(nameof(this.initialize)), "Error after creating database:" + error);
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
                        this.loggerService.info(this.getClassAndMethodStack(nameof(this.loginUser)),"User " + username + " logged in successfully.");
                    }
                    resolve(response);
                 })
            });
        });
    }

    public registerUser(username: string, password: string): Promise<any>{
        this.loggerService.info(this.getClassAndMethodStack(nameof(this.registerUser)),"Starting to register new user with username " + username + " and password " + password);
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
                     this.loggerService.info(this.getClassAndMethodStack(nameof(this.registerUser)),"Responding to client after new registration.");
                     //Returns false if data already exists.
                     if("alreadyExists" in response){
                         resolve(response);
                     }
                     //Returns true if data has not existed until now.
                     else{
                         resolve({created: true});
                     }
                 }).catch((error) => { 
                     this.loggerService.error(this.getClassAndMethodStack(nameof(this.registerUser)), "Error while saving new account:" + error);
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
                this.loggerService.error(this.getClassAndMethodStack(nameof(this.createTables)), "Error in while trying to create Tables:" + error);
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
                this.loggerService.error(this.getClassAndMethodStack(nameof(this.createTable)), "Error while trying to create Table " + tableName + ":" + error);
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