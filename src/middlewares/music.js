import { AudioContext } from 'web-audio-api';
import { File, FileReader } from 'file-api';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs-extra';
import multer from 'multer';
import ytdl from 'youtube-dl';
import path from 'path';

import db from '../models';


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'tmp'));
  },
});

const upload = multer({
  limits: { fieldSize: 20 * 1024 * 1024 },
  storage,
  fileFilter: (req, file, next) => {
    next(null, true);
  },
});

const getBarsFromMusic = filePath => new Promise((resolve, reject) => {
  const context = new AudioContext();
  const reader = new FileReader();
  reader.onload = async ({ target: { result } }) => {
    ffmpeg.ffprobe(filePath, (err, { format: { duration } }) => {
      if (err) {
        reject(err);
      }
      context.decodeAudioData(result, (buffer) => {
        const channel = buffer.getChannelData(0);
        const cut = Math.floor(channel.length / duration);
        const vals = [...Array(Math.floor(duration)).keys()]
          .map(second => [...Array(cut).keys()]
            .reduce((sum, now) => sum + Math.abs(channel[(second * cut) + now]), 0));

        const max = Math.max(...vals);
        const bars = vals.map(val => val / max);
        resolve(bars);
      });
    });
  };
  reader.readAsArrayBuffer(new File(filePath));
});

const getDuration = url => new Promise((resolve, reject) => {
  ytdl.getInfo(url, [], { maxBuffer: 1000 * 1024 }, (err, info = {}) => {
    if (err) {
      return reject(err);
    }
    const { duration = '' } = info;
    resolve(duration.split(':'));
  });
});

const getMp3 = (url, filePath) => new Promise((resolve, reject) => {
  ytdl.exec(url, ['-F'], { maxBuffer: 1000 * 1024 }, (err, list) => {
    if (err) {
      return reject(new Error('저작권 문제로 사용하실 수 없는 영상입니다. 죄송합니다.'));
    }
    const item = list.find(value => value.includes('audio only') && (value.includes('webm') || value.includes('mp4')));

    const num = item.split(' ')[0];
    const ystream = ytdl(url, ['-f', num], { maxBuffer: 1000 * 1024 });
    const fstream = fs.createWriteStream(filePath);
    const command = ffmpeg()
      .input(ystream)
      .format('mp3')
      .audioCodec('libmp3lame');
    const stream = command.pipe(fstream);
    stream.on('finish', () => {
      resolve('success');
    });
  });
});

const postMusic = async (req, res) => {
  const { file } = req;
  const filePath = path.join(__dirname, '..', '..', 'files', file.originalname);
  fs.moveSync(file.path, filePath, { overwrite: true });
  const data = await getBarsFromMusic(filePath);
  res.send({ data, message: 'success' });
};

const postMusicByYoutube = async (req, res) => {
  const { url } = req.body;
  const [vid] = url.split('=').splice(-1);
  const filePath = path.join(__dirname, '..', '..', 'files', `${vid}.mp3`);
  const music = await db.Music.findOne({ vid });
  if (music && fs.existsSync(filePath)) {
    res.send({ data: music.bars, message: 'success' });
    return;
  }
  const duration = await getDuration(url);
  if (duration.length >= 3 || (duration.length === 2 && duration[0] > 6)) {
    return res.send({ message: '6분 이내의 영상만 음원을 추출하실 수 있습니다.' });
  }
  try {
    await getMp3(url, filePath);
    const data = await getBarsFromMusic(filePath);
    await db.Music.create({
      vid,
      bars: data,
    });
    res.send({ data, message: 'success' });
  } catch ({ message }) {
    res.send({ message });
  }
};


export default {
  upload,
  postMusic,
  postMusicByYoutube,
};
