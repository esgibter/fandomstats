from flask_frozen import Freezer
from application import create_app
import os

"""
Build a static version of the fandomstats site.

(no direct use anymore, retained as a backup option)
"""

os.environ['F_STATIC'] = 'True'
app = create_app()

app.config.update(
  FREEZER_RELATIVE_URLS=True,
  FREEZER_DESTINATION='../../build'
)

freezer = Freezer(app)

if __name__ == '__main__':
  print(freezer.all_urls())
  freezer.freeze()
