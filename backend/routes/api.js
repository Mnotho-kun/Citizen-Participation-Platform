// backend/routes/api.js

const express = require('express');
const Post = require('../models/Post');
const router = express.Router();

// Get all posts
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new post
router.post('/posts', async (req, res) => {
    const post = new Post({
        image: req.body.image,
        description: req.body.description
    });
    try {
        const newPost = await post.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
