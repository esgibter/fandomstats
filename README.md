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

#### Run the app:
```
dev_appserver.py src/
```
Environment runs at http://localhost:8080

### Run tests:
```
python apptests.py path/to/your/googleappengine/installation
```

### Deploy the app:
```
appcfg.py update src/
```
