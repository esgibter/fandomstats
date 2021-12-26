fandomstats
===========

**UPDATE:** Fandomstats is currently in the process of migrating from Google App Engine to a different host. In the meantime, we're using Flask_Frozen to generate a static version, which we serve from a regular shared hosting.

You can still clone the app and run it locally if you want to use the API or see the graphs - see steps below.

## Development

### Requirements

* python>=3.4. (tested with 3.8.5)
* pip (comes with python3.4+)

### Install

1. Create a virtualenv
    1. `python3 -m venv venv`
    2. `. venv/bin/activate`
2. Install dependencies: `pip install -r requirements.txt`
3. Generate secret keys for CSRF protection by running `generate_keys.py` script at `src/application/generate_keys.py`, which will generate the secret keys module at `src/application/secret_keys.py`
4. Set Flask environment variables:
    * `FLASK_APP=src/app.py`
    * `FLASK_ENV=development`


### Run 

`flask run`

The app is served at `localhost:5000`

Or, if you want to build the static files: `cd src && python3 build.py`

### Tests

**WIP**, currently broken. Should work like this:

```
python apptest.py path/to/your/googleappengine/installation
```

If you want to run only one test class or only some of the tests (i.e. only the integration tests), you can use the --test-pattern argument, like this:

```
python apptest.py path/to/your/googleappengine/installation --test-pattern=integration*
python apptest.py path/to/your/googleappengine/installation --test-pattern=Ao3data_test.py
```

### Deploy the app

We don't have a deploy process right now. (My idea is to set up GitHub actions, but... who knows.)
