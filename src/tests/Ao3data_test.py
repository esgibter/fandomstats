import os,sys
sys.path.insert(1, os.path.join(os.path.abspath('.'), 'lib'))
import application as fandomstats
import unittest
import tempfile
from werkzeug import datastructures
from application.api.tags import AO3data


class Ao3dataTestCase(unittest.TestCase):

    def setUp(self):
      fandomstats.app.config['TESTING'] = True
      fandomstats.app.config['DEBUG'] = True
      self.app = fandomstats.app.test_client()
      self.maxDiff = None

    def test_fetchHTML_very_bad_url(self):
        url = "boingboing"
        a = AO3data(url)

        with self.assertRaises(ValueError) as context:
            data = a.fetchHTML(url)

        self.assertEquals(context.exception.args[0], 400)

    def test_fetchHTML_nonexistent_tag(self):
        url = "https://archiveofourown.org/works?tag_id=boingboing"
        a = AO3data(url)

        with self.assertRaises(ValueError) as context:
            data = a.fetchHTML(url)

        self.assertEquals(context.exception.args[0], 404)

    @unittest.skip("not yet")
    def test_fetchHTML_basic(self):
        url = "https://archiveofourown.org/works?tag_id=Harry+Potter"
        expected = []
        a = AO3data(url)
        self.assertEqual(a.fetchHTML(url), expected)


if __name__ == '__main__':
    unittest.main()
