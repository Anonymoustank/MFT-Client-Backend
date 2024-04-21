import express from "express";
const protoLoader = require('@grpc/proto-loader');
// const loadPackageDefinition = require('@grpc/grpc-js/loadPackageDefinition');
// const ChannelCredentials = require('@grpc/grpc-js/ChannelCredentials');
import {loadPackageDefinition, ChannelCredentials, GrpcObject} from "@grpc/grpc-js";
const lodash = require('lodash');
const {get} = lodash;
const cors = require('cors');

const app = express();
const port = 5500;
const allowedOrigins = ["http://localhost:3000, http://localhost:80, http://localhost:8080"];

var PROTO_PATH = 'src/proto/StorageCommon.proto';
var TRANSFER_API_PROTO_PATH = 'src/proto/api/stub/src/main/proto/MFTTransferApi.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
    defaults: true,
    oneofs: true,
});

var proto = loadPackageDefinition(packageDefinition)
const Service = get(proto, "org.apache.airavata.mft.resource.stubs.storage.common.StorageCommonService");
const serviceClient = new Service("localhost:7003", ChannelCredentials.createInsecure());

const transferApiPackageDefinition = protoLoader.loadSync(TRANSFER_API_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
    defaults: true,
    oneofs: true,
});

var transferApiProto = loadPackageDefinition(transferApiPackageDefinition)
const TransferService = get(transferApiProto, "org.apache.airavata.mft.api.service.MFTTransferService");
const TransferServiceClient = new TransferService("localhost:7003", ChannelCredentials.createInsecure());


app.use(cors());

app.use(cors({
    origin: function (origin: any, callback: any) {
        // allow requests with no origin 
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        //RE ENABLE THE LINES BELOW FOR INCREASED SAFETY
        //if you renable the lines below, you can't access the website from a local webpage

        // if (allowedOrigins.indexOf(origin) === -1) {
        //     var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        //     return callback(new Error(msg), false);
        // }
        return callback(null, true);
    }
}));

app.get('/', (req, res) => {
    // res.json({
    //     message: "You've reached the MFT API!"
    // });
    res.send("<h2>You've reached the MFT API!</h2>")
});

app.get('/list-storages', (req: express.Request, res: express.Response) => {
    serviceClient.listStorages({}, (err: any, resp: any) => {
        if (err) {
            res.json(err);
        } else {
            res.json(resp);
        }
    });
});

app.get('/list-storages/:storageId', (req, res) => {

    const storageId = req.params.storageId;
    const storageType = req.headers.storagetype;
    const path = req.headers.path;

    if (storageType === "LOCAL") {
        // the secretID is just a blank string for local storage
        TransferServiceClient.resourceMetadata({"idRequest" :{
            "resourcePath": path,
            "storageId": storageId,
            "secretId": "",
            "recursiveSearch": true,
        }}, (err: any, resp: any) => {
            if (err) {
                res.json(err);
            } else {
                res.json(resp);
            }
        });
    } else {
        serviceClient.getSecretForStorage({"storageId": storageId}, (err: any, resp: any) => {
            if (err) {
                res.json(err);
            } else {
                const secretId = resp.secretId;
                TransferServiceClient.resourceMetadata({"idRequest" :{
                    "resourcePath": path,
                    "storageId": storageId,
                    "secretId": secretId,
                    "recursiveSearch": true,
                }}, (err: any, resp: any) => {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(resp);
                    }
                });
            }});
    }
});


app.listen(port, () => {
    console.log(`MFT backend listening on port ${port}`);
});

export default app;

// /**
//  * Setup express server.
//  */

// import cookieParser from 'cookie-parser';
// import morgan from 'morgan';
// import path from 'path';
// import helmet from 'helmet';
// import express, { Request, Response, NextFunction } from 'express';
// import logger from 'jet-logger';

// import 'express-async-errors';

// import BaseRouter from '@src/routes/api';
// import Paths from '@src/constants/Paths';

// import EnvVars from '@src/constants/EnvVars';
// import HttpStatusCodes from '@src/constants/HttpStatusCodes';

// import { NodeEnvs } from '@src/constants/misc';
// import { RouteError } from '@src/other/classes';


// // **** Variables **** //

// const app = express();


// // **** Setup **** //

// // Basic middleware
// app.use(express.json());
// app.use(express.urlencoded({extended: true}));
// app.use(cookieParser(EnvVars.CookieProps.Secret));

// // Show routes called in console during development
// if (EnvVars.NodeEnv === NodeEnvs.Dev.valueOf()) {
//   app.use(morgan('dev'));
// }

// // Security
// if (EnvVars.NodeEnv === NodeEnvs.Production.valueOf()) {
//   app.use(helmet());
// }

// // Add APIs, must be after middleware
// app.use(Paths.Base, BaseRouter);

// // Add error handler
// app.use((
//   err: Error,
//   _: Request,
//   res: Response,
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   next: NextFunction,
// ) => {
//   if (EnvVars.NodeEnv !== NodeEnvs.Test.valueOf()) {
//     logger.err(err, true);
//   }
//   let status = HttpStatusCodes.BAD_REQUEST;
//   if (err instanceof RouteError) {
//     status = err.status;
//   }
//   return res.status(status).json({ error: err.message });
// });


// // ** Front-End Content ** //

// // Set views directory (html)
// const viewsDir = path.join(__dirname, 'views');
// app.set('views', viewsDir);

// // Set static directory (js and css).
// const staticDir = path.join(__dirname, 'public');
// app.use(express.static(staticDir));

// // Nav to users pg by default
// app.get('/', (_: Request, res: Response) => {
//   return res.redirect('/users');
// });

// // Redirect to login if not logged in.
// app.get('/users', (_: Request, res: Response) => {
//   return res.sendFile('users.html', { root: viewsDir });
// });


// // **** Export default **** //

// export default app;
