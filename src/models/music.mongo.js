import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  vid: { type: String },
  title: { type: String },
  bars: [{ type: Number }],
  date: { type: Date, default: Date.now },
});

export default schema;
