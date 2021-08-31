from flask_frozen import Freezer
from application import create_app

app = create_app(static=True)

app.config.update(
  FREEZER_RELATIVE_URLS=True,
  FREEZER_DESTINATION='../../build'
)

freezer = Freezer(app)

if __name__ == '__main__':
  print(freezer.all_urls())
  freezer.freeze()
