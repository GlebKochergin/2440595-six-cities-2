import { WriteStream } from 'node:fs';
import { createWriteStream } from 'node:fs';

export interface FileWriterInterface {
  readonly filename: string;
  write(row: string): void;
}

const CHUNK_SIZE = 2 ** 16;

export default class TSVFileWriter implements FileWriterInterface {
  private stream: WriteStream;

  constructor(public readonly filename: string) {
    this.stream = createWriteStream(this.filename, {
      flags: 'w',
      encoding: 'utf8',
      highWaterMark: CHUNK_SIZE,
      autoClose: true,
    });
  }

  public async write(row: string): Promise<void> {
    return !this.stream.write(`${row}\n`) ? new Promise((resolve) => {
      this.stream.once('drain', () => resolve());
    }) : Promise.resolve();
  }
}
