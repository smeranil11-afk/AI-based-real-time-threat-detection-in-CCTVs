import zipfile, json
z = zipfile.ZipFile(r'Violence-Detection--main.zip')
vids = sorted([f.filename for f in z.filelist if f.filename.endswith(('.mp4', '.avi', '.mov', '.mkv'))])
with open('zip_vids.json', 'w') as f:
    json.dump(vids, f, indent=2)
