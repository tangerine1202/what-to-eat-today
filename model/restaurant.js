import mongoose from 'mongoose'
import coordinateSchema from './schema/coordinate.js'

const RestaurantSchema = new mongoose.Schema({
  place_id: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: coordinateSchema,
    required: true
  },
  photo_url: {
    type: String,
    required: false
  },
  photo_attribution: {
    type: String,
    required: false
  },
  created_at: {
    type: Number
  },
  updated_at: {
    type: Number
  }
}, {
  strict: 'throw',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

RestaurantSchema.index({ place_id: 1 }, { unique: true })
RestaurantSchema.index({ location: '2dsphere' })

export default mongoose.model('Restaurant', RestaurantSchema)
