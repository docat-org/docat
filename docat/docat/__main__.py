import os

from docat.app import app

if __name__ == "__main__":
    try:
        port = int(os.environ.get("PORT", 5000))
    except ValueError:
        port = 5000

    app.run("0.0.0.0", port=port)
