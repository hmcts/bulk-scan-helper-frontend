import * as fs from 'fs';
import * as path from 'path';

import { FilenameGenerator } from './../assets/js/filenameGenerator';
import { SecureRequester } from './../assets/js/secureRequester';
import { UploadToBlob } from './../assets/js/uploadToBlob';

import { Application } from 'express';

const multer = require('multer');

export default function (app: Application): void {
  const upload = multer({ dest: 'uploads/' });

  app.get('/', (req, res) => res.render('home', { output: 'Ready...' }));

  app.post('/', upload.single('myfile'), async (req, res) => {
    //may need globalprotect on and f5 off else it can't get sas token
    const data = { 'output': 'Starting...' };

    if (!req.file) {
      data.output += '\nNo file selected...';
      res.render('home', { data });
    } else {
      const { environment, jurisdiction } = req.body;
      let sasToken = '';
      const requester = new SecureRequester(environment);
      const response = await requester.getRequest('/reform-scan/token/' + jurisdiction);
      if (response?.status === 200 && response.data.sas_token) {
        console.log('SAS token:', response.data.sas_token);
        data.output += '\nSAS token: ' + response.data.sas_token;
        sasToken = response.data.sas_token;

        const newFileName = new FilenameGenerator().generateFileName();
        data.output += '\nFile will be uploaded as: ' + newFileName;
        fs.renameSync(req.file.path, path.join(path.dirname(req.file.path), newFileName));
        const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        const formData = new FormData();
        formData.append('myfile', fileBlob, newFileName); //this may be where the name is set when uploading

        const blobUrl = `https://reformscan.${environment}.platform.hmcts.net/${jurisdiction}/${newFileName}?${sasToken}`;
        const uploadResult = await new UploadToBlob().uploadFileToBlob(blobUrl, formData);
        data.output += uploadResult;
      } else {
        console.error('Error getting SAS token. Check connection to GlobalProtect VPN is on.');
        data.output += '\nError getting SAS token. Check connection to GlobalProtect VPN is on.';
        res.render('home', { data });
      }
    }
    res.render('home', { data });
  });
}
