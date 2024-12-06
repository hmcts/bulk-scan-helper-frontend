import axios from 'axios';
export class UploadToBlob {
  async uploadFileToBlob(blobUrl: string, formData: FormData): Promise<string> {
    try {
      await axios.put(blobUrl, formData, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-ms-date': new Date().toUTCString(),
          'x-ms-blob-type': 'BlockBlob',
        }
      });
      console.log('Upload succeeded');
      return '\nUpload succeeded';
    } catch (error) {
      console.error('Error uploading file:', error);
      return '\nError uploading file: ' + (error.message || error);
    }
  }
}

