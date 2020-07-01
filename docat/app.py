"""
docat
~~~~~

Host your docs. Simple. Versioned. Fancy.

:copyright: (c) 2019 by docat, https://github.com/randombenj/docat
:license: MIT, see LICENSE for more details.
"""

import os
from http import HTTPStatus
from pathlib import Path

from flask import Flask, request, send_from_directory
from werkzeug.utils import secure_filename

from docat.docat.utils import create_nginx_config, create_symlink, extract_archive

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "/var/docat/doc"
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024  # 100M


@app.route("/api/<project>/<version>", methods=["POST"])
def upload(project, version):
    if "file" not in request.files:
        return {"message": "No file part in the request"}, HTTPStatus.BAD_REQUEST

    uploaded_file = request.files["file"]
    if uploaded_file.filename == "":
        return {"message": "No file selected for uploading"}, HTTPStatus.BAD_REQUEST

    project_base_path = Path(app.config["UPLOAD_FOLDER"]) / project
    base_path = project_base_path / version
    target_file = base_path / secure_filename(uploaded_file.filename)

    # ensure directory for the uploaded doc exists
    base_path.mkdir(parents=True, exist_ok=True)

    # save the upploaded documentation
    uploaded_file.save(str(target_file))
    extract_archive(target_file, base_path)

    create_nginx_config(project, project_base_path)

    return {"message": "File successfully uploaded"}, HTTPStatus.CREATED


@app.route("/api/<project>/<version>/tags/<new_tag>", methods=["PUT"])
def tag(project, version, new_tag):
    source = version
    destination = Path(app.config["UPLOAD_FOLDER"]) / project / new_tag

    if create_symlink(source, destination):
        return (
            {"message": f"Tag {new_tag} -> {version} successfully created"},
            HTTPStatus.CREATED,
        )
    else:
        return (
            {"message": f"Tag {new_tag} would overwrite an existing version!"},
            HTTPStatus.CONFLICT,
        )


# serve_local_docs for local testing without a nginx
if os.environ.get("DOCAT_SERVE_FILES"):

    @app.route("/doc/<path:path>")
    def serve_local_docs(path):
        return send_from_directory(app.config["UPLOAD_FOLDER"], path)
