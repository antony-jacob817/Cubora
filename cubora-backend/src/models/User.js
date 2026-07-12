const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  about: {
    type: String,
    default: 'Speedcuber',
    maxlength: [30, 'About bio cannot exceed 30 characters']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Do not return password by default in queries
  },
  role: {
    type: String,
    enum: ['user', 'pro', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  name_updated_at: {
    type: Date,
    default: null
  },
  name_update_history: {
    type: [Date],
    default: []
  },
  username_update_history: {
    type: [Date],
    default: []
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  elo: {
    type: Number,
    default: 1200
  },
  friends: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
});

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function() {
  if (!this.username) {
    this.username = this.email.split('@')[0].toLowerCase();
  }
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);