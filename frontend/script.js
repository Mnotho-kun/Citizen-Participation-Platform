// Function to handle login (example)
async function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
  
    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }
  
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' },
        });
  
        if (response.ok) {
            const userData = await response.json();
            localStorage.setItem('username', userData.username); // Save the username to localStorage
            window.location.href = 'index.html'; // Redirect to the main page
        } else {
            alert('Login failed. Please check your username or password.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again later.');
    }
  }
  
  // Ensure the username reflects across the page once the document is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    const storedUsername = localStorage.getItem('username');
  
    if (storedUsername) {
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
            usernameElement.textContent = storedUsername;
        }
  
        // Update the username in all posts (if any posts already exist in the DOM)
        const postUsernameElements = document.querySelectorAll('#posts .post-header h4');
        postUsernameElements.forEach(el => el.textContent = storedUsername);
    } else {
        console.warn('Username is not found in localStorage');
    }
  
    // Load user posts on profile page
    loadUserPosts();
  });
  
  // Event listener for creating a new post
  document.getElementById('post-btn').addEventListener('click', async () => {
    const caption = document.getElementById('caption').value.trim();
    const imageInput = document.getElementById('image');
    const imageFile = imageInput.files[0]; // Get the selected file
  
    // Check if caption or image is provided
    if (!caption && !imageFile) {
        alert('Please enter a caption or select an image to post.');
        return;
    }
  
    const formData = new FormData();
    if (caption) {
        formData.append('caption', caption);
    }
    if (imageFile) {
        formData.append('image', imageFile); // Append the image file
    }
  
    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData
        });
  
        if (response.ok) {
            const newPost = await response.json();
            displayPost(newPost); // Display the new post on the page
            savePostToProfile(newPost); // Save post data for profile
            document.getElementById('caption').value = ''; // Clear the caption input
            imageInput.value = ''; // Clear the image input
        } else {
            alert('Error creating post');
        }
    } catch (error) {
        console.error('Error:', error);
    }
  });
  
  // Function to display posts with comments section
  function displayPost(post) {
      const username = localStorage.getItem('username') || 'User Name'; // Retrieve the username from localStorage
      const postsSection = document.getElementById('posts');
  
      const postDiv = document.createElement('div');
      postDiv.className = 'post';
  
      postDiv.innerHTML = `
          <div class="post-header">
              <h4>${username}</h4>
              <p>${new Date(post.createdAt).toLocaleString()}</p>
          </div>
          <div class="post-body">
              ${post.caption ? `<p>${post.caption}</p>` : ''}
              ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post Image" class="post-img">` : ''}
          </div>
          <div class="post-footer">
              <i class="fa-regular fa-heart like-btn" title="Like" style="cursor: pointer; margin-right: 10px;"></i>
              <span class="like-count" style="margin-right: 10px; display: none;">1</span>
              <i class="fa-regular fa-comment comment-btn" title="Comment" style="cursor: pointer; margin-right: 10px;"></i>
              <i class="fa-regular fa-share-from-square share-btn" title="Share" style="cursor: pointer;"></i>
          </div>
  
          <!-- Comment section (hidden initially) -->
          <div class="comment-section" style="display: none;">
              <div class="comments-list"></div> <!-- Container to display comments -->
              <textarea class="comment-input" placeholder="Add a comment"></textarea>
              <button class="add-comment-btn">Add Comment</button>
          </div>
      `;
  
      postsSection.prepend(postDiv); // Add new post to the top
  
      // Add event listeners for post icons
      const likeIcon = postDiv.querySelector('.like-btn');
      const likeCount = postDiv.querySelector('.like-count');
      const commentIcon = postDiv.querySelector('.comment-btn');
      const commentSection = postDiv.querySelector('.comment-section');
      const addCommentBtn = postDiv.querySelector('.add-comment-btn');
      const commentInput = postDiv.querySelector('.comment-input');
      const commentsList = postDiv.querySelector('.comments-list');
  
      // Toggle comment section visibility on comment icon click
      commentIcon.addEventListener('click', () => {
          commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';
      });
  
      // Add a new comment
      addCommentBtn.addEventListener('click', () => {
          const commentText = commentInput.value.trim();
          if (commentText) {
              const commentDiv = document.createElement('div');
              commentDiv.className = 'comment';
              commentDiv.innerHTML = `
                  <strong>${username}</strong>: ${commentText}
              `;
              commentsList.appendChild(commentDiv); // Add new comment to the list
              commentInput.value = ''; // Clear the input
          } else {
              alert('Please enter a comment.');
          }
      });
  
      // Handle like toggle
      likeIcon.addEventListener('click', () => {
          toggleLike(likeIcon, likeCount);
      });
  
      // Share feature
      const shareIcon = postDiv.querySelector('.share-btn');
      shareIcon.addEventListener('click', () => {
          alert('Share feature is under construction!');
      });
  }
  
  // Like toggle function
  function toggleLike(likeIcon, likeCount) {
      if (!likeIcon.classList.contains('liked')) {
          likeIcon.classList.add('liked');
          likeIcon.classList.replace('fa-regular', 'fa-solid');
          likeIcon.style.color = 'red';
          likeCount.style.display = 'inline';
      } else {
          likeIcon.classList.remove('liked');
          likeIcon.classList.replace('fa-solid', 'fa-regular');
          likeIcon.style.color = '';
          likeCount.style.display = 'none';
      }
  }
  
  // Save post to user profile page
  function savePostToProfile(post) {
    const userPosts = JSON.parse(localStorage.getItem('userPosts')) || [];
    userPosts.push(post);
    localStorage.setItem('userPosts', JSON.stringify(userPosts));
  }
  
  // Load and display user posts on profile page with delete functionality
  function loadUserPosts() {
      const userPosts = JSON.parse(localStorage.getItem('userPosts')) || [];
      const userPostsSection = document.getElementById('user-posts');
  
      userPosts.forEach(post => {
          const postItem = document.createElement('div');
          postItem.className = 'post-item';
          postItem.innerHTML = `
              ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post Image" class="profile-post-img">` : ''}
              <p>${post.caption}</p>
              <i class="fa-solid fa-x delete-btn" title="Delete" style="cursor: pointer; float: right; color: #FF6B6B;"></i>
          `;
  
          // Add delete button functionality
          const deleteBtn = postItem.querySelector('.delete-btn');
          deleteBtn.addEventListener('click', () => {
              deletePost(post, postItem);
          });
  
          userPostsSection.prepend(postItem);
      });
  }
  
  // Function to delete a post
  function deletePost(post, postElement) {
      if (confirm('Are you sure you want to delete this post?')) {
          let userPosts = JSON.parse(localStorage.getItem('userPosts')) || [];
          userPosts = userPosts.filter(savedPost => savedPost.createdAt !== post.createdAt);
          localStorage.setItem('userPosts', JSON.stringify(userPosts));
          postElement.remove();
      }
  }
  
  // Event listener for file input change (profile image update)
  document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const profileImage = document.getElementById('profile-img');
  
    if (file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImage.src = e.target.result;
            };
            reader.onerror = function() {
                console.error('Error reading the file');
            };
            reader.readAsDataURL(file);
        } else {
            console.error('Please select a valid image file');
        }
    } else {
        console.warn('No file selected');
    }
  });
  
  // Detect unsaved changes and prompt before exiting
  window.addEventListener('beforeunload', (event) => {
    const unsavedCaption = document.getElementById('caption').value.trim();
    const unsavedImage = document.getElementById('image').files[0];
  
    if (unsavedCaption || unsavedImage) {
        event.preventDefault();
        event.returnValue = '';
    }
  });
  

// Handle form submission and save changes
document.getElementById('edit-profile-form').addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent default form submission
  unsavedChanges = false; // Reset the unsaved changes flag

  const newUsername = document.getElementById('new-username').value;
  const newBio = document.getElementById('new-bio').value;

  // Save changes to localStorage or send to the server as needed
  localStorage.setItem('username', newUsername);
  // Here you would also typically send the newBio to your server

  alert('Changes saved successfully!'); // Confirm to the user
});

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active'); // Toggle active class to show/hide nav links
    hamburger.innerHTML = navLinks.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' // Change to close icon
        : '<i class="fas fa-bars"></i>'; // Change back to hamburger icon
});

// Function to toggle search bar visibility
const searchIcon = document.getElementById('search-icon');
const searchBar = document.getElementById('search-bar');

searchIcon.addEventListener('click', () => {
    if (searchBar.style.display === 'none' || searchBar.style.display === '') {
        searchBar.style.display = 'block'; // Show the search bar
        searchBar.focus(); // Automatically focus on the search bar
    } else {
        searchBar.style.display = 'none'; // Hide the search bar
    }
});

// Function to toggle menu visibility
function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
}

