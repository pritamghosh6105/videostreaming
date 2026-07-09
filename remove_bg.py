import os
from PIL import Image

def remove_background(image_path, output_path):
    print(f"Opening image: {image_path}")
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # Check if the pixel is close to white/off-white (e.g., R, G, B > 240)
        # The waving robot has colors, but the background is solid off-white
        if item[0] > 230 and item[1] > 235 and item[2] > 235:
            new_data.append((255, 255, 255, 0))  # Make it transparent
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved transparent image to: {output_path}")

if __name__ == "__main__":
    src = r"e:\drive\Pritam\OneDrive\Desktop\video streaming\client\public\ai-avatar.png"
    if os.path.exists(src):
        remove_background(src, src)
    else:
        print(f"Source file not found at: {src}")
