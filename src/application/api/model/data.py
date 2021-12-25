# coding=utf-8

import re
from bs4 import BeautifulSoup
import requests
import urllib
from flask_restful import abort
from flask import redirect


class AO3data:
  # ********* DATA FIELDS
  htmlData = {}
  request_url = ""

  def __init__(self,req_url):
      self.request_url = req_url
      #save the request url to generate proper API url if the tag is non-canonical.

  # METHOD: fetchHTML
  def fetchHTML(self, url):
    if self.htmlData == {}:
      try:
          r = requests.get(url)
      except ValueError:
        raise ValueError(400,"")

      r.raise_for_status()

      final_url = r.url

      if final_url == url:
        soup = BeautifulSoup(r.text, "html.parser")
        soup.prettify()
        self.htmlData = soup
        return self.htmlData
      
      # this tag cannot be filtered on
      if (final_url.find("/works") == -1):
        raise ValueError(404, "")
      else:
        #it's a "synned" tag (e.g. it's a synonym and AO3 automatically redirects)
        # import pdb
        # pdb.set_trace()
        canonical_url = final_url
        canonical_list = canonical_url.split("/")
        canonical_tag = canonical_list[len(canonical_list)-2]
        canonical_tag = urllib.parse.unquote_plus(canonical_tag)
        raise ValueError(302,canonical_tag)

  # Scrape the top 10 ratings, etc from sidebar
  def getTopInfo(self, url):
    topInfo = {
      "numworks": -1,
      "stats": {
        "rating": {
            "General Audiences": 0,
            "Teen And Up Audiences": 0,
            "Mature": 0,
            "Explicit": 0,
            "Not Rated": 0
            },
        "archive_warning": {
            "Major Character Death": 0,
            "Graphic Depictions Of Violence": 0,
            "Underage": 0,
            "Rape/Non-Con": 0,
            "Creator Chose Not To Use Archive Warnings": 0,
            "No Archive Warnings Apply": 0
            },
        "category": {
            "Gen": 0,
            "F/F": 0,
            "F/M": 0,
            "M/M": 0,
            "Multi": 0,
            "Other": 0,
            },
        "fandom": {},
        "character": {},
        "relationship": {},
        "freeform": {}
      }
    }

    try:
        soup = self.fetchHTML(url)

    except ValueError as err:
          code, canonical = err.args
          if code ==302:
              proper_api_request = re.sub(
                  "(?<=tag_id\=)(.*?)((?=&)|$)", urllib.parse.quote(canonical), self.request_url)
              # redirect to correct tag
              return redirect(proper_api_request)
          elif code == 404:
              #HTTP Status Code: 404 Not Found
              abort(404, status=404, message="This tag cannot be filtered on.")
          elif code == 400:
              #HTTP Status Code: 400 Bad request. Do not re-run again without modifying.
              abort(400, status=400, message="Malformed Ao3 URL. No results found at {}".format(url))
          else:
              #HTTP Status Code: 500 Internal Server Error. Something went wrong on our side.
              abort(500, status=500, message="HTTP request failed when trying to scrape Ao3!")

    for k in topInfo["stats"].keys():
      idstring = "include_{}_tags".format(k)

      try:
        top = soup.findAll("dd", {"id": idstring})[0]
      except:
        abort(400, status=400, message="Malformed Ao3 URL. No results found at {}".format(url))
        #this catches also when the tag doesn't exist (404)

      labels = top.find_all("label")
      for L in labels:
        tmp = re.compile('(.*) \(([0-9]+)\)')
        m = tmp.match(L.text.strip())
        topInfo["stats"][k][m.group(1)] = int(m.group(2))

    # Scrape the number of works returned
    try:
      tag = soup.find_all(text=re.compile("Work(s)*( found)* in"))[0]
    except AttributeError:
      topInfo["numworks"] = -2
      return

    nums = re.findall('([0-9]+)', tag)
    topInfo["numworks"] = int(nums[-1])

    return topInfo