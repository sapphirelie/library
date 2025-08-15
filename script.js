document.addEventListener('DOMContentLoaded', function() {
    // View Management
    const libraryView = document.getElementById('library-view');
    const backstageView = document.getElementById('backstage-view');
    const viewLibraryBtn = document.getElementById('view-library-btn');
    const viewBackstageBtn = document.getElementById('view-backstage-btn');
    
    viewLibraryBtn.addEventListener('click', () => {
        libraryView.classList.add('active-view');
        backstageView.classList.remove('active-view');
        renderBookshelf();
    });
    
    viewBackstageBtn.addEventListener('click', () => {
        libraryView.classList.remove('active-view');
        backstageView.classList.add('active-view');
        renderUploadedBooksList();
    });
    
    // Sample books data (in a real app, this would come from a database)
    let books = [
        {
            id: '1',
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            description: 'A story of wealth, love, and the American Dream in the 1920s.',
            coverUrl: 'https://m.media-amazon.com/images/I/71FTb9X6wsL._AC_UF1000,1000_QL80_.jpg',
            pdfUrl: 'sample.pdf' // In a real app, this would be the path to your PDF
        },
        {
            id: '2',
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            description: 'A powerful story of racial injustice and moral growth in the American South.',
            coverUrl: '',
            pdfUrl: 'sample.pdf'
        },
        {
            id: '3',
            title: '1984',
            author: 'George Orwell',
            description: 'A dystopian novel about totalitarianism, mass surveillance, and thought control.',
            coverUrl: 'https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg',
            pdfUrl: 'sample.pdf'
        }
    ];
    
    // PDF Viewer Modal
    const pdfModal = document.getElementById('pdf-modal');
    const pdfViewer = document.getElementById('pdf-viewer');
    const closeBtn = document.querySelector('.close-btn');
    
    function openPdfViewer(pdfUrl) {
        pdfViewer.src = pdfUrl;
        pdfModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    closeBtn.addEventListener('click', () => {
        pdfModal.style.display = 'none';
        pdfViewer.src = '';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === pdfModal) {
            pdfModal.style.display = 'none';
            pdfViewer.src = '';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Bookshelf Rendering
    function renderBookshelf(filter = '') {
        const bookshelf = document.getElementById('bookshelf');
        bookshelf.innerHTML = '';
        
        const filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(filter.toLowerCase()) || 
            book.author.toLowerCase().includes(filter.toLowerCase())
        );
        
        if (filteredBooks.length === 0) {
            bookshelf.innerHTML = '<p class="no-books">No books found. Try a different search.</p>';
            return;
        }
        
        filteredBooks.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.className = 'book';
            bookElement.innerHTML = `
                <div class="book-cover">
                    ${book.coverUrl ? 
                        `<img src="${book.coverUrl}" alt="${book.title}">` : 
                        `<div class="default-cover">${book.title.charAt(0)}</div>`
                    }
                </div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="description">${book.description.substring(0, 60)}...</p>
                </div>
            `;
            
            bookElement.addEventListener('click', () => {
                openPdfViewer(book.pdfUrl);
            });
            
            bookshelf.appendChild(bookElement);
        });
    }
    
    // Search Functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    searchBtn.addEventListener('click', () => {
        renderBookshelf(searchInput.value);
    });
    
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            renderBookshelf(searchInput.value);
        }
    });
    
    // Book Upload Form
    const bookUploadForm = document.getElementById('book-upload-form');
    
    bookUploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('book-title').value;
        const description = document.getElementById('book-description').value;
        const coverFile = document.getElementById('book-cover').files[0];
        const pdfFile = document.getElementById('book-file').files[0];
        
        if (!pdfFile) {
            alert('Please upload a PDF file');
            return;
        }
        
        // In a real app, you would upload the files to a server here
        // For this demo, we'll just create a URL for the cover image if provided
        let coverUrl = '';
        if (coverFile) {
            coverUrl = URL.createObjectURL(coverFile);
        }
        
        // Create a URL for the PDF file
        const pdfUrl = URL.createObjectURL(pdfFile);
        
        // Add the new book to our collection
        const newBook = {
            id: Date.now().toString(),
            title,
            description,
            coverUrl,
            pdfUrl
        };
        
        books.push(newBook);
        
        // Reset the form
        bookUploadForm.reset();
        
        // Show success message
        alert('Book uploaded successfully!');
        
        // Update the uploaded books list
        renderUploadedBooksList();
    });
    
    // Render Uploaded Books List in Backstage
    function renderUploadedBooksList() {
        const uploadedBooksList = document.getElementById('uploaded-books-list');
        uploadedBooksList.innerHTML = '';
        
        if (books.length === 0) {
            uploadedBooksList.innerHTML = '<p>No books uploaded yet.</p>';
            return;
        }
        
        books.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.className = 'uploaded-book-item';
            bookItem.innerHTML = `
                <div class="book-meta">
                    <h4>${book.title}</h4>
                    <p>by ${book.author}</p>
                </div>
                <div class="book-actions">
                    <button class="delete-btn" data-id="${book.id}">Delete</button>
                </div>
            `;
            
            uploadedBooksList.appendChild(bookItem);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const bookId = this.getAttribute('data-id');
                deleteBook(bookId);
            });
        });
    }
    
    // Delete Book Function
    function deleteBook(bookId) {
        if (confirm('Are you sure you want to delete this book?')) {
            books = books.filter(book => book.id !== bookId);
            renderUploadedBooksList();
            
            // If we're on the library view, update that too
            if (libraryView.classList.contains('active-view')) {
                renderBookshelf();
            }
        }
    }
    
    // Initialize the page
    renderBookshelf();
});