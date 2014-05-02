import os
import fandomstats
import unittest
import tempfile

class FandomstatsTestCase(unittest.TestCase):
    
    def setUp(self):
       s = AO3search.AO3data()
       s.tag_id = 'Lola'
       s.createSearchURL()
       s.getTopInfo() 
        
if __name__ == '__main__':
    unittest.main()