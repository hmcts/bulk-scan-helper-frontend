

export class FilenameGenerator {

  generateFileName(): string {
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
    return `${randomNumbers}_${formattedDate}`;
  }

}
