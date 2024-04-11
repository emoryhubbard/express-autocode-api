
import * as admin from 'firebase-admin';
import { extractJS } from "../library/extractjs";
import { prompt, addInstruct } from "../library/prompt"
import { logAndRun } from "../library/run"
import dotenv from "dotenv";
dotenv.config();

export const addFeature = async (req: any, res: any) => {
      const firestore = admin.firestore();
      const response = await firestore.collection('features').add(req.body);
      if (process.env.REMOTE == 'true') {
            const AWS = require('aws-sdk');
            AWS.config.update({ region: 'us-east-2' });

            const ec2 = new AWS.EC2();
            const ssm = new AWS.SSM();

            const params = {
                  ImageId: 'ami-0b8b44ec9a8f90422', 
                  InstanceType: 't2.large',
                  MinCount: 1,
                  MaxCount: 1,
            };

            ec2.runInstances(params, function(err: any, data: { Instances: { InstanceId: any; }[]; }) {
                  if (err) {
                        console.error('Could not create instance', err);
                        return;
                  }
                  const instanceId = data.Instances[0].InstanceId;
                  console.log('Instance created:', instanceId);

                  /*const ssmParams = {
                        InstanceIds: [instanceId],
                        DocumentName: 'AWS-RunShellScript',
                        Parameters: {
                              commands: [
                              'sudo apt-get update && sudo apt-get install -y git rust cargo nodejs npm chromium-browser',
                              'https://github.com/emoryhubbard/autocode-native.git'
                              ]
                        }
                  };

                  ssm.sendCommand(ssmParams, function(err: any, data: { Command: { CommandId: any; }; }) {
                        if (err) {
                              console.error('Error running SSM command', err);
                              return;
                        }
                        const commandId = data.Command.CommandId;
                        console.log('SSM command executed:', commandId);
                        });*/
            });

      }
      
      res.status(200).json(response);
}