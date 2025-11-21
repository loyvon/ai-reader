import pickle
import sys
from reader3 import Book, BookMetadata, ChapterContent, TOCEntry

book_path = sys.argv[1] if len(sys.argv) > 1 else 'books/Evicted/book.pkl'

with open(book_path, 'rb') as f:
    book = pickle.load(f)
    print(f"Cover image: {book.cover_image}")
    print(f"\nFirst few spine items:")
    for i, item in enumerate(book.spine[:3]):
        print(f"  {i}: {item.href}")
