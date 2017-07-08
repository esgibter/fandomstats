fandomstats
===========
Fandomstats runs on Google App Engine. 

#### Dev Setup
1. Install Dependencies
  1. python
  2. pip: `python get-pip.py`
  3. Everything else: from the top level folder run: `pip install -r dependencies.txt`
2. Generate secret keys for CSRF protection by running `generate_keys.py` script at `src/application/generate_keys.py`, which will generate the secret keys module at `src/application/secret_keys.py`
3. Install the latest Google App Engine SDK from: https://cloud.google.com/sdk/
  1. run `curl https://sdk.cloud.google.com | bash` and follow the prompts
  2. restart your terminal (so the $PATH updates)
  3. authenticate to Google Cloud Platform by running `gcloud auth login`
  4. test running the app with dev_appserver.py (below). If you get "command not found":
  5. check if the Python components are installed: `gcloud components list` (it's in the first table)
  6. if not, install them with `gcloud components update pkg-python`

#### Run the app:

```
gcloud preview app run src/app.yaml
```
(it might ask you to 'set your project' - use the application ID in app.yaml)

Old way of doing this (might work if you haven't updated GAE recently):
```
dev_appserver.py src/
```
Environment runs at http://localhost:8080

### Run tests:
```
python apptest.py path/to/your/googleappengine/installation
```

### Deploy the app:
```
appcfg.py update src/