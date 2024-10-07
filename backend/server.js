const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt'); // For password hashing
const session = require('express-session'); // For session management
const { exec } = require('child_process'); // For opening the browser

dotenv.config();

const app = express();
app.use(express.json()); // To parse JSON body
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data
// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Session setup
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/'); // Ensure 'images/' directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save with a unique name
    }
});
const upload = multer({ storage: storage });

// Mongoose User model
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true } // Optional email field
});
const User = mongoose.model('User', UserSchema);

// Mongoose Post model
const PostSchema = new mongoose.Schema({
    caption: String,
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', PostSchema);

app.use(express.static('frontend'));
app.use('/images', express.static('images'));

// Signup route
app.post('/api/signup', async (req, res) => {
    const { username, password, email } = req.body; // Now accepting email as well
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();
        res.status(201).json({ message: 'User created' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Error during signup' });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id; // Store user ID in session
            res.status(200).json({ message: 'Logged in', username: user.username });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

// Handle post creation (with image upload)
app.post('/api/posts', upload.single('image'), async (req, res) => {
    try {
        const newPost = new Post({
            caption: req.body.caption || '',
            imageUrl: req.file ? `/images/${req.file.filename}` : null
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post', error });
    }
});

// Fetch profile data for the logged-in user
app.get('/api/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ username: user.username, email: user.email });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Serve profile page
app.get('/profile', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login.html'); // Redirect to login if not authenticated
    }
    res.sendFile(path.join(__dirname, '..', 'frontend', 'profile.html')); // Serve profile.html
});

// Serve index page (homepage)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')); // Serve index.html
});

// Serve sign-up page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});


// Serve PetitionPage.html
app.get('/petition', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'PetitionPage.html'));
});

// Serve edit-profile page
app.get('/edit-profile', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login.html'); // Redirect to login if not authenticated
    }
    res.sendFile(path.join(__dirname, '..', 'frontend', 'edit-profile.html')); // Serve edit-profile.html
});

// Start the server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(3000, () => {
            console.log('Server started on port 3000');
            // Open the signup page in the default browser
            exec('start http://localhost:3000/signup'); // For Windows
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
