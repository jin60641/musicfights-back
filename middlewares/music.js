import { AudioContext } from 'web-audio-api';
import { File, FileReader } from 'file-api';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs-extra';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'tmp'));
  },
});

const upload = multer({
  limits: { fieldSize: 20 * 1024 * 1024 },
  storage,
  fileFilter: (req, file, next) => {
    next(null, true);
  },
});


const postMusic = (req, res) => {
  const { file } = req;
  const filePath = path.join(__dirname, '..', 'files', file.originalname);
  fs.moveSync(file.path, filePath, { overwrite: true });
  const context = new AudioContext();
  const reader = new FileReader();
  reader.onload = async ({ target: { result } }) => {
    ffmpeg.ffprobe(filePath, (err, { format: { duration } }) => {
      context.decodeAudioData(result, (buffer) => {
        const channel = buffer.getChannelData(0);
        const cut = Math.floor(channel.length / duration);
        const vals = [...Array(Math.floor(duration)).keys()]
          .map(second => [...Array(cut).keys()]
            .reduce((sum, now) => sum + Math.abs(channel[(second * cut) + now]), 0));

        const max = Math.max(...vals);
        const bars = vals.map(val => val / max);
        res.send({ data: bars, message: 'success' });
      });
    });
  };
  reader.readAsArrayBuffer(new File(filePath));
};

export default {
  upload,
  postMusic,
};
