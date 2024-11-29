import * as fs from 'fs';
import * as path from 'path';

import { SecureRequester } from './../assets/js/secureRequester';

import axios from 'axios';
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

        const randomNumbers = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
        const now = new Date();
        const formattedDate = [
          now.getDate().toString().padStart(2, '0'),
          (now.getMonth() + 1).toString().padStart(2, '0'),
          now.getFullYear(),
          now.getHours().toString().padStart(2, '0'),
          now.getMinutes().toString().padStart(2, '0'),
          now.getSeconds().toString().padStart(2, '0'),
        ].join('-');
        const newFileName = `${randomNumbers}_${formattedDate}`;

        data.output += '\nFile will be uploaded as: ' + newFileName;
        fs.renameSync(req.file.path, path.join(path.dirname(req.file.path), newFileName));


        const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        const formData = new FormData();
        formData.append('myfile', fileBlob, newFileName); //this may be where the name is set when uploading

        const blobUrl = `https://reformscan.${environment}.platform.hmcts.net/${jurisdiction}/${newFileName}?${sasToken}`;
        try {
          await axios.put(blobUrl, formData, {
            headers: {
              'Content-Type': 'application/octet-stream',
              'x-ms-date': new Date().toUTCString(),
              'x-ms-blob-type': 'BlockBlob',
            }
          });
          console.log('Upload succeeded');
          data.output += '\nUpload succeeded';
        } catch (error) {
          console.error('Error uploading file:', error);
          data.output += '\nError uploading file: ' + error;
        }

      } else {
        console.error('Error getting SAS token. Check connection to GlobalProtect VPN is on.');
        data.output += '\nError getting SAS token. Check connection to GlobalProtect VPN is on.';
        res.render('home', { data });
      }
    }
    res.render('home', { data });
  });
}
