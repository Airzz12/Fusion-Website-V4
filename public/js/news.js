document.addEventListener('DOMContentLoaded', function() {
    const newsGrid = document.querySelector('.news-grid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let currentPage = 1;
    const itemsPerPage = 4;

    loadMoreBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(`/news/load-more?page=${currentPage + 1}`);
            const data = await response.json();
            
            if (data.news.length > 0) {
                data.news.forEach(item => {
                    const newsItem = createNewsItem(item);
                    newsGrid.appendChild(newsItem);
                });
                currentPage++;
                
                // Hide button if no more items
                if (data.news.length < itemsPerPage) {
                    loadMoreBtn.style.display = 'none';
                }
            } else {
                loadMoreBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading more news:', error);
        }
    });

    function createNewsItem(item) {
        const div = document.createElement('div');
        div.className = 'news-item';
        div.innerHTML = `
            <div class="news-image">
                <img src="${item.image}" alt="${item.title}">
                <div class="news-category">${item.category}</div>
            </div>
            <div class="news-content">
                <div class="news-meta">
                    <span class="news-date"><i class="far fa-calendar"></i> ${item.date}</span>
                    <span class="news-author"><i class="far fa-user"></i> ${item.author}</span>
                </div>
                <h2>${item.title}</h2>
                <p>${item.description}</p>
                <a href="/news/${item.id}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
        return div;
    }
}); 