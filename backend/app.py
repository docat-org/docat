"""
docat
~~~~~

Host your docs. Simple. Versioned. Fancy.

:copyright: (c) 2019 by docat, https://github.com/randombenj/docat
:license: MIT, see LICENSE for more details.
"""

import tempfile
from http import HTTPStatus
from pathlib import Path
from subprocess import run
from zipfile import ZipFile

from werkzeug.utils import secure_filename

from flask import Flask, render_template, request

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "/var/docat/doc"
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB


@app.route("/api/<project>/<version>", methods=["POST"])
def upload(project, version):
    if "file" not in request.files:
        return {"message": "No file part in the request"}, HTTPStatus.BAD_REQUEST

    uploaded_file = request.files["file"]
    if uploaded_file.filename == "":
        return {"message": "No file selected for uploading"}, HTTPStatus.BAD_REQUEST

    filename = secure_filename(uploaded_file.filename)
    file_ext = filename.rsplit(".", 1)[1].lower()
    project_base_path = Path(app.config["UPLOAD_FOLDER"]) / project
    base_path = project_base_path / version

    # ensure directory for the uploaded doc exists
    base_path.mkdir(parents=True, exist_ok=True)

    if file_ext == "zip":
        with tempfile.TemporaryDirectory() as temp_dir:
            zip_path = Path(temp_dir) / filename
            uploaded_file.save(str(zip_path))

            with ZipFile(zip_path, "r") as zipf:
                zipf.extractall(path=base_path)
    else:
        uploaded_file.save(str(base_path / filename))

    # ensure nginx config
    nginx_location = Path("/etc/nginx/locations.d")
    nginx_config = nginx_location / f"{project}-doc.conf"
    if not nginx_config.exists():
        out_parsed_template = render_template(
            "nginx-doc.conf", project=project, dir_path=str(project_base_path)
        )
        with nginx_config.open("w") as f:
            f.write(out_parsed_template)

        run(["sudo", "nginx", "-s" "reload"])

    return {"message": "File successfully uploaded"}, HTTPStatus.CREATED


@app.route("/api/<project>/<version>/tags/<new_tag>", methods=["PUT"])
def tag(project, version, new_tag):
    src = version
    dst = Path(app.config["UPLOAD_FOLDER"]) / project / new_tag

    if dst.exists():
        dst.symlink_to(src)

    msg = f"Tag {new_tag} -> {version} successfully created"
    return {"message": msg}, HTTPStatus.CREATED
