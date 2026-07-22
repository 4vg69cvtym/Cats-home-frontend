import { useState, useEffect } from 'react';
import './BookShelf.css';

function BookShelf({ onSelectBook, onBack }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const res = await fetch(`${API_URL}/books`);
      const data = await res.json();
      setBooks(data);
    } catch (e) {
      console.error('加载书架失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target.result;
        // 按章节分割（以"第"开头或"章节"为标志）
        const chapters = content.split(/\n(?=第.*章|\d+\.\s)/).filter(c => c.trim());
        
        const res = await fetch(`${API_URL}/books`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: file.name.replace(/\.[^.]+$/, ''),
            content: content,
            chapters: chapters
          })
        });
        const newBook = await res.json();
        setBooks(prev => [newBook, ...prev]);
      } catch (e) {
        alert('上传失败：' + e.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  if (loading) {
    return <div className="book-shelf-loading">📚 书架加载中...</div>;
  }

  return (
    <div className="book-shelf">
      <div className="book-shelf-header">
        <button className="back-btn" onClick={onBack}>← 返回聊天</button>
        <h2>📚 我们的书架</h2>
        <label className="upload-btn">
          📤 上传书籍
          <input type="file" accept=".txt" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>

      <div className="book-grid">
        {books.length === 0 ? (
          <div className="empty-books">
            <p>📖 书架还空空的</p >
            <p className="empty-hint">上传一本小说，和小克一起读吧</p >
          </div>
        ) : (
          books.map(book => (
            <div key={book.id} className="book-card" onClick={() => onSelectBook(book)}>
              <div className="book-cover">📖</div>
              <div className="book-title">{book.title}</div>
              <div className="book-meta">
                {book.chapters?.length || 0} 章
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BookShelf;
