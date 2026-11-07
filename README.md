# IT4200-Best-Group

## Running the app

The frontend needs the class API running, so start that first.

1. Start the API from the class API repo (`2026-IT4200-Fall`). It runs on port 8000:

   ```sh
   cd 2026-IT4200-Fall
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   python app.py
   ```

   After that, just activate the venv and run `python app.py`.
2. In a second terminal, go to the frontend folder and install dependencies:

   ```sh
   cd IT4200-Best-Group/frontend
   npm install
   ```
3. Start the frontend:

   ```sh
   npm run dev
   ```
4. Open http://localhost:5173 in your browser.

See [frontend/README.md](frontend/README.md) for how the games work and how to add a new one.
