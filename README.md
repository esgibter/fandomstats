fandomstats
===========

The primary feature of fandomstats is a JSON REST API that uses website scraping to gather information about works on the fannish website Archive Of Our Own.

Beside that, it also offers a graphing frontend for this API, some documentation, as well as other tools: the [AO3 bookmark viewer](https://fandomstats.org/ao3-bookmark-viewer/) and [Random AO3 work search](https://fandomstats.org/ao3-random-work/).

The project is not in active development anymore, but the goal is to keep it running as long as possible - if you notice it's not working, or find a major bug, please [create an issue](https://github.com/esgibter/fandomstats/issues).

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
