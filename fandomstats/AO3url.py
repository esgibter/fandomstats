import urllib
import urllib3

class AO3url:
  ''' 
  filters object:
  {
    "type": "works" #either works or tags
    "params": {
      "tag_id": "",
      "work_search": {
        "sort_column": "",
        "warning_ids": []
      }
    }
  }
  '''

  def __init__(self, filters):
    self.filters = filters

  def getUrl(self):
    url = "http://archiveofourown.org/"
    url += self.filters['type'] + "?"
    for k, v in self.filters['params'].iteritems():
      if type(v) is dict:
        for wk, wv in v.iteritems():
          if type(wv) is list:
            for xv in wv:
              # go through each value
              url += urllib.quote_plus("work_search[" + wk + "][]") + "=" + urllib.quote_plus(str(xv)) + "&"
          else:
            url += urllib.quote_plus("work_search[" + wk + "]") + "=" + urllib.quote_plus(str(wv)) + "&"
      else:
        url += k + "=" + urllib.quote_plus(str(v)) + "&" 
    return url[:-1]
