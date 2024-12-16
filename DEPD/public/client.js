let currentUser = 'User'; // Nanti bisa diganti dengan sistem login yang sebenarnya

async function createPost() {
    const postContent = document.getElementById('post-content');
    const content = postContent.value.trim();

    if (content === '') return;

    try {
        const response = await fetch('/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: content,
                author: currentUser
            })
        });

        const newPost = await response.json();
        displayPost(newPost);
        postContent.value = ''; // Bersihkan input
    } catch (error) {
        console.error('Error creating post:', error);
    }
}

function clearInput() {
    document.getElementById('post-content').value = '';
}

async function loadPosts() {
    try {
        const response = await fetch('/posts', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Response not OK:', response.status, response.statusText);
            throw new Error('Network response was not ok');
        }

        const posts = await response.json();
        console.log('Fetched posts:', posts);

        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = ''; // Clear previous posts

        posts.forEach(displayPost);
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function displayPost(post) {
    const postsContainer = document.getElementById('posts-container');
    const postElement = document.createElement('div');
    postElement.classList.add('post');
    postElement.dataset.postId = post._id;

    postElement.innerHTML = `
        <div class="post-header">
            <img src="user.png" alt="User">
            <span class="author">${post.author}</span>
            <button class="delete-post-btn" onclick="deletePost('${post._id}')">Delete</button>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="replies-container">
            ${post.replies.map(reply => `
                <div class="reply">
                    <img src="user.png" alt="User">
                    <span class="reply-author">${reply.author}</span>
                    <span class="reply-content">${reply.content}</span>
                </div>
            `).join('')}
        </div>
        <div class="reply-input">
            <input type="text" placeholder="Reply to this post" class="reply-text">
            <button onclick="addReply('${post._id}')">Reply</button>
        </div>
    `;

    postsContainer.prepend(postElement);
}

async function addReply(postId) {
    const replyInput = document.querySelector(`.post[data-post-id="${postId}"] .reply-text`);
    const replyContent = replyInput.value.trim();

    if (replyContent === '') return;

    try {
        const response = await fetch(`/posts/${postId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: replyContent,
                author: currentUser
            })
        });

        const updatedPost = await response.json();
        updatePostReplies(updatedPost);
        replyInput.value = ''; // Bersihkan input
    } catch (error) {
        console.error('Error adding reply:', error);
    }
}

function updatePostReplies(post) {
    const postElement = document.querySelector(`.post[data-post-id="${post._id}"] .replies-container`);
    postElement.innerHTML = post.replies.map(reply => `
        <div class="reply">
            <img src="user.png" alt="User">
            <span class="reply-author">${reply.author}</span>
            <span class="reply-content">${reply.content}</span>
        </div>
    `).join('');
}

async function deletePost(postId) {
    try {
        await fetch(`/posts/${postId}`, { method: 'DELETE' });
        const postElement = document.querySelector(`.post[data-post-id="${postId}"]`);
        postElement.remove();
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}

// Event listeners for buttons in index.html
document.addEventListener('DOMContentLoaded', () => {
    // Load posts when page loads
    loadPosts();

    // Add event listener for post button
    const postBtn = document.querySelector('.post-btn');
    const postInput = document.querySelector('.post-input input');

    if (postBtn && postInput) {
        postBtn.addEventListener('click', () => {
            console.log('Post button clicked'); // Debug: Pastikan event listener bekerja
            document.getElementById('post-content').value = postInput.value;
            createPost();
        });

        // Add delete button functionality
        const deleteBtn = document.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', clearInput);
        }
    } else {
        console.error('Post button or input not found');
    }
});

function createPost() {
    const postContent = document.getElementById('post-content');
    const content = postContent.value.trim();

    console.log('Creating post with content:', content); // Debug: Cek isi konten

    if (content === '') {
        console.log('Empty content, not posting');
        return;
    }

    // ... rest of the existing createPost function
}