from bs4 import BeautifulSoup
import urllib2
# import urllib
# import urllib.parse
import re


class AO3Media:

  def __init__(self, args):
    self.args = args

  def isUmbrella(self, fandom):
    umbrella = False
    if fandom == "Marvel":
      umbrella = True
    for u in self.args['umbrella_terms']:
      if u in fandom:
        umbrella = True

    return umbrella

  def getStats(self):
    self.fandomsByCategory = {}
    self.topFandoms = {}
    self.output = {
        "fandoms_found": 0,
        "stats": {}
    }

    for category in self.args['media_categories']:
      # SET UP THE DICTIONARY FOR THIS CATEGORY
      self.fandomsByCategory[category] = {}

      # FETCH THE AO3 PAGE WITH ALL THE FANDOMS FOR THIS CATEGORY
      modifiedCategory = category.replace(" ", "%20")
      modifiedCategory = modifiedCategory.replace("&", "*a*")
      url = "http://archiveofourown.org/media/" + modifiedCategory + "/fandoms"

      try:
        r = urllib2.urlopen(url)
      except ValueError:
        raise ValueError(400, "Bad URL: " + url)

      if r.getcode() == 404:
          raise ValueError(404, '')
      soup = BeautifulSoup(r)
      soup.prettify()

      # ITERATE THROUGH ALL FANDOMS LISTED ON THE PAGE AND SAVE THEIR NAMES AND
      # SIZES
      fandominfo = soup.find_all('li')
      for fi in fandominfo:
        matchObj = re.search(r'<a class=\"tag\".*>(.*)</a>.*\(([0-9]+)\)', str(fi), re.I | re.S)

        if not matchObj:
          # not a fandom, skip it
          continue

        fandom = matchObj.group(1)
        # IF IT PASSES A THRESHOLD...
        numworks = int(matchObj.group(2))
        if numworks >= self.args['min_fandom_size']:
          print "%s: %d" % (fandom, numworks)
        # PUT IT IN THE CATEGORY DICTIONARY
          if self.args['include_umbrella_fandoms']:
            self.fandomsByCategory[category][fandom] = numworks
          else:
            if not self.isUmbrella(fandom):
              self.fandomsByCategory[category][fandom] = numworks

      print self.fandomsByCategory

    for category in sorted(self.args['media_categories']):
      print "TOP FANDOMS: %s" % category
      self.output["stats"][category] = {}
      self.output["fandoms_found"] = self.output["fandoms_found"] + len(category)
      catFandoms = self.fandomsByCategory[category]
      i = 1
      for key, value in sorted(catFandoms.iteritems(), key=lambda(k, v): (v, k), reverse=True):
          self.output["stats"][category][key] = value
          print "%d) %s: %s" % (i, key, value)
          # PUT IT IN THE TOP FANDOM DICTIONARY
          self.topFandoms[key] = value
          if i >= self.args['num_fandoms']:
              break
          i = i + 1

      print " "

    # DISPLAY THE TOP FANDOMS OVERALL
    i = 1
    print "TOP FANDOMS OVERALL"
    self.output["stats"]['_combined'] = {}
    for key, value in sorted(self.topFandoms.iteritems(), key=lambda(k, v): (v, k), reverse=True):
      print "%d) %s: %s" % (i, key, value)
      self.output["stats"]['_combined'][key] = value
      if i >= self.args['num_fandoms']:
          break
      i = i + 1

    return self.output
