# coding=utf-8
import urllib
import re

class AO3url:
  # default filters object
  def getFilters(self):
    return self.filters

  def quote(self,input):
      stringed = str(input)          

      return urllib.parse.quote_plus(stringed, '+')

  def getUrl(self, filters=None):
    if filters is None:
      filters = self.filters
    else:
      self.filters = filters
    # Creates URL from search parameters
    url = "https://archiveofourown.org/"
    url += self.filters['type'] + "?"
    for k, v in self.filters['params'].items():
      if type(v) is dict:
        for wk, wv in v.items():
          if type(wv) is list:
            quoted_list = []
            for xv in wv:
                quoted_list.append(self.quote(xv))
            url += urllib.parse.quote_plus("work_search[" + wk + "]") + "=" + "%2C".join(quoted_list) + "&"

          else:
            url += urllib.parse.quote_plus("work_search[" + wk + "]") + "=" + self.quote(wv) + "&"
      else:
          url += k + "=" + self.quote(v) + "&"


    return url[:-1]

  @staticmethod
  def tag_from_url(url):
    url_parts = url.split("/")
    tag = url_parts[len(url_parts)-2]
    tag = urllib.parse.unquote_plus(tag)
    return tag

  @staticmethod
  def replace_tag_in_url(url, tag):
    return re.sub("(?<=tag_id\=)(.*?)((?=&)|$)", urllib.parse.quote(tag), url)

  @staticmethod
  def change_page(url, new_page):
    return re.sub("(page=\d+)", f"page={new_page}", url)


  def setFilters(self, urlArgs):
    # This sets the filters object from a list of URL arguments
    self.filters = {
               "type":"works",
               "params": {
                          "tag_id": "",
                          "utf8":"✓",
                          "page": 1,
                          "sort_direction": "asc",
                          "work_search": {}
                          }
               }
    for k, v in urlArgs.items():
      if v != None:
        if k == "tag_id" or k == "page" or k == "sort_direction":
          self.filters["params"][k] = v
        else:
          self.filters["params"]["work_search"][k] = v

