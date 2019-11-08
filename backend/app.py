import os
import tempfile
from zipfile import ZipFile
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
from subprocess import run

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = "./upload"
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB


@app.route("/api/<project>/<version>", methods=['POST'])
def upload(project, version):
    if 'file' not in request.files:
        resp = jsonify({'message': 'No file part in the request'})
        resp.status_code = 400
        return resp
    file = request.files['file']

    if file.filename == '':
        resp = jsonify({'message': 'No file selected for uploading'})
        resp.status_code = 400
        return resp

    filename = secure_filename(file.filename)
    file_ext = filename.rsplit('.', 1)[1].lower()
    base_path = os.path.join(app.config['UPLOAD_FOLDER'], project, version)

    if not os.path.exists(base_path):
        os.makedirs(base_path)

    if file_ext == 'zip':
        with tempfile.TemporaryDirectory() as temp_dir:
            zip_path = os.path.join(temp_dir, filename)
            file.save(zip_path)

            with ZipFile(zip_path, 'r') as zipf:
                zipf.extractall(path=base_path)
    else:
        file.save(os.path.join(base_path, filename))

    # ensure nginx config
    nginx_location = "/etc/nginx/locations.d"
    nginx_config = os.path.join(nginx_location, "{}-doc.conf".format(project))
    if not os.path.exists(nginx_config):
        project_base_path = os.path.join(app.config['UPLOAD_FOLDER'], project)
        out_parsed_template = render_template("nginx-doc.conf",
                                              project=project,
                                              dir_path=project_base_path)
        with open(nginx_config, "w") as f:
                f.write(out_parsed_template)
        run(["sudo", "/bin/systemctl", "reload", "nginx.service"])

    resp = jsonify({'message': 'File successfully uploaded'})
    resp.status_code = 201
    return resp
