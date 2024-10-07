// backend/models/Post.js

const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Post', PostSchema);
