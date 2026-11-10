# IT4200-Best-Group

## Running the app

The frontend uses the class API hosted at
https://two026-it4200-fall.onrender.com, so you don't need to run the backend
yourself.

1. Go to the frontend folder and install dependencies:

   ```sh
   cd IT4200-Best-Group/frontend
   npm install
   ```
2. Start the frontend:

   ```sh
   npm run dev
   ```
3. Open http://localhost:5173 in your browser.

The hosted API goes to sleep when nobody is using it, so the first request
after a while can take up to a minute.

### Using a local copy of the API instead

If you're changing the API, run it locally from the class API repo
(`2026-IT4200-Fall`) and point the frontend at it:

```sh
cd 2026-IT4200-Fall
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Then, in a second terminal:

```sh
cd IT4200-Best-Group/frontend
API_TARGET=http://localhost:8000 npm run dev
```

## Deployment

Every push to `main` builds the frontend and publishes it to GitHub Pages at
https://dason-janda.github.io/IT4200-Best-Group/ (see
[.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)). You
can also run it by hand from the repo's **Actions** tab.

The deployed site calls the API directly from the browser, so the API has to
allow cross-origin (CORS) requests.

See [frontend/README.md](frontend/README.md) for how the games work and how to add a new one.
