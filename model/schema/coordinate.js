import mongoose from 'mongoose'

const coordinateSchema = new mongoose.Schema({
  coordinates: {
    type: [Number],
    required: true
  }
})

export default coordinateSchema
