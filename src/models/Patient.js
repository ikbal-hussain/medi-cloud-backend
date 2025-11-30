import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  type: {
    type: String,
    enum: ['OPD', 'IPD'],
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  admissionDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Discharged'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Patient', patientSchema);

