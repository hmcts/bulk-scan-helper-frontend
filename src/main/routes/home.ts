import * as fs from 'fs';
import * as path from 'path';

import { SecureRequester } from './../assets/js/secureRequester';

import axios from 'axios';
import { Application } from 'express';

const multer = require('multer');

export default function (app: Application): void {
  const upload = multer({ dest: 'uploads/' });

  app.get('/', async (req, res) => {
    try {
      const data = { 'output': 'Ready...' };
      res.render('home', { data });
    } catch (error) {
      console.error('Error making request:', error);
      res.render('home', {});
    }
  });

  app.post('/', upload.single('myfile'), async (req, res) => {

    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    //may need globalprotect on and f5 off else it can't get sas token
    const output = 'Starting...';
    const data = { output };
    try {
      const { environment, jurisdiction } = req.body;

      // ----------------------START: Grab the sas token------------------------
      let sasToken = '';
      const requester = new SecureRequester(environment);
      const response = await requester.getRequest('/reform-scan/token/' + jurisdiction);
      if (response) {
        console.log('SAS token:', response.data.sas_token);
        data.output += '\nSAS token: ' + response.data.sas_token;
        sasToken = response.data.sas_token;
      }
      // ----------------------END: Grab the sas token------------------------
      // ----------------------START: Generate a random file name------------------------

      const randomNumbers = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const formattedDate = `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;
      const newFileName = `${randomNumbers}_${formattedDate}`;

      data.output += '\nFile will be uploaded as: ' + newFileName;
      const currentPath = req.file.path;
      const newPath = path.join(path.dirname(currentPath), newFileName);
      fs.renameSync(currentPath, newPath);

      // ----------------------END: Generate a random file name------------------------
      // ----------------------START: Upload the file------------------------


      const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
      const formData = new FormData();
      formData.append('myfile', fileBlob, newFileName); //this may be where the name is set when uploading

      const blobUrl = `https://reformscan.${environment}.platform.hmcts.net/${jurisdiction}/${newFileName}?${sasToken}`;
      const headers = {
        'Content-Type': 'application/octet-stream',
        'x-ms-date': new Date().toUTCString(),
        'x-ms-blob-type': 'BlockBlob',
      };
      try {
        await axios.put(blobUrl, formData, { headers });
        console.log('Upload succeeded');
        data.output += '\nUpload succeeded';
      } catch (error) {
        console.error('Error uploading file:', error);
        data.output += '\nError uploading file: ' + error;
      }
      // ----------------------END: Upload the file------------------------
      res.render('home', { data });
    } catch (error) {
      data.output += '\nError making request: ' + error;
      res.render('home', { data });
    }
  });
}
