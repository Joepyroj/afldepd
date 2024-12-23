document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('commentForm');
    const commentsContainer = document.getElementById('commentsContainer');
    const commentInput = document.getElementById('commentInput');
    const overlay = document.getElementById('overlay');
    const deleteConfirm = document.getElementById('deleteConfirm');
    let commentToDelete = null;

    // Function to create a unique ID for each comment
    function generateCommentId() {
        return 'comment-' + Date.now();
    }

    // Function to create the edit form
    function createEditForm(commentId, currentText) {
        const editForm = document.createElement('form');
        editForm.className = 'edit-form';
        editForm.id = `edit-form-${commentId}`;
        editForm.innerHTML = `
            <textarea required>${currentText}</textarea>
            <div class="edit-form-buttons">
                <button type="submit">Save</button>
                <button type="button" onclick="cancelEdit('${commentId}')">Cancel</button>
            </div>
        `;
        return editForm;
    }

    // Function to create reply form
    function createReplyForm(parentId) {
        const replyForm = document.createElement('form');
        replyForm.className = 'reply-form';
        replyForm.id = `reply-form-${parentId}`;
        replyForm.innerHTML = `
            <div class="reply-form-content">
                <div class="reply-input-wrapper">
                    <div class="comment-avatar">
                        <img src="/api/placeholder/50/50">
                    </div>
                    <textarea required placeholder="Write a reply..."></textarea>
                </div>
                <div class="reply-form-buttons">
                    <button type="submit">Reply</button>
                    <button type="button" class="cancel-reply">Cancel</button>
                </div>
            </div>
        `;
        return replyForm;
    }

    // Function to handle reply action
    window.replyToComment = function (commentId) {
        // Remove any existing reply forms
        const existingForms = document.querySelectorAll('.reply-form');
        existingForms.forEach(form => form.remove());

        const comment = document.getElementById(commentId);
        const replyForm = createReplyForm(commentId);

        // Create or get replies container
        let repliesContainer = comment.querySelector('.replies');
        if (!repliesContainer) {
            repliesContainer = document.createElement('div');
            repliesContainer.className = 'replies';
            comment.appendChild(repliesContainer);
        }

        // Insert reply form at the beginning of replies container
        repliesContainer.insertBefore(replyForm, repliesContainer.firstChild);

        // Handle reply form submission
        replyForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const replyText = this.querySelector('textarea').value.trim();

            if (replyText) {
                const replyId = generateCommentId();
                const newReply = document.createElement('div');
                newReply.className = 'comment reply';
                newReply.id = replyId;

                newReply.innerHTML = `
                    <div class="comment-avatar">
                        <img src="/api/placeholder/50/50">
                    </div>
                    <div class="comment-box">
                        <div class="comment-text">
                            ${replyText}
                        </div>
                        <div class="comment-footer">
                            <div class="comment-info">
                                <span class="comment-date">
                                    ${new Date().toLocaleString()}
                                </span>
                            </div>
                            <div class="comment-actions">
                                <a onclick="editComment('${replyId}')">Edit</a>
                                <a onclick="deleteComment('${replyId}')">Delete</a>
                                <a onclick="replyToComment('${replyId}')">Reply</a>
                            </div>
                        </div>
                    </div>
                `;

                repliesContainer.appendChild(newReply);
                replyForm.remove();
            }
        });

        // Handle cancel button
        replyForm.querySelector('.cancel-reply').addEventListener('click', function () {
            replyForm.remove();
        });
    };

    // Function to handle edit action
    window.editComment = function (commentId) {
        const comment = document.getElementById(commentId);
        const commentText = comment.querySelector('.comment-text');
        const currentText = commentText.textContent.trim();
        const editForm = createEditForm(commentId, currentText);

        commentText.style.display = 'none';
        comment.querySelector('.comment-box').insertBefore(editForm, commentText);
        editForm.style.display = 'block';

        editForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const newText = editForm.querySelector('textarea').value.trim();
            if (newText) {
                commentText.textContent = newText;
                commentText.style.display = 'block';
                editForm.remove();
            }
        });
    };

    // Function to cancel edit
    window.cancelEdit = function (commentId) {
        const comment = document.getElementById(commentId);
        const editForm = comment.querySelector('.edit-form');
        const commentText = comment.querySelector('.comment-text');

        editForm.remove();
        commentText.style.display = 'block';
    };

    // Function to show delete confirmation
    window.deleteComment = function (commentId) {
        commentToDelete = document.getElementById(commentId);
        overlay.style.display = 'block';
        deleteConfirm.style.display = 'block';
    };

    // Handle delete confirmation
    document.getElementById('confirmDelete').addEventListener('click', function () {
        if (commentToDelete) {
            commentToDelete.remove();
            commentToDelete = null;
        }
        overlay.style.display = 'none';
        deleteConfirm.style.display = 'none';
    });

    // Handle delete cancellation
    document.getElementById('cancelDelete').addEventListener('click', function () {
        commentToDelete = null;
        overlay.style.display = 'none';
        deleteConfirm.style.display = 'none';
    });

    // Add submit event listener to the form
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const commentText = commentInput.value;

        if (commentText.trim()) {
            const commentId = generateCommentId();
            const newComment = document.createElement('div');
            newComment.className = 'comment';
            newComment.id = commentId;

            newComment.innerHTML = `
                <div class="comment-avatar">
                    <img src="/api/placeholder/50/50">
                </div>
                <div class="comment-box">
                    <div class="comment-text">
                        ${commentText}
                    </div>
                    <div class="comment-footer">
                        <div class="comment-info">
                            <span class="comment-date">
                                ${new Date().toLocaleString()}
                            </span>
                        </div>
                        <div class="comment-actions">
                            <a onclick="editComment('${commentId}')">Edit</a>
                            <a onclick="deleteComment('${commentId}')">Delete</a>
                            <a onclick="replyToComment('${commentId}')">Reply</a>
                        </div>
                    </div>
                </div>
            `;

            commentsContainer.appendChild(newComment);
            commentInput.value = '';
        }
    });
});
