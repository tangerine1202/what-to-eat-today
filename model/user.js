import mongoose from 'mongoose'
import coordinateSchema from './schema/coordinate.js'

const restaurant = new mongoose.Schema({
  place_id: {
    type: String,
    required: true
  },
  custom_name: {
    type: String,
    required: true
  }
})

const UserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  picture_url: {
    type: String,
    required: true
  },
  join_code: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: coordinateSchema,
    required: true
  },
  restaurants: {
    type: [restaurant],
    required: true
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

UserSchema.index({ user_id: 1 }, { unique: true })
UserSchema.index({ join_code: 1 })
UserSchema.index({ restaurants: 1 })

export default mongoose.model('User', UserSchema)
