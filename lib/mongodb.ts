import mongoose from 'mongoose';

declare global {
  var mongoose: any;
}

let MONGODB_URI: string;

function getMongoURI() {
  if (!MONGODB_URI) {
    MONGODB_URI = process.env.MONGODB_URI!;
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }
  }
  return MONGODB_URI;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(getMongoURI(), {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;