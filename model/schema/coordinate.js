import mongoose from 'mongoose'

const coordinateSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true
  },
  coordinates: {
    // Note: [longitude, latitude]
    type: [Number],
    required: true
  }
}, { _id: false })

export default coordinateSchema
