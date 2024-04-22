import express from "express";
const protoLoader = require('@grpc/proto-loader');
// const loadPackageDefinition = require('@grpc/grpc-js/loadPackageDefinition');
// const ChannelCredentials = require('@grpc/grpc-js/ChannelCredentials');
import {loadPackageDefinition, ChannelCredentials, GrpcObject} from "@grpc/grpc-js";
const lodash = require('lodash');
const {get} = lodash;
const cors = require('cors');
const { spawn } = require('child_process'); //code below adapted from Ganning Xu's code at https://github.com/ganning127/mft-ui-backend/blob/main/main.ts

const child = spawn('mft', ['init']);
console.log("Running mft init")
child.stdout.setEncoding('utf8');

child.stdout.on('data', (data: any) => {
    console.log(`stdout: ${data}`);
  });
  
child.stderr.on('data', (data: any) => {
    console.error(`stderr: ${data}`);
});

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
            "resourcePath": path, //will just be / for the root directory
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