import os
import tempfile
from zipfile import ZipFile
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

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

    print(project)
    print(version)

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

    resp = jsonify({'message': 'File successfully uploaded'})
    resp.status_code = 201
    return resp
