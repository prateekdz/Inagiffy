Assets folder for screenshots and gifs

Place repository screenshots under `assets/screenshots/` and short demo GIFs under `assets/gifs/`.

Recommended workflow:

1. Capture screenshots (PNG) or short GIFs (3-6s).
2. Optimize images (TinyPNG, Squoosh, or similar).
3. Name files descriptively, e.g. `screenshot-home-1200x720.png` or `demo-pan-zoom.gif`.
4. Reference them in README.md using relative paths, for example:

   ```markdown
   ![Overview](assets/screenshots/screenshot-home-1200x720.png)
   ```

If you want placeholder images added automatically, tell me which screens you want (home, minimap, tooltip, export flow) and I can generate simple annotated placeholders for you to replace.

Quick copy from your Downloads (PowerShell)

If you'd prefer Create React App to serve the image (recommended), copy the file into the frontend `public/assets/` folder. Run this from the project root (PowerShell):

```powershell
# adjust the source filename if it differs
Copy-Item -Path "C:\Users\$env:USERNAME\Downloads\pexels-katlego-mongatane-274855333-12904989.jpg" -Destination ".\frontend\public\assets\pexels-katlego-mongatane-274855333-12904989.jpg"
```

If you already copied the file to `assets/screenshots/` earlier, move it instead:

```powershell
Move-Item -Path ".\assets\screenshots\pexels-katlego-mongatane-274855333-12904989.jpg" -Destination ".\frontend\public\assets\pexels-katlego-mongatane-274855333-12904989.jpg"
```

After copying/moving the file, CRA will serve it at `/assets/pexels-katlego-mongatane-274855333-12904989.jpg` and the app CSS is already configured to use that path. Restart the dev server if it was running.