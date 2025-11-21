import sys
import ebooklib
from ebooklib import epub

if len(sys.argv) < 2:
    print("Usage: python list_epub_images.py <epub_file>")
    sys.exit(1)

epub_file = sys.argv[1]
book = epub.read_epub(epub_file)

print("All images (ITEM_IMAGE type):")
print("-" * 60)
for item in book.get_items():
    if item.get_type() == ebooklib.ITEM_IMAGE:
        print(f"  {item.get_name()}")
        print(f"    Size: {len(item.get_content())} bytes")

print("\n" + "=" * 60)
print("All items with image extensions:")
print("-" * 60)
for item in book.get_items():
    name = item.get_name().lower()
    if name.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg')):
        print(f"  {item.get_name()}")
        print(f"    Type: {item.get_type()}")
        print(f"    Size: {len(item.get_content())} bytes")

print("\n" + "=" * 60)
print("COVER type items:")
print("-" * 60)
for item in book.get_items():
    if item.get_type() == ebooklib.ITEM_COVER:
        print(f"  {item.get_name()}")
        print(f"    Size: {len(item.get_content())} bytes")
